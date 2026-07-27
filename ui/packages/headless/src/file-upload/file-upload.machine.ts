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

/**
 * accept 归一成小写、去空的 token 列表。
 * 整串（'image/*,.pdf'）与数组两种写法在这里合流，往下只有一种形态要处理。
 */
export function normalizeAccept(accept: string | string[] | undefined): string[] {
  if (accept == null)
    return []
  const raw = Array.isArray(accept) ? accept : accept.split(',')
  return raw.map(token => token.trim().toLowerCase()).filter(token => token !== '')
}

/** accept 的 DOM 属性形态：没声明就不产出该属性（不写等于全收，写空串反而会被某些浏览器当成"什么都不收"）。 */
export function acceptAttr(accept: string | string[] | undefined): string | undefined {
  const tokens = normalizeAccept(accept)
  return tokens.length ? tokens.join(',') : undefined
}

/**
 * 这个文件对不对得上 accept。三种写法都要认：
 * - `.png` 扩展名。很多系统给不出 MIME（file.type 是空串），这时只有扩展名判得出来；
 * - `image/*` 通配，按大类前缀比；
 * - `application/pdf` 精确 MIME。
 * 没声明 accept 即全收。
 */
export function acceptsFile(file: File, accept?: string | string[]): boolean {
  const tokens = normalizeAccept(accept)
  if (!tokens.length)
    return true
  const name = file.name.toLowerCase()
  const type = file.type.toLowerCase()
  return tokens.some((token) => {
    // 星号是"全收"的显式写法，别落到下面按前缀比（那样谁都对不上）
    if (token === '*' || token === '*/*')
      return true
    if (token.startsWith('.'))
      return name.endsWith(token)
    // 'image/*' → 前缀 'image/'。类型未知（空串）时不认通配：那等于把所有未知类型都放进来
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
 * 一批文件的准入判定。纯函数：不碰 DOM、不看机器状态，给同样的输入恒得同样的结果。
 *
 * 数量这一条只挡"本来能收下的"：类型或大小已经出局的文件不占名额，
 * 也不该再多报一条"文件太多"——那会把真正的原因埋掉，界面上就成了"明明还有空位却说满了"。
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
 * 字节数格式化成人读的形式（1024 进制）。
 * 不足 1KB 的按整字节报（"512 B" 比 "0.5 KB" 好读），往上保留一位小数并抹掉末尾的 .0。
 * 非法值与负数一律读成 0：文件大小没有"负"这回事，报一个 NaN 出去只会让界面显示成 "NaN B"。
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
  // 四舍五入之后可能正好顶到下一档（1048575 → 1023.999… KB → 1024 KB），再进一位免得出现 "1024 KB"
  if (rounded >= 1024 && unit < FILE_SIZE_UNITS.length - 1) {
    rounded = Math.round((value / 1024) * 10) / 10
    unit++
  }
  return `${rounded} ${FILE_SIZE_UNITS[unit]}`
}

/**
 * 按元素比。默认的 Object.is 在这里不成立：受控时 cell 每次读都要把 prop 拷成新数组，
 * 引用恒不相等——版本号会每读一次自增一次（track 空转），
 * 写入时又会把「列表其实没变」判成变了，onFilesChange 便会重复发。
 * 元素本身按引用比：同名同大小的两个 File 是两个不同的文件，不该被当成同一个。
 */
export function sameFiles(a: readonly File[], b: readonly File[] | undefined): boolean {
  return !!b && a.length === b.length && a.every((file, i) => file === b[i])
}

/**
 * 收一批文件：先过校验，收下的接在 base 后面，被拒的连同原因如实上报。
 * 接受与拒绝两条回调各发各的，且都发——一批里同时有能收的和不能收的是常态。
 * 一个都没收下时不写 context：那样既不会把原列表清空，也不会白发一次 onFilesChange。
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

// 文件列表住在 context 的 cell 里，不编码进 FSM 状态：cell 本身就是受控/非受控的收口点
// （files 给定即受控，读直取 prop、写只发 onFilesChange 不落内部值），
// 因此不需要影子事件与受控守卫。状态位只用来表达"有东西正悬在投放区上方"。
export const fileUploadMachine = createMachine({
  name: 'file-upload',
  context: ({ prop, cell }) => ({
    acceptedFiles: cell<File[]>(() => {
      const controlled = prop('files')
      return {
        // 拷一份：宿主手里那个数组随后可能被就地 push，受控值不该跟着悄悄变
        value: controlled ? [...controlled] : undefined,
        defaultValue: prop('defaultFiles') ? [...prop('defaultFiles')!] : [],
        isEqual: sameFiles,
        onChange: files => prop('onFilesChange')?.({ files }),
      }
    }),
  }),
  initialState: () => 'idle',
  // 增删改与打开选择框在哪个状态发出都一样（拖拽悬停期间照样能点删除），因此挂根级
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
        // 没经过 dragover 直接来的投放（合成事件、自动化）照样收下
        'DROP': { guard: 'canDrop', actions: ['addFiles'] },
      },
    },
    dragging: {
      on: {
        // 悬停期间的每一次 dragover 都不换状态：这里不声明该事件即可，
        // 声明成 target: 'dragging' 反而会把状态位每帧重写一遍
        'DRAG.LEAVE': { target: 'idle' },
        // 无论收不收得下，指针都已经离开了，状态必须回到 idle，否则边框永远亮着
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
        // 整份替换：数量从零开始算，原来那些不占名额
        intake(context, prop, e.files, [])
      },
      addFiles: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'FILES.ADD' && e.type !== 'DROP')
          return
        // 只收一个时新文件替换旧的：这正是原生单文件输入的行为，
        // 否则用户选错了文件之后只能先删再选，而界面上常常压根没有删除按钮
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
      // 打开系统文件选择框只有 input.click() 一条路，这是 DOM 操作：
      // 连接层是纯函数（Vue 在 render 期求值，那时节点还不存在），只能落在这里。
      // 取节点走 getRootNode().getElementById 而不是 scope.getById：后者拿 CSS.escape 拼
      // 属性选择器，而 CSS 这个全局在无头 DOM 环境里常常缺席（缺了当场抛）；
      // 这条路同样经 Scope 拿 root（shadow 里照样找得到），还省掉一次转义
      openFilePicker: ({ scope }) => {
        scope.getRootNode().getElementById(fileUploadHiddenInputId(scope))?.click()
      },
    },
  },
})
