// @vitest-environment jsdom
import type { FileUploadSchema } from '../src/file-upload'
import { normalizeProps } from '@xihan-ui/core'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  acceptsFile,
  connectFileUpload,
  fileUploadMachine,
  formatFileSize,
  normalizeAccept,
  normalizeMaxFiles,
  sameFiles,
  validateFiles,
} from '../src/file-upload'

type Props = FileUploadSchema['props']

/** jsdom 里没有真实文件，构造一个即可：name/type/size 是校验与展示只关心的三项。 */
function makeFile(name: string, type = 'text/plain', size = 8): File {
  return new File(['x'.repeat(size)], name, { type })
}

// 迷你 spreader：与 WC 侧同语义（事件 addEventListener、style 对象逐条写、
// undefined/null/false 视为撤掉属性）。connect 的产出只有真打到节点上才验得到行为。
function applyProps(node: HTMLElement, props: Record<string, unknown>, bound: Map<string, EventListener>): void {
  for (const [key, value] of Object.entries(props)) {
    const isEvent = key.length > 2 && key.startsWith('on') && key[2]! >= 'A' && key[2]! <= 'Z'
    if (isEvent) {
      const name = key.slice(2).toLowerCase()
      const prev = bound.get(name)
      if (prev)
        node.removeEventListener(name, prev)
      if (typeof value === 'function') {
        node.addEventListener(name, value as EventListener)
        bound.set(name, value as EventListener)
      }
      continue
    }
    if (key === 'style' && value !== null && typeof value === 'object') {
      Object.assign(node.style, value as Record<string, string>)
      continue
    }
    if (value === undefined || value === null || value === false) {
      node.removeAttribute(key)
      continue
    }
    node.setAttribute(key, String(value))
  }
}

interface Mounted {
  root: HTMLElement
  label: HTMLLabelElement
  dropzone: HTMLElement
  trigger: HTMLButtonElement
  hidden: HTMLInputElement
  group: HTMLElement
  clear: HTMLButtonElement
  /** 条目节点每次重渲重建，取的时候现查。 */
  items: () => HTMLElement[]
  partIn: (item: HTMLElement, part: string) => HTMLElement
  api: () => ReturnType<typeof connectFileUpload>
  destroy: () => void
}

function mount(props: Props = {}): Mounted {
  const runtime = createVanillaRuntime()
  const service = createService(fileUploadMachine, { props: () => props, runtime })
  runtime.start()

  const root = document.createElement('div')
  const label = document.createElement('label')
  const dropzone = document.createElement('div')
  const trigger = document.createElement('button')
  const hidden = document.createElement('input')
  const group = document.createElement('div')
  const clear = document.createElement('button')
  // trigger 与隐藏输入刻意嵌在投放区内：真实用法里就是这个形状，
  // 「点按钮同时也点到了投放区」「input.click() 冒回投放区」两条回路只有这样才验得到
  dropzone.append(trigger, hidden)
  root.append(label, dropzone, group, clear)
  document.body.appendChild(root)

  const listeners = new Map<HTMLElement, Map<string, EventListener>>()
  const bound = (el: HTMLElement): Map<string, EventListener> => {
    let m = listeners.get(el)
    if (!m) {
      m = new Map()
      listeners.set(el, m)
    }
    return m
  }

  const render = (): void => {
    const api = connectFileUpload(service, normalizeProps)
    applyProps(root, api.getRootProps() as Record<string, unknown>, bound(root))
    applyProps(label, api.getLabelProps() as Record<string, unknown>, bound(label))
    applyProps(dropzone, api.getDropzoneProps() as Record<string, unknown>, bound(dropzone))
    applyProps(trigger, api.getTriggerProps() as Record<string, unknown>, bound(trigger))
    applyProps(hidden, api.getHiddenInputProps() as Record<string, unknown>, bound(hidden))
    applyProps(group, api.getItemGroupProps() as Record<string, unknown>, bound(group))
    applyProps(clear, api.getClearTriggerProps() as Record<string, unknown>, bound(clear))

    // 条目随列表重建（与 WC 宿主由作者按 acceptedFiles 渲染同语义）
    group.textContent = ''
    listeners.delete(group)
    for (const file of api.acceptedFiles) {
      const item = document.createElement('div')
      const preview = document.createElement('div')
      const name = document.createElement('span')
      const size = document.createElement('span')
      const del = document.createElement('button')
      item.append(preview, name, size, del)
      group.appendChild(item)
      applyProps(item, api.getItemProps({ file }) as Record<string, unknown>, bound(item))
      applyProps(preview, api.getItemPreviewProps({ file }) as Record<string, unknown>, bound(preview))
      applyProps(name, api.getItemNameProps({ file }) as Record<string, unknown>, bound(name))
      applyProps(size, api.getItemSizeTextProps({ file }) as Record<string, unknown>, bound(size))
      applyProps(del, api.getItemDeleteTriggerProps({ file }) as Record<string, unknown>, bound(del))
      name.textContent = file.name
      size.textContent = api.getFileSizeText(file)
    }
  }
  // 任一 cell 变化就整体重打，与 WC 宿主的 wire() 同语义
  runtime.subscribe(render)
  render()

  return {
    root,
    label,
    dropzone,
    trigger,
    hidden,
    group,
    clear,
    items: () => [...group.querySelectorAll<HTMLElement>('[data-part="item"]')],
    partIn: (item, part) => item.querySelector<HTMLElement>(`[data-part="${part}"]`)!,
    api: () => connectFileUpload(service, normalizeProps),
    destroy: () => {
      runtime.stop()
      root.remove()
    },
  }
}

const mounted: Mounted[] = []
function open(props: Props = {}): Mounted {
  const m = mount(props)
  mounted.push(m)
  return m
}

afterEach(() => {
  while (mounted.length) mounted.pop()!.destroy()
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

/** 让隐藏输入"选中"若干文件：jsdom 不许直接给 files 赋值，改挂一份只读属性。 */
function pick(m: Mounted, files: File[]): void {
  Object.defineProperty(m.hidden, 'files', { value: files, configurable: true })
  m.hidden.dispatchEvent(new Event('change', { bubbles: true }))
}

/** jsdom 没有 DragEvent 构造器，自己补一份 dataTransfer / relatedTarget。 */
function dragEvent(type: string, init: { files?: File[], relatedTarget?: Node | null } = {}): Event {
  const event = new Event(type, { bubbles: true, cancelable: true })
  Object.defineProperty(event, 'dataTransfer', { value: { files: init.files ?? [] } })
  Object.defineProperty(event, 'relatedTarget', { value: init.relatedTarget ?? null })
  return event
}

function pressKey(el: HTMLElement, key: string): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
  el.dispatchEvent(event)
  return event
}

function names(m: Mounted): string[] {
  return m.api().acceptedFiles.map(f => f.name)
}

describe('file-upload 纯函数 · accept 匹配', () => {
  it('没声明 accept 即全收', () => {
    expect(acceptsFile(makeFile('a.png', 'image/png'))).toBe(true)
    expect(acceptsFile(makeFile('a.png', 'image/png'), '')).toBe(true)
    expect(acceptsFile(makeFile('a.png', 'image/png'), [])).toBe(true)
  })

  it('通配写法按大类前缀比，别的大类一律不收', () => {
    expect(acceptsFile(makeFile('a.png', 'image/png'), 'image/*')).toBe(true)
    expect(acceptsFile(makeFile('a.gif', 'image/gif'), 'image/*')).toBe(true)
    expect(acceptsFile(makeFile('a.pdf', 'application/pdf'), 'image/*')).toBe(false)
    // 类型未知（很多系统给不出 MIME）时通配判不出来，不能靠"空串也算 image"蒙混过关
    expect(acceptsFile(makeFile('a.png', ''), 'image/*')).toBe(false)
  })

  it('扩展名写法只看文件名，类型未知照样判得出来', () => {
    expect(acceptsFile(makeFile('report.PNG', ''), '.png')).toBe(true)
    expect(acceptsFile(makeFile('report.jpeg', ''), '.png')).toBe(false)
    // 扩展名要整段对上，不能被"名字里恰好含 png"蒙过
    expect(acceptsFile(makeFile('pngreport.txt', ''), '.png')).toBe(false)
  })

  it('精确 MIME 写法只认一模一样的类型', () => {
    expect(acceptsFile(makeFile('a.pdf', 'application/pdf'), 'application/pdf')).toBe(true)
    expect(acceptsFile(makeFile('a.png', 'image/png'), 'application/pdf')).toBe(false)
  })

  it('整串与数组两种写法等价，token 前后的空白不算数', () => {
    const file = makeFile('a.pdf', 'application/pdf')
    expect(acceptsFile(file, 'image/*, application/pdf')).toBe(true)
    expect(acceptsFile(file, ['image/*', 'application/pdf'])).toBe(true)
    expect(normalizeAccept(' image/* , .PNG ,, ')).toEqual(['image/*', '.png'])
  })

  it('星号是显式的全收写法', () => {
    expect(acceptsFile(makeFile('a.bin', ''), '*')).toBe(true)
    expect(acceptsFile(makeFile('a.bin', ''), '*/*')).toBe(true)
  })
})

describe('file-upload 纯函数 · 校验', () => {
  it('normalizeMaxFiles 把没给与非法值退回 1，Infinity 保留', () => {
    expect(normalizeMaxFiles(undefined)).toBe(1)
    expect(normalizeMaxFiles(0)).toBe(1)
    expect(normalizeMaxFiles(-3)).toBe(1)
    expect(normalizeMaxFiles(Number.NaN)).toBe(1)
    expect(normalizeMaxFiles(3.7)).toBe(3)
    expect(normalizeMaxFiles(Number.POSITIVE_INFINITY)).toBe(Number.POSITIVE_INFINITY)
  })

  it('类型不符的被拒，原因是 type', () => {
    const ok = makeFile('a.png', 'image/png')
    const bad = makeFile('a.pdf', 'application/pdf')
    const result = validateFiles([ok, bad], { accept: 'image/*', maxFiles: 5 })
    expect(result.accepted).toEqual([ok])
    expect(result.rejected).toEqual([{ file: bad, reasons: ['type'] }])
  })

  it('超大与过小各报各的原因', () => {
    const big = makeFile('big.txt', 'text/plain', 100)
    const tiny = makeFile('tiny.txt', 'text/plain', 1)
    const result = validateFiles([big, tiny], { maxFiles: 5, maxFileSize: 50, minFileSize: 4 })
    expect(result.accepted).toEqual([])
    expect(result.rejected).toEqual([
      { file: big, reasons: ['size-too-large'] },
      { file: tiny, reasons: ['size-too-small'] },
    ])
  })

  it('多条原因同时成立就一并给出', () => {
    const file = makeFile('huge.pdf', 'application/pdf', 100)
    const result = validateFiles([file], { accept: 'image/*', maxFileSize: 10 })
    expect(result.rejected[0]!.reasons).toEqual(['type', 'size-too-large'])
  })

  it('数量上限连同已有的一起算，溢出的报 too-many-files', () => {
    const a = makeFile('a.txt')
    const b = makeFile('b.txt')
    const c = makeFile('c.txt')
    const result = validateFiles([a, b, c], { maxFiles: 2, existingCount: 1 })
    expect(result.accepted).toEqual([a])
    expect(result.rejected).toEqual([
      { file: b, reasons: ['too-many-files'] },
      { file: c, reasons: ['too-many-files'] },
    ])
  })

  it('出局的文件不占名额，也不再多报一条"太多了"', () => {
    const bad = makeFile('a.pdf', 'application/pdf')
    const good = makeFile('b.png', 'image/png')
    const result = validateFiles([bad, good], { accept: 'image/*', maxFiles: 1 })
    // bad 只报 type（不掺 too-many-files），且没占掉唯一的名额，good 照样收得下
    expect(result.rejected).toEqual([{ file: bad, reasons: ['type'] }])
    expect(result.accepted).toEqual([good])
  })

  it('默认只收一个', () => {
    const a = makeFile('a.txt')
    const b = makeFile('b.txt')
    const result = validateFiles([a, b])
    expect(result.accepted).toEqual([a])
    expect(result.rejected).toEqual([{ file: b, reasons: ['too-many-files'] }])
  })
})

describe('file-upload 纯函数 · 字节数格式化', () => {
  it('边界：0 / 不足 1KB / 正好 1024', () => {
    expect(formatFileSize(0)).toBe('0 B')
    expect(formatFileSize(1)).toBe('1 B')
    expect(formatFileSize(512)).toBe('512 B')
    expect(formatFileSize(1023)).toBe('1023 B')
    expect(formatFileSize(1024)).toBe('1 KB')
  })

  it('逐级进位，保留一位小数且抹掉末尾的 .0', () => {
    expect(formatFileSize(1536)).toBe('1.5 KB')
    expect(formatFileSize(1024 * 1024)).toBe('1 MB')
    expect(formatFileSize(1024 * 1024 * 2.5)).toBe('2.5 MB')
    expect(formatFileSize(1024 ** 3)).toBe('1 GB')
    expect(formatFileSize(1024 ** 4)).toBe('1 TB')
  })

  it('四舍五入顶到下一档时再进一位，不出现 "1024 KB"', () => {
    expect(formatFileSize(1024 * 1024 - 1)).toBe('1 MB')
  })

  it('超大值停在最大单位上继续往大了报', () => {
    expect(formatFileSize(1024 ** 5)).toBe('1 PB')
    expect(formatFileSize(1024 ** 6)).toBe('1024 PB')
  })

  it('负数与非法值一律读成 0，界面上不会出现 NaN', () => {
    expect(formatFileSize(-1)).toBe('0 B')
    expect(formatFileSize(Number.NaN)).toBe('0 B')
    expect(formatFileSize(Number.POSITIVE_INFINITY)).toBe('0 B')
  })

  it('sameFiles 逐个按引用比', () => {
    const a = makeFile('a.txt')
    const b = makeFile('b.txt')
    expect(sameFiles([a, b], [a, b])).toBe(true)
    expect(sameFiles([a], [b])).toBe(false)
    expect(sameFiles([a], undefined)).toBe(false)
    expect(sameFiles([a], [a, b])).toBe(false)
  })
})

describe('fileUploadMachine', () => {
  function service(props: Props = {}) {
    const runtime = createVanillaRuntime()
    const s = createService(fileUploadMachine, { props: () => props, runtime })
    runtime.start()
    return s
  }

  it('fILES.ADD 追加，且接受与拒绝各自通知一次', () => {
    const onFileAccept = vi.fn()
    const onFileReject = vi.fn()
    const s = service({ maxFiles: 3, accept: 'image/*', onFileAccept, onFileReject })
    const png = makeFile('a.png', 'image/png')
    const pdf = makeFile('b.pdf', 'application/pdf')
    s.send({ type: 'FILES.ADD', files: [png, pdf] })
    expect(s.context.get('acceptedFiles')).toEqual([png])
    expect(onFileAccept).toHaveBeenCalledWith({ files: [png] })
    expect(onFileReject).toHaveBeenCalledWith({ files: [{ file: pdf, reasons: ['type'] }] })

    const gif = makeFile('c.gif', 'image/gif')
    s.send({ type: 'FILES.ADD', files: [gif] })
    expect(s.context.get('acceptedFiles')).toEqual([png, gif])
  })

  it('只收一个时新文件替换旧的，而不是被"太多了"挡回去', () => {
    const onFileReject = vi.fn()
    const s = service({ onFileReject })
    const a = makeFile('a.txt')
    const b = makeFile('b.txt')
    s.send({ type: 'FILES.ADD', files: [a] })
    s.send({ type: 'FILES.ADD', files: [b] })
    expect(s.context.get('acceptedFiles')).toEqual([b])
    expect(onFileReject).not.toHaveBeenCalled()
  })

  it('一批里一个都收不下时原列表纹丝不动，也不白发一次 onFilesChange', () => {
    const onFilesChange = vi.fn()
    const s = service({ maxFiles: 3, accept: 'image/*', onFilesChange })
    const png = makeFile('a.png', 'image/png')
    s.send({ type: 'FILES.ADD', files: [png] })
    expect(onFilesChange).toHaveBeenCalledTimes(1)
    s.send({ type: 'FILES.ADD', files: [makeFile('b.pdf', 'application/pdf')] })
    expect(s.context.get('acceptedFiles')).toEqual([png])
    expect(onFilesChange).toHaveBeenCalledTimes(1)
  })

  it('fILES.SET 整份替换、从零算数量；FILE.DELETE 按引用剔除；FILES.CLEAR 清空', () => {
    const s = service({ maxFiles: 3 })
    const a = makeFile('same.txt')
    const b = makeFile('same.txt')
    s.send({ type: 'FILES.SET', files: [a, b] })
    expect(s.context.get('acceptedFiles')).toEqual([a, b])
    // 同名同大小的两个 File 是两个不同的文件：删掉的必须只有传进去的那一个
    s.send({ type: 'FILE.DELETE', file: a })
    expect(s.context.get('acceptedFiles')).toEqual([b])
    s.send({ type: 'FILES.CLEAR' })
    expect(s.context.get('acceptedFiles')).toEqual([])
  })

  it('disabled 时增删改与打开选择框全被守卫挡下', () => {
    const a = makeFile('a.txt')
    const s = service({ maxFiles: 3, defaultFiles: [a], disabled: true })
    s.send({ type: 'FILES.ADD', files: [makeFile('b.txt')] })
    s.send({ type: 'FILE.DELETE', file: a })
    s.send({ type: 'FILES.CLEAR' })
    expect(s.context.get('acceptedFiles')).toEqual([a])
  })

  it('受控 files：宿主不写回则内部纹丝不动，回调照发', () => {
    const controlled = [makeFile('a.txt')]
    const onFilesChange = vi.fn()
    const s = service({ maxFiles: 3, files: controlled, onFilesChange })
    const b = makeFile('b.txt')
    s.send({ type: 'FILES.ADD', files: [b] })
    expect(s.context.get('acceptedFiles')).toEqual(controlled)
    expect(onFilesChange).toHaveBeenCalledWith({ files: [controlled[0], b] })
  })

  it('拖拽状态位：悬停进 dragging，离开与投放都回 idle', () => {
    const s = service({ maxFiles: 3 })
    expect(s.state.get()).toBe('idle')
    s.send({ type: 'DRAG.OVER' })
    expect(s.state.get()).toBe('dragging')
    s.send({ type: 'DRAG.LEAVE' })
    expect(s.state.get()).toBe('idle')
    s.send({ type: 'DRAG.OVER' })
    const file = makeFile('a.txt')
    s.send({ type: 'DROP', files: [file] })
    expect(s.state.get()).toBe('idle')
    expect(s.context.get('acceptedFiles')).toEqual([file])
  })

  it('allowDrop=false / disabled：既不进 dragging，投放也收不下文件', () => {
    for (const props of [{ allowDrop: false }, { disabled: true }]) {
      const s = service({ maxFiles: 3, ...props })
      s.send({ type: 'DRAG.OVER' })
      expect(s.state.get()).toBe('idle')
      s.send({ type: 'DROP', files: [makeFile('a.txt')] })
      expect(s.context.get('acceptedFiles')).toEqual([])
    }
  })

  it('悬停期间关掉投放：DROP 收不下文件，但状态位必须回到 idle', () => {
    let allowDrop = true
    const runtime = createVanillaRuntime()
    const s = createService(fileUploadMachine, { props: () => ({ maxFiles: 3, allowDrop }), runtime })
    runtime.start()
    s.send({ type: 'DRAG.OVER' })
    expect(s.state.get()).toBe('dragging')
    allowDrop = false
    s.send({ type: 'DROP', files: [makeFile('a.txt')] })
    expect(s.context.get('acceptedFiles')).toEqual([])
    // 指针已经离开，高亮边框不能一直亮着
    expect(s.state.get()).toBe('idle')
  })
})

describe('connectFileUpload 属性输出', () => {
  it('隐藏输入是 type=file，name/accept/capture 照写，multiple 由数量上限决定', () => {
    const single = open({ name: 'avatar', accept: ['image/*', '.PNG'] })
    expect(single.hidden.getAttribute('type')).toBe('file')
    expect(single.hidden.getAttribute('name')).toBe('avatar')
    expect(single.hidden.getAttribute('accept')).toBe('image/*,.png')
    expect(single.hidden.hasAttribute('multiple')).toBe(false)
    expect(single.hidden.getAttribute('tabindex')).toBe('-1')
    expect(single.hidden.hasAttribute('webkitdirectory')).toBe(false)

    const many = open({ maxFiles: 5, directory: true, capture: 'user' })
    expect(many.hidden.hasAttribute('multiple')).toBe(true)
    expect(many.hidden.hasAttribute('webkitdirectory')).toBe(true)
    expect(many.hidden.getAttribute('capture')).toBe('user')
    // 没给 name 就不产出该属性，这份输入不参与提交
    expect(many.hidden.hasAttribute('name')).toBe(false)
    expect(many.hidden.hasAttribute('accept')).toBe(false)
  })

  it('label 的 for 指向隐藏输入，点标题即打开选择框', () => {
    const m = open()
    expect(m.label.getAttribute('for')).toBe(m.hidden.getAttribute('id'))
    expect(m.hidden.getAttribute('id')).toBeTruthy()
  })

  it('投放区是可聚焦的按钮，名字优先取 label', () => {
    const m = open()
    expect(m.dropzone.getAttribute('role')).toBe('button')
    expect(m.dropzone.getAttribute('tabindex')).toBe('0')
    expect(m.dropzone.getAttribute('aria-disabled')).toBe('false')
    expect(m.dropzone.getAttribute('aria-labelledby')).toBe(m.label.getAttribute('id'))
    expect(m.dropzone.getAttribute('aria-label')).toBe('Drop files here')
  })

  it('disabled：投放区退出 Tab 序列并显式报 aria-disabled，两个按钮走原生 disabled', () => {
    const m = open({ disabled: true, defaultFiles: [makeFile('a.txt')] })
    expect(m.dropzone.getAttribute('tabindex')).toBe('-1')
    expect(m.dropzone.getAttribute('aria-disabled')).toBe('true')
    expect(m.trigger.hasAttribute('disabled')).toBe(true)
    expect(m.clear.hasAttribute('disabled')).toBe(true)
    expect(m.hidden.hasAttribute('disabled')).toBe(true)
    expect(m.root.getAttribute('data-disabled')).toBe('')
  })

  it('清空按钮在列表为空时带原生 disabled，有文件即解开', () => {
    const m = open({ maxFiles: 3 })
    expect(m.clear.hasAttribute('disabled')).toBe(true)
    expect(m.root.getAttribute('data-empty')).toBe('')
    pick(m, [makeFile('a.txt')])
    expect(m.clear.hasAttribute('disabled')).toBe(false)
    expect(m.root.getAttribute('data-empty')).toBeNull()
  })

  it('条目把文件名与字节数挂成属性，预览按类型分档，删除按钮的名字带上文件名', () => {
    const m = open({ maxFiles: 3 })
    pick(m, [makeFile('photo.png', 'image/png', 2048), makeFile('blob.bin', '', 10)])
    const [first, second] = m.items()
    expect(first!.getAttribute('role')).toBe('listitem')
    expect(first!.getAttribute('data-file-name')).toBe('photo.png')
    expect(first!.getAttribute('data-file-size')).toBe('2048')
    expect(m.partIn(first!, 'item-name').getAttribute('title')).toBe('photo.png')
    expect(m.partIn(first!, 'item-size-text').textContent).toBe('2 KB')
    expect(m.partIn(first!, 'item-preview').getAttribute('data-file-type')).toBe('image/png')
    expect(m.partIn(first!, 'item-preview').getAttribute('aria-hidden')).toBe('true')
    expect(m.partIn(first!, 'item-delete-trigger').getAttribute('aria-label')).toBe('Delete photo.png')
    // 类型未知时落成 unknown，皮肤才分得开"未知类型"与"属性没写"
    expect(m.partIn(second!, 'item-preview').getAttribute('data-file-type')).toBe('unknown')
    expect(m.group.getAttribute('role')).toBe('list')
  })

  it('translations 覆盖三处兜底文案', () => {
    const m = open({
      maxFiles: 3,
      defaultFiles: [makeFile('a.txt')],
      translations: {
        dropzone: '把文件拖到这里',
        deleteFile: file => `移除 ${file.name}`,
        clearFiles: '全部移除',
      },
    })
    expect(m.dropzone.getAttribute('aria-label')).toBe('把文件拖到这里')
    expect(m.clear.getAttribute('aria-label')).toBe('全部移除')
    expect(m.partIn(m.items()[0]!, 'item-delete-trigger').getAttribute('aria-label')).toBe('移除 a.txt')
  })
})

describe('connectFileUpload 打开选择框', () => {
  it('点投放区打开选择框', () => {
    const m = open()
    const click = vi.spyOn(m.hidden, 'click').mockImplementation(() => {})
    m.dropzone.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(click).toHaveBeenCalledTimes(1)
  })

  it('点 trigger 只打开一次：冒到投放区的那一下不能再算一次', () => {
    const m = open()
    const click = vi.spyOn(m.hidden, 'click').mockImplementation(() => {})
    m.trigger.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(click).toHaveBeenCalledTimes(1)
  })

  it('隐藏输入自己的 click 不冒回投放区，否则 click → 打开 → click 闭成死循环', () => {
    const m = open()
    const click = vi.spyOn(m.hidden, 'click').mockImplementation(() => {})
    m.hidden.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(click).not.toHaveBeenCalled()
  })

  it('投放区上 Enter / Space 打开选择框并拦下默认行为，别的键放行', () => {
    const m = open()
    const click = vi.spyOn(m.hidden, 'click').mockImplementation(() => {})
    expect(pressKey(m.dropzone, 'Enter').defaultPrevented).toBe(true)
    expect(pressKey(m.dropzone, ' ').defaultPrevented).toBe(true)
    expect(click).toHaveBeenCalledTimes(2)
    const other = pressKey(m.dropzone, 'a')
    expect(other.defaultPrevented).toBe(false)
    expect(click).toHaveBeenCalledTimes(2)
  })

  it('disabled 时点投放区、按 Enter 都打不开（投放区用 aria-disabled，处理器照样跑得到）', () => {
    const m = open({ disabled: true })
    const click = vi.spyOn(m.hidden, 'click').mockImplementation(() => {})
    m.dropzone.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    const event = pressKey(m.dropzone, 'Enter')
    expect(click).not.toHaveBeenCalled()
    // 既然什么都没做，就不该顺手把默认行为吞掉
    expect(event.defaultPrevented).toBe(false)
  })

  it('api.openFilePicker 走同一条路', () => {
    const m = open()
    const click = vi.spyOn(m.hidden, 'click').mockImplementation(() => {})
    m.api().openFilePicker()
    expect(click).toHaveBeenCalledTimes(1)
  })

  it('选择框当场回填也走得通：打开动作是机器 action，回填在它里面又发一次事件', () => {
    // 真实浏览器里选择框是异步的，但换成同步回填就把最险的那条路径逼出来了：
    // 打开的动作还在跑，收文件的事件已经进来——机器必须把它排到队尾而不是就地递归
    const m = open({ maxFiles: 3 })
    vi.spyOn(m.hidden, 'click').mockImplementation(() => {
      Object.defineProperty(m.hidden, 'files', { value: [makeFile('a.txt')], configurable: true })
      m.hidden.dispatchEvent(new Event('change', { bubbles: true }))
    })
    m.dropzone.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(names(m)).toEqual(['a.txt'])
    expect(m.items()).toHaveLength(1)
  })
})

describe('connectFileUpload 选择与删除', () => {
  it('选择框回来的文件进列表，输入框随即被拨空（同一个文件才选得了第二次）', () => {
    const m = open({ maxFiles: 3 })
    pick(m, [makeFile('a.txt'), makeFile('b.txt')])
    expect(names(m)).toEqual(['a.txt', 'b.txt'])
    expect(m.items()).toHaveLength(2)
    expect(m.hidden.value).toBe('')
  })

  it('删除按钮只删自己那一条', () => {
    const m = open({ maxFiles: 3 })
    pick(m, [makeFile('a.txt'), makeFile('b.txt')])
    m.partIn(m.items()[0]!, 'item-delete-trigger').click()
    expect(names(m)).toEqual(['b.txt'])
    expect(m.items()).toHaveLength(1)
  })

  it('清空按钮清掉整份列表', () => {
    const m = open({ maxFiles: 3 })
    pick(m, [makeFile('a.txt'), makeFile('b.txt')])
    m.clear.click()
    expect(names(m)).toEqual([])
    expect(m.items()).toHaveLength(0)
  })

  it('api 的命令式出口与部件走同一条写入口', () => {
    const m = open({ maxFiles: 3 })
    const a = makeFile('a.txt')
    m.api().setFiles([a, makeFile('b.txt')])
    expect(names(m)).toEqual(['a.txt', 'b.txt'])
    m.api().deleteFile(a)
    expect(names(m)).toEqual(['b.txt'])
    m.api().clearFiles()
    expect(m.api().empty).toBe(true)
  })
})

describe('connectFileUpload 拖拽', () => {
  it('悬停打上 data-dragging 并拦下默认行为，离开即撤掉', () => {
    const m = open({ maxFiles: 3 })
    const over = dragEvent('dragover')
    m.dropzone.dispatchEvent(over)
    // 不拦下 dragover，浏览器压根不会派 drop
    expect(over.defaultPrevented).toBe(true)
    expect(m.dropzone.getAttribute('data-dragging')).toBe('')
    expect(m.root.getAttribute('data-dragging')).toBe('')
    m.dropzone.dispatchEvent(dragEvent('dragleave'))
    expect(m.dropzone.getAttribute('data-dragging')).toBeNull()
  })

  it('指针挪到区内的子节点上不算离开，高亮不闪', () => {
    const m = open({ maxFiles: 3 })
    m.dropzone.dispatchEvent(dragEvent('dragover'))
    m.dropzone.dispatchEvent(dragEvent('dragleave', { relatedTarget: m.trigger }))
    expect(m.dropzone.getAttribute('data-dragging')).toBe('')
  })

  it('投放收下文件、撤掉高亮，并拦下浏览器直接打开文件的默认行为', () => {
    const m = open({ maxFiles: 3 })
    m.dropzone.dispatchEvent(dragEvent('dragover'))
    const drop = dragEvent('drop', { files: [makeFile('a.txt'), makeFile('b.txt')] })
    m.dropzone.dispatchEvent(drop)
    expect(drop.defaultPrevented).toBe(true)
    expect(names(m)).toEqual(['a.txt', 'b.txt'])
    expect(m.dropzone.getAttribute('data-dragging')).toBeNull()
  })

  it('投放的文件照样过校验，被拒的连原因一起上报', () => {
    const onFileReject = vi.fn()
    const m = open({ maxFiles: 3, accept: 'image/*', onFileReject })
    const pdf = makeFile('a.pdf', 'application/pdf')
    m.dropzone.dispatchEvent(dragEvent('drop', { files: [pdf] }))
    expect(names(m)).toEqual([])
    expect(onFileReject).toHaveBeenCalledWith({ files: [{ file: pdf, reasons: ['type'] }] })
  })

  it('allowDrop=false：不拦默认行为、不出 data-dragging、投放也收不下', () => {
    const m = open({ maxFiles: 3, allowDrop: false })
    const over = dragEvent('dragover')
    m.dropzone.dispatchEvent(over)
    expect(over.defaultPrevented).toBe(false)
    expect(m.dropzone.getAttribute('data-dragging')).toBeNull()
    const drop = dragEvent('drop', { files: [makeFile('a.txt')] })
    m.dropzone.dispatchEvent(drop)
    expect(drop.defaultPrevented).toBe(false)
    expect(names(m)).toEqual([])
  })
})
