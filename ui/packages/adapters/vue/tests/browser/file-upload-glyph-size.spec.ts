// 文件上传自绘的状态字形——传完那一行行首的对勾、失败那一行行首的警示——是指示符，不是控件内图标：
// 它们是固定状态标记（不是 :empty 兜底，作者的图标顶不掉），与同一行里 icon 档的删除钮并排，
// 走 --xh-control-indicator-* 一族；root 上的 --xh-icon-size（桥自 --xh-file-upload-icon-size，随文 1em）
// 只管作者放进缩略图槽、删除钮里的图标与皮肤画的兜底叉。此前两枚标记读 root 的 --xh-icon-size：
// 随文 1em 落在 14 上下，comfortable 下比 16 的指示符档小一圈、compact 下又不随密度换档。
// 两档密度一起量：两枚标记走指示符档 16 / 14，作者放进缩略图槽里的图标与删除钮里的兜底叉两档都恒随文。
import type { FileUploadFile, FileUploadRemoteFile } from '@xihan-ui/headless'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhFileUploadItem,
  XhFileUploadItemDeleteTrigger,
  XhFileUploadItemName,
  XhFileUploadItemPreview,
  XhFileUploadItemSizeText,
  XhFileUploadList,
  XhFileUploadRoot,
  XhIcon,
} from '../../src'
import { pseudoBox } from './pseudo-box'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

interface UploadScope {
  allFiles: FileUploadFile[]
  addFiles: (files: File[]) => void
}

const REMOTE: FileUploadRemoteFile = { id: 'r1', name: '已传完.png', size: 12_288, type: 'image/png' }

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  delete document.documentElement.dataset.density
  app = null
  host = null
})

function items(): HTMLElement[] {
  return [...host!.querySelectorAll<HTMLElement>('[data-scope=\'file-upload\'][data-part=\'item\']')]
}

function itemOf(state: 'done' | 'error'): HTMLElement {
  const element = items().find(item => item.getAttribute('data-state') === state)
  if (!element)
    throw new Error(`缺少 data-state='${state}' 的 file-upload 条目`)
  return element
}

function authorIcon(label: string): ReturnType<typeof h> {
  return h(XhIcon, { label }, { default: () => h('path', { d: 'M4 12h16' }) })
}

async function tick(): Promise<void> {
  await nextTick()
  await new Promise(resolve => setTimeout(resolve, 0))
  await nextTick()
}

/**
 * 挂两行：远程附件恒 done；本地文件接一个立刻失败的 upload，自动开传后落到 error。
 * 名额缺省只收一个且远程附件占额，放宽到两个本地文件才收得下。
 */
async function mount(density: 'comfortable' | 'compact'): Promise<void> {
  document.documentElement.dataset.density = density
  host = document.createElement('div')
  host.style.inlineSize = '640px'
  document.body.append(host)
  let scope: UploadScope | null = null
  app = createApp({
    render: () => h(XhFileUploadRoot, {
      defaultRemoteFiles: [REMOTE],
      maxFiles: 2,
      upload: () => Promise.reject(new Error('后端 500')),
    }, {
      default: (slot: UploadScope) => {
        scope = slot
        return [
          h(XhFileUploadList, null, () => slot.allFiles.map((file, index) => h(XhFileUploadItem, { key: index, file }, () => [
            // 第一行（远程附件）的缩略图槽里塞作者的 XhIcon：仍按 root 的随文尺
            h(XhFileUploadItemPreview, null, index === 0 ? () => authorIcon('缩略图图标') : undefined),
            h(XhFileUploadItemName),
            h(XhFileUploadItemSizeText),
            h(XhFileUploadItemDeleteTrigger),
          ]))),
        ]
      },
    }),
  })
  app.mount(host)
  await nextTick()
  scope!.addFiles([new File(['abc'], '传失败.txt', { type: 'text/plain' })])
  await tick()
  await tick()
}

function indicatorSize(): number {
  const root = host!.querySelector<HTMLElement>('[data-scope=\'file-upload\'][data-part=\'root\']')!
  const value = Number.parseFloat(getComputedStyle(root).getPropertyValue('--xh-control-indicator-size'))
  expect([14, 16]).toContain(value)
  return value
}

/** root 上的 --xh-icon-size 是随文 1em：按条目字号解析出来的像素值 */
function textGlyphSize(): number {
  const item = items()[0]!
  const value = Number.parseFloat(getComputedStyle(item).fontSize)
  expect(value).toBeGreaterThan(0)
  return value
}

function describeGlyph(box: HTMLElement, pseudo: '::before' | '::after'): string {
  const style = getComputedStyle(box, pseudo)
  const rect = box.getBoundingClientRect()
  return `${box.dataset.part}[${box.dataset.state}]${pseudo} ${style.width}×${style.height} 盒 ${rect.width}×${rect.height}`
}

describe.each(['comfortable', 'compact'] as const)('文件上传自绘状态字形按指示符档取尺（%s）', (density) => {
  it('传完那一行行首的对勾等于 --xh-control-indicator-size', async () => {
    await mount(density)
    const indicator = indicatorSize()
    const done = itemOf('done')
    expect(getComputedStyle(done, '::before').maskImage, '固定状态标记是勾').not.toBe('none')
    const check = pseudoBox(done, '::before')
    const observed = describeGlyph(done, '::before')
    expect(check.width, observed).toBe(indicator)
    expect(check.height, observed).toBe(indicator)
  })

  it('失败那一行行首的警示字形与对勾同尺，等于 --xh-control-indicator-size', async () => {
    await mount(density)
    const indicator = indicatorSize()
    const error = itemOf('error')
    expect(getComputedStyle(error, '::before').maskImage, '固定状态标记是警示').not.toBe('none')
    const warning = pseudoBox(error, '::before')
    const observed = describeGlyph(error, '::before')
    expect(warning.width, observed).toBe(indicator)
    expect(warning.height, observed).toBe(indicator)
  })

  it('两枚标记是固定状态标记：作者塞进条目里的图标顶不掉它们', async () => {
    await mount(density)
    const done = itemOf('done')
    expect(done.childElementCount, '条目里有作者写的部件').toBeGreaterThan(0)
    expect(getComputedStyle(done, '::before').maskImage).not.toBe('none')
  })

  it('作者放进缩略图槽里的 XhIcon 与删除钮里的兜底叉仍按 root 的随文 --xh-icon-size 取尺，不随指示符档变', async () => {
    await mount(density)
    const text = textGlyphSize()
    const done = itemOf('done')
    const svg = done.querySelector<HTMLElement>('[data-scope=\'icon\'][data-part=\'root\']')!
    const rect = svg.getBoundingClientRect()
    expect(rect.width, `缩略图图标 ${rect.width}×${rect.height}`).toBe(text)
    expect(rect.height, `缩略图图标 ${rect.width}×${rect.height}`).toBe(text)
    const remove = done.querySelector<HTMLElement>('[data-scope=\'file-upload\'][data-part=\'item-delete-trigger\']')!
    expect(remove.childNodes.length, '空钮才由皮肤画兜底的叉').toBe(0)
    const close = pseudoBox(remove, '::before')
    expect(close.width, `删除钮兜底叉 ${close.width}×${close.height}`).toBe(text)
    expect(close.height, `删除钮兜底叉 ${close.width}×${close.height}`).toBe(text)
  })
})
