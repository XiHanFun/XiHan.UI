// 定位引擎算出的可用空间，有没有真的下发成浮层上的私有槽。
//
// 宿主视口是固定的，改不动，所以换宽度只能靠内嵌 iframe：浮层挂在 iframe 文档里，
// 引擎按那份文档的视口算可用区域，宽度由这边的 width 说了算。
// 皮肤与令牌以 <style> 注入主文档，克隆一份进 iframe 的 head 才生效。
import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import {
  XhCascaderColumn,
  XhCascaderContent,
  XhCascaderItem,
  XhCascaderItemText,
  XhCascaderPositioner,
  XhCascaderRoot,
  XhCascaderTrigger,
  XhCascaderValueText,
  XhPopoverContent,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTrigger,
} from '../../src'
import { provideXhConfig } from '../../src/config/config'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

/** 浮层贴边时留的余量，引擎从可用空间里两边各扣一份。 */
const SHIFT_PADDING = 4

/** 要量的三档视口宽。 */
const WIDTHS = [375, 768, 1280] as const

let frame: HTMLIFrameElement | null = null
let app: App | null = null

/** 在给定宽度的 iframe 里挂一个浮层，返回它的文档。 */
function mountAt(width: number, render: () => VNode): Document {
  frame = document.createElement('iframe')
  frame.style.cssText = `width: ${width}px; height: 600px; border: 0`
  document.body.append(frame)

  const doc = frame.contentDocument
  if (!doc)
    throw new Error('iframe 没有文档')
  for (const node of document.querySelectorAll('style, link[rel="stylesheet"]'))
    doc.head.append(node.cloneNode(true))
  doc.body.style.margin = '0'
  const host = doc.createElement('div')
  doc.body.append(host)

  app = createApp({
    setup() {
      // 浮层默认搬去主文档的落点，那样引擎会按宿主视口算；改挂 iframe 的 body
      provideXhConfig({ portalContainer: () => doc.body })
      return () => render()
    },
  })
  app.mount(host)
  return doc
}

afterEach(() => {
  app?.unmount()
  app = null
  frame?.remove()
  frame = null
})

/** 等浮层落位：坐标要等元素进 DOM 量到尺寸，之后才有可用空间可发。 */
async function positionerAt(doc: Document, scope: string, slot: string): Promise<HTMLElement> {
  const win = doc.defaultView
  if (!win)
    throw new Error('iframe 没有窗口')
  for (let i = 0; i < 120; i += 1) {
    const el = doc.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='positioner']`)
    if (el?.hasAttribute('data-positioned') && el.style.getPropertyValue(slot))
      return el
    await new Promise(resolve => win.requestAnimationFrame(() => resolve(null)))
  }
  const el = doc.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='positioner']`)
  if (!el)
    throw new Error(`iframe 里没有 ${scope} 的 positioner`)
  return el
}

/** 读一个私有槽的像素值；没写这个槽时返回 null。 */
function pxOf(el: HTMLElement, slot: string): number | null {
  const raw = el.style.getPropertyValue(slot).trim()
  return raw.endsWith('px') ? Number.parseFloat(raw) : null
}

const FRUITS = [
  { value: 'apple', label: '苹果' },
  { value: 'banana', label: '香蕉' },
]

function popover(): VNode {
  return h(XhPopoverRoot, { open: true, size: 'lg' }, () => [
    h(XhPopoverTrigger, null, () => '开'),
    h(XhPopoverPositioner, null, () => [h(XhPopoverContent, null, () => '正文')]),
  ])
}

function cascader(): VNode {
  return h(XhCascaderRoot, { open: true, collection: FRUITS }, () => [
    h(XhCascaderTrigger, null, () => [h(XhCascaderValueText)]),
    h(XhCascaderPositioner, null, () => [
      h(XhCascaderContent, null, () => [
        h(XhCascaderColumn, { level: 0 }, () => FRUITS.map(node =>
          h(XhCascaderItem, { key: node.value, value: node.value }, () => [
            h(XhCascaderItemText, null, () => node.label),
          ]),
        )),
      ]),
    ]),
  ])
}

describe('可用宽度下发成私有槽', () => {
  const CASES: [string, () => VNode][] = [
    ['popover', popover],
    ['cascader', cascader],
  ]

  it.each(CASES)('%s 落位后 positioner 上有 available-w', async (scope, render) => {
    const slot = `--xh-_${scope}-available-w`
    const doc = mountAt(375, render)
    const el = await positionerAt(doc, scope, slot)
    expect(pxOf(el, slot)).not.toBeNull()
  })

  it.each(CASES)('%s 的 available-w 贴着 iframe 的碰撞边界逐档变', async (scope, render) => {
    const slot = `--xh-_${scope}-available-w`
    const measured: number[] = []
    for (const width of WIDTHS) {
      const doc = mountAt(width, render)
      const el = await positionerAt(doc, scope, slot)
      const value = pxOf(el, slot)
      // 落在锚点下方：可用宽度是整条可用区域，两边各扣一份贴边余量
      expect(value).toBe(doc.documentElement.clientWidth - SHIFT_PADDING * 2)
      measured.push(value!)
      app?.unmount()
      app = null
      frame?.remove()
      frame = null
    }
    // 三档各不相同：这个数跟着可用区走，不是某个静态档
    expect(new Set(measured).size).toBe(WIDTHS.length)
  })

  it('popover 的 available-h 与 available-w 一起下发', async () => {
    const doc = mountAt(375, popover)
    const el = await positionerAt(doc, 'popover', '--xh-_popover-available-w')
    expect(pxOf(el, '--xh-_popover-available-w')).toBeGreaterThan(0)
    expect(pxOf(el, '--xh-_popover-available-h')).toBeGreaterThan(0)
  })
})
