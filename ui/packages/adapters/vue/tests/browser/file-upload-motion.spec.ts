// 文件上传的传输收尾与列表动效：传完那一刻进度条先走满、再淡出，播完才藏起，行首对号随后淡入；
// 首帧就在的文件直接呈现，新收下的一批按到达顺序错开进场，删掉的那一行由替身在原处淡出。
// 过渡与动画是否真的在播、填充此刻落在哪、替身身上的行首标记只有真实浏览器量得出：jsdom 不排版、不跑 CSS 动效。
import type { FileUploadFile, FileUploadRemoteFile, FileUploadRequest } from '@xihan-ui/headless'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhFileUploadItem,
  XhFileUploadItemDeleteTrigger,
  XhFileUploadItemName,
  XhFileUploadItemProgress,
  XhFileUploadList,
  XhFileUploadRoot,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

interface UploadScope {
  allFiles: FileUploadFile[]
  addFiles: (files: File[]) => void
  deleteFile: (file: FileUploadFile) => void
}

interface Pending {
  onProgress: (progress: number) => void
  resolve: () => void
}

const REMOTE: FileUploadRemoteFile = { id: 'r1', name: '已传完.png', size: 12_288, type: 'image/png' }
const ITEM = `[data-scope='file-upload'][data-part='item']`
const PROGRESS = `[data-scope='file-upload'][data-part='item-progress']`

let app: App | null = null
let host: HTMLElement | null = null
let scope: UploadScope | null = null
const pending = new Map<string, Pending>()

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
  scope = null
  pending.clear()
})

/** 元素身上浏览器实际起播的 CSS 关键帧动画名。 */
function running(el: Element): string[] {
  return el.getAnimations().filter(a => a instanceof CSSAnimation).map(a => (a as CSSAnimation).animationName)
}

/** 令牌当下解析成多少毫秒。 */
function tokenMs(name: string): number {
  const probe = document.createElement('div')
  probe.style.transitionDuration = `var(${name})`
  document.body.append(probe)
  const value = getComputedStyle(probe).transitionDuration
  probe.remove()
  return value.endsWith('ms') ? Number.parseFloat(value) : Number.parseFloat(value) * 1000
}

async function until(check: () => boolean, timeout = 2000): Promise<void> {
  await expect.poll(check, { timeout }).toBe(true)
}

async function frame(): Promise<void> {
  await new Promise(resolve => requestAnimationFrame(() => resolve(undefined)))
}

function upload({ file, onProgress }: FileUploadRequest): Promise<void> {
  return new Promise((resolve) => {
    pending.set(file.name, { onProgress, resolve: () => resolve() })
  })
}

/**
 * 挂一个带上传器的文件上传；每行渲染文件名、进度条与删除钮。
 * lateList 为真时列表按有没有文件条件渲染：挂载那一帧没有列表。
 */
async function mount(options: { remote?: boolean, dir?: 'ltr' | 'rtl', lateList?: boolean } = {}): Promise<void> {
  host = document.createElement('div')
  host.style.inlineSize = '480px'
  if (options.dir)
    host.dir = options.dir
  document.body.append(host)
  app = createApp({
    render: () => h(XhFileUploadRoot, {
      defaultRemoteFiles: options.remote ? [REMOTE] : undefined,
      maxFiles: 5,
      upload,
    }, {
      default: (slot: UploadScope) => {
        scope = slot
        if (options.lateList && slot.allFiles.length === 0)
          return []
        return [
          h(XhFileUploadList, null, () => slot.allFiles.map(file => h(XhFileUploadItem, { key: file.name, file }, () => [
            h(XhFileUploadItemName),
            h(XhFileUploadItemProgress),
            h(XhFileUploadItemDeleteTrigger),
          ]))),
        ]
      },
    }),
  })
  app.mount(host)
  await nextTick()
  await nextTick()
  await frame()
}

function items(): HTMLElement[] {
  return [...host!.querySelectorAll<HTMLElement>(`${ITEM}:not([data-state='closed'])`)]
}

function itemNamed(name: string): HTMLElement {
  const el = items().find(item => item.getAttribute('data-file-name') === name)
  if (!el)
    throw new Error(`缺少文件名为 ${name} 的条目`)
  return el
}

function progressOf(item: HTMLElement): HTMLElement {
  return item.querySelector<HTMLElement>(PROGRESS)!
}

/** 填充在轨道里露出来的那一截：填充与轨道同宽，轨道裁掉平移出去的部分。计算值里的百分比按填充自身的宽度折算。 */
function visibleFill(track: HTMLElement): { start: number, end: number } {
  const box = track.getBoundingClientRect()
  const style = getComputedStyle(track, '::before')
  const raw = style.translate === 'none' ? '0px' : style.translate.split(/\s+/)[0] ?? '0px'
  const shift = raw.endsWith('%') ? Number.parseFloat(raw) / 100 * Number.parseFloat(style.width) : Number.parseFloat(raw)
  const left = Math.max(box.left, box.left + shift)
  const right = Math.min(box.right, box.right + shift)
  return { start: left - box.left, end: right - box.left }
}

async function addUploading(name: string, progress: number): Promise<HTMLElement> {
  scope!.addFiles([new File(['abc'], name, { type: 'text/plain' })])
  await until(() => pending.has(name))
  pending.get(name)!.onProgress(progress)
  await nextTick()
  const item = itemNamed(name)
  await until(() => progressOf(item).getAttribute('data-state') === 'uploading')
  return item
}

describe('文件上传的传输收尾', () => {
  it('传完那一刻进度条留在行里走满，随后淡出，播完才藏起', async () => {
    await mount()
    const item = await addUploading('报告.pdf', 40)
    const track = progressOf(item)
    await until(() => Math.abs(visibleFill(track).end - track.getBoundingClientRect().width * 0.4) < 1)

    pending.get('报告.pdf')!.resolve()
    await until(() => item.getAttribute('data-state') === 'done')
    await frame()

    // 同一帧不收起：进度条还在排布里，状态已翻成 done
    expect(track.hasAttribute('hidden')).toBe(false)
    expect(getComputedStyle(track).display).not.toBe('none')
    expect(track.getAttribute('data-state')).toBe('done')

    // 整条淡出排在走满之后：延后一个 move，时长取 exit
    const fade = track.getAnimations().find(a => a instanceof CSSTransition && a.transitionProperty === 'opacity')
    expect(fade).toBeDefined()
    expect(Number(fade!.effect!.getTiming().delay)).toBe(tokenMs('--xh-motion-duration-move'))
    expect(Number(fade!.effect!.getTiming().duration)).toBe(tokenMs('--xh-motion-duration-exit'))

    // 淡出起步之前填充已经走满
    await until(() => Math.abs(visibleFill(track).end - track.getBoundingClientRect().width) < 1)
    expect(Number.parseFloat(getComputedStyle(track).opacity)).toBeGreaterThan(0.5)

    await until(() => track.hasAttribute('hidden'))
    expect(getComputedStyle(track).display).toBe('none')
  })

  it('行首对号与进度条交叉：条子淡出的同时对号淡入，已经落定的行不再播', async () => {
    await mount()
    const item = await addUploading('合同.docx', 70)
    pending.get('合同.docx')!.resolve()
    await until(() => item.getAttribute('data-state') === 'done')
    await frame()

    const mark = item.getAnimations({ subtree: true })
      .find(a => a instanceof CSSAnimation && (a.effect as KeyframeEffect).pseudoElement === '::before')
    expect(mark).toBeDefined()
    expect((mark as CSSAnimation).animationName).toBe('xh-fade-in')
    expect(Number(mark!.effect!.getTiming().delay)).toBe(tokenMs('--xh-motion-duration-move'))
    expect(Number(mark!.effect!.getTiming().duration)).toBe(tokenMs('--xh-motion-duration-enter'))

    await until(() => progressOf(item).hasAttribute('hidden'))
    await frame()
    expect(item.getAnimations({ subtree: true }).filter(a => a instanceof CSSAnimation)).toEqual([])
    expect(getComputedStyle(item, '::before').opacity).toBe('1')
  })

  it('从右往左书写时填充从行首（右侧）往行尾推进', async () => {
    await mount({ dir: 'rtl' })
    const item = await addUploading('رفع.txt', 40)
    const track = progressOf(item)
    const width = track.getBoundingClientRect().width
    await until(() => Math.abs(visibleFill(track).start - width * 0.6) < 1)
    expect(Math.abs(visibleFill(track).end - width)).toBeLessThan(1)
  })
})

describe('文件上传的列表动效', () => {
  it('首帧就在的文件直接呈现；列表接上动效之后撤掉 data-instant', async () => {
    await mount({ remote: true })
    const list = host!.querySelector<HTMLElement>(`[data-scope='file-upload'][data-part='list']`)!
    await until(() => !list.hasAttribute('data-instant'))
    const [first] = items()
    expect(first!.hasAttribute('data-instant')).toBe(true)
    expect(running(first!)).toEqual([])
  })

  it('新收下的一批按到达顺序错开进场', async () => {
    await mount({ remote: true })
    scope!.addFiles([new File(['a'], '甲.txt'), new File(['b'], '乙.txt')])
    await nextTick()
    await until(() => items().length === 3)
    const first = itemNamed('甲.txt')
    const second = itemNamed('乙.txt')
    expect(running(first)).toEqual(['xh-item-in'])
    expect(running(second)).toEqual(['xh-item-in'])
    const delay = (el: Element): number => Number(el.getAnimations()[0]!.effect!.getTiming().delay)
    expect(delay(first)).toBe(0)
    expect(delay(second)).toBe(tokenMs('--xh-motion-stagger-step'))
  })

  it('删掉传完的那一行：替身在原处淡出、仍带着行首对号，播完即移除', async () => {
    await mount({ remote: true })
    const gone = items()[0]!
    const goneRect = gone.getBoundingClientRect()
    const markWidth = getComputedStyle(gone, '::before').width
    expect(markWidth).not.toBe('auto')

    scope!.deleteFile(REMOTE)
    await nextTick()
    await until(() => host!.querySelector(`${ITEM}[data-state='closed']`) !== null)
    const ghost = host!.querySelector<HTMLElement>(`${ITEM}[data-state='closed']`)!
    expect(running(ghost)).toEqual(['xh-fade-out'])
    expect(Math.abs(ghost.getBoundingClientRect().top - goneRect.top)).toBeLessThan(1)
    expect(getComputedStyle(ghost, '::before').content).not.toBe('none')
    expect(getComputedStyle(ghost, '::before').width).toBe(markWidth)
    await until(() => !ghost.isConnected)
  })

  it('列表晚于根挂上：后来才出现的列表里的条目照常进场', async () => {
    await mount({ lateList: true })
    expect(host!.querySelector(`[data-scope='file-upload'][data-part='list']`)).toBeNull()
    scope!.addFiles([new File(['a'], '首个.txt')])
    await nextTick()
    await until(() => items().length === 1)
    const list = host!.querySelector<HTMLElement>(`[data-scope='file-upload'][data-part='list']`)!
    expect(list.hasAttribute('data-instant')).toBe(false)
    expect(running(items()[0]!)).toEqual(['xh-item-in'])
  })
})
