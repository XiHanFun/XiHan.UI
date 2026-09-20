// 定位引擎算出的可用空间，有没有真的下发成浮层上的私有槽。
//
// 换宽度走 page.viewport：整个测试文档改成那一档宽，引擎按它的视口算可用区域。
// 不再挂进内嵌 iframe——浮层的 Scope 与 Layer 注册表都建在挂载它的那份文档上（48d6b8814 起
// 视觉绑定校验节点与注册表同属一份 Document），从主文档挂进另一份文档不是被支持的接法。
import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
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
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

/** 浮层贴边时留的余量，引擎从可用空间里两边各扣一份。 */
const SHIFT_PADDING = 4

/** 要量的三档视口宽。 */
const WIDTHS = [375, 768, 1280] as const

/** 视口高固定一档，宽按用例换。 */
const HEIGHT = 600

let host: HTMLElement | null = null
let app: App | null = null
let originalViewport: { width: number, height: number } | null = null

/** 把测试文档切到给定宽度，挂一个浮层，返回它所在的文档。 */
async function mountAt(width: number, render: () => VNode): Promise<Document> {
  originalViewport ??= { width: innerWidth, height: innerHeight }
  await page.viewport(width, HEIGHT)
  // 新尺寸到测试文档这一层要过一次排版；引擎按挂载那一刻的视口算，挂早了就是按旧宽度落位
  for (let i = 0; document.documentElement.clientWidth !== width; i += 1) {
    if (i >= 60)
      throw new Error(`视口没有切到 ${width}px（现在是 ${document.documentElement.clientWidth}px）`)
    await new Promise(resolve => requestAnimationFrame(resolve))
  }
  host = document.createElement('div')
  document.body.append(host)

  app = createApp({ setup: () => () => render() })
  app.mount(host)
  return document
}

function unmount(): void {
  app?.unmount()
  app = null
  host?.remove()
  host = null
}

afterEach(async () => {
  unmount()
  if (originalViewport)
    await page.viewport(originalViewport.width, originalViewport.height)
  originalViewport = null
})

/** 等浮层落位：坐标要等元素进 DOM 量到尺寸，之后才有可用空间可发。 */
async function positionerAt(doc: Document, scope: string, slot: string): Promise<HTMLElement> {
  const win = doc.defaultView
  if (!win)
    throw new Error('文档没有窗口')
  for (let i = 0; i < 120; i += 1) {
    const el = doc.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='positioner']`)
    if (el?.hasAttribute('data-positioned') && el.style.getPropertyValue(slot))
      return el
    await new Promise(resolve => win.requestAnimationFrame(() => resolve(null)))
  }
  const el = doc.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='positioner']`)
  if (!el)
    throw new Error(`文档里没有 ${scope} 的 positioner`)
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
    const doc = await mountAt(375, render)
    const el = await positionerAt(doc, scope, slot)
    expect(pxOf(el, slot)).not.toBeNull()
  })

  it.each(CASES)('%s 的 available-w 贴着视口的碰撞边界逐档变', async (scope, render) => {
    const slot = `--xh-_${scope}-available-w`
    const measured: number[] = []
    for (const width of WIDTHS) {
      const doc = await mountAt(width, render)
      const el = await positionerAt(doc, scope, slot)
      const value = pxOf(el, slot)
      // 落在锚点下方：可用宽度是整条可用区域，两边各扣一份贴边余量
      expect(value).toBe(doc.documentElement.clientWidth - SHIFT_PADDING * 2)
      measured.push(value!)
      unmount()
    }
    // 三档各不相同：这个数跟着可用区走，不是某个静态档
    expect(new Set(measured).size).toBe(WIDTHS.length)
  })

  it('popover 的 available-h 与 available-w 一起下发', async () => {
    const doc = await mountAt(375, popover)
    const el = await positionerAt(doc, 'popover', '--xh-_popover-available-w')
    expect(pxOf(el, '--xh-_popover-available-w')).toBeGreaterThan(0)
    expect(pxOf(el, '--xh-_popover-available-h')).toBeGreaterThan(0)
  })
})
