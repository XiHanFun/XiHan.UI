import type { ContextFacade, PropFn } from '@xihan-ui/machine'
import type {
  FileRejectReason,
  FileUploadRejection,
  FileUploadSchema,
  FileUploadValidationResult,
} from './file-upload.types'
import { setup } from '@xihan-ui/machine'
import { fileUploadHiddenInputId } from './file-upload.anatomy'

const { createMachine } = setup<FileUploadSchema>()

/** 默认只收一个：与原生 `<input type="file">` 不写 multiple 时一致。 */
export const FILE_UPLOAD_MAX_FILES = 1

/** accept 归一成小写、去空的 token 列表，整串与数组两种写法在此合流。 */
export function normalizeAccept(accept: string | string[] | undefined): string[] {
  if (accept == null)
    return []
  const raw = Array.isArray(accept) ? accept : accept.split(',')
  return raw.map(token => token.trim().toLowerCase()).filter(token => token !== '')
}

/** accept 的 DOM 属性形态。不声明即不产出该属性；空串会被某些浏览器当成什么都不收。 */
export function acceptAttr(accept: string | string[] | undefined): string | undefined {
  const tokens = normalizeAccept(accept)
  return tokens.length ? tokens.join(',') : undefined
}

/**
 * 判定文件是否匹配 accept，认三种写法：扩展名（系统给不出 MIME 时只能靠它）、
 * `image/*` 通配、精确 MIME。未声明 accept 即全收。
 */
export function acceptsFile(file: File, accept?: string | string[]): boolean {
  const tokens = normalizeAccept(accept)
  if (!tokens.length)
    return true
  const name = file.name.toLowerCase()
  const type = file.type.toLowerCase()
  return tokens.some((token) => {
    // 星号是全收的显式写法，不走下面的前缀比
    if (token === '*' || token === '*/*')
      return true
    if (token.startsWith('.'))
      return name.endsWith(token)
    // 类型未知（空串）时不认通配，否则所有未知类型都会被放进来
    if (token.endsWith('/*'))
      return type !== '' && type.startsWith(token.slice(0, -1))
    return type !== '' && type === token
  })
}

/** 数量上限归一：没给退回默认 1，非正数与非整数一律按默认处理，Infinity 原样保留（不限）。 */
export function normalizeMaxFiles(max: number | undefined): number {
  if (max == null)
    return FILE_UPLOAD_MAX_FILES
  if (max === Number.POSITIVE_INFINITY)
    return max
  if (!Number.isFinite(max) || max < 1)
    return FILE_UPLOAD_MAX_FILES
  return Math.floor(max)
}

export interface FileValidationOptions {
  accept?: string | string[]
  maxFiles?: number
  maxFileSize?: number
  minFileSize?: number
  /** 列表里已经有几个：数量上限按"已有 + 本批已收下"一起算。 */
  existingCount?: number
}

/**
 * 一批文件的准入判定。纯函数，不碰 DOM 也不看机器状态。
 * 数量上限只作用于本来能收下的文件：类型或大小已出局的不占名额、也不再报一次数量超限。
 */
export function validateFiles(
  files: readonly File[],
  options: FileValidationOptions = {},
): FileUploadValidationResult {
  const maxFiles = normalizeMaxFiles(options.maxFiles)
  const maxSize = options.maxFileSize ?? Number.POSITIVE_INFINITY
  const minSize = options.minFileSize ?? 0
  const accepted: File[] = []
  const rejected: FileUploadRejection[] = []
  let taken = Math.max(options.existingCount ?? 0, 0)

  for (const file of files) {
    const reasons: FileRejectReason[] = []
    if (!acceptsFile(file, options.accept))
      reasons.push('type')
    if (file.size > maxSize)
      reasons.push('size-too-large')
    if (file.size < minSize)
      reasons.push('size-too-small')
    if (!reasons.length && taken >= maxFiles)
      reasons.push('too-many-files')

    if (reasons.length) {
      rejected.push({ file, reasons })
      continue
    }
    accepted.push(file)
    taken++
  }
  return { accepted, rejected }
}

const FILE_SIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'] as const

/**
 * 字节数格式化（1024 进制）。不足 1KB 按整字节，往上保留一位小数并抹掉末尾 .0。
 * 非法值与负数一律读成 0。
 */
export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0)
    return '0 B'
  if (bytes < 1024)
    return `${Math.round(bytes)} B`

  let value = bytes
  let unit = 0
  while (unit < FILE_SIZE_UNITS.length - 1 && value >= 1024) {
    value /= 1024
    unit++
  }
  let rounded = Math.round(value * 10) / 10
  // 四舍五入后可能顶到下一档（1023.999… KB → 1024 KB），再进一位
  if (rounded >= 1024 && unit < FILE_SIZE_UNITS.length - 1) {
    rounded = Math.round((value / 1024) * 10) / 10
    unit++
  }
  return `${rounded} ${FILE_SIZE_UNITS[unit]}`
}

/**
 * 按元素比。受控时 cell 每次读都拷成新数组，用 Object.is 会让版本号空转、
 * 并把没变的列表判成变了导致 onFilesChange 重复发。元素本身按引用比。
 */
export function sameFiles(a: readonly File[], b: readonly File[] | undefined): boolean {
  return !!b && a.length === b.length && a.every((file, i) => file === b[i])
}

/**
 * 收一批文件：先过校验，收下的接在 base 后面，被拒的连同原因上报。
 * 两条回调各发各的、都发。一个都没收下时不写 context。
 */
function intake(
  context: ContextFacade<FileUploadSchema>,
  prop: PropFn<FileUploadSchema>,
  incoming: readonly File[],
  base: readonly File[],
): void {
  const { accepted, rejected } = validateFiles(incoming, {
    accept: prop('accept'),
    maxFiles: prop('maxFiles'),
    maxFileSize: prop('maxFileSize'),
    minFileSize: prop('minFileSize'),
    existingCount: base.length,
  })
  if (accepted.length) {
    context.set('acceptedFiles', [...base, ...accepted])
    prop('onFileAccept')?.({ files: accepted })
  }
  if (rejected.length)
    prop('onFileReject')?.({ files: rejected })
}

// 文件列表住在 context 的 cell 里而非 FSM 状态，cell 收口受控与非受控；
// 状态位只表达有东西悬在投放区上方。
export const fileUploadMachine = createMachine({
  name: 'file-upload',
  context: ({ prop, cell }) => ({
    acceptedFiles: cell<File[]>(() => {
      const controlled = prop('files')
      return {
        // 拷一份：宿主那个数组可能被就地 push
        value: controlled ? [...controlled] : undefined,
        defaultValue: prop('defaultFiles') ? [...prop('defaultFiles')!] : [],
        isEqual: sameFiles,
        onChange: files => prop('onFilesChange')?.({ files }),
      }
    }),
  }),
  initialState: () => 'idle',
  // 增删改与打开选择框在任何状态下行为一致，挂根级
  on: {
    'FILES.SET': { guard: 'canChange', actions: ['setFiles'] },
    'FILES.ADD': { guard: 'canChange', actions: ['addFiles'] },
    'FILE.DELETE': { guard: 'canChange', actions: ['deleteFile'] },
    'FILES.CLEAR': { guard: 'canChange', actions: ['clearFiles'] },
    'PICKER.OPEN': { guard: 'canChange', actions: ['openFilePicker'] },
  },
  states: {
    idle: {
      on: {
        'DRAG.OVER': { guard: 'canDrop', target: 'dragging' },
        // 未经 dragover 直接投放（合成事件、自动化）同样收下
        'DROP': { guard: 'canDrop', actions: ['addFiles'] },
      },
    },
    dragging: {
      on: {
        // 不声明 dragover：声明成 target 会把状态位每帧重写一遍
        'DRAG.LEAVE': { target: 'idle' },
        // 无论收不收得下都回 idle，否则悬停态永不解除
        'DROP': [
          { guard: 'canDrop', target: 'idle', actions: ['addFiles'] },
          { target: 'idle' },
        ],
      },
    },
  },
  implementations: {
    guards: {
      canChange: ({ prop }) => !prop('disabled'),
      canDrop: ({ prop }) => !prop('disabled') && (prop('allowDrop') ?? true),
    },
    actions: {
      setFiles: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'FILES.SET')
          return
        // 整份替换，数量从零开始算
        intake(context, prop, e.files, [])
      },
      addFiles: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'FILES.ADD' && e.type !== 'DROP')
          return
        // 只收一个时新文件替换旧的，与原生单文件输入一致
        const base = normalizeMaxFiles(prop('maxFiles')) === 1 ? [] : context.get('acceptedFiles')
        intake(context, prop, e.files, base)
      },
      deleteFile: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'FILE.DELETE')
          return
        // 按引用剔除：同名同大小的两个 File 是两个不同的文件
        const next = context.get('acceptedFiles').filter(file => file !== e.file)
        context.set('acceptedFiles', next)
      },
      clearFiles: ({ context }) => {
        context.set('acceptedFiles', [])
      },
      // 打开选择框要调 input.click()，属 DOM 操作，connect 是纯函数故落在这里。
      // 取节点走 getRootNode().getElementById 而非 scope.getById：后者依赖的 CSS.escape
      // 在无头 DOM 环境常缺席，缺了当场抛
      openFilePicker: ({ scope }) => {
        scope.getRootNode().getElementById(fileUploadHiddenInputId(scope))?.click()
      },
    },
  },
})
