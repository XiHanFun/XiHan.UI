// 行内轴夹取：popover / popconfirm / tour / select / combobox 的面板宽度受落位后的可用宽度约束，
// 窄视口下不再伸出屏幕。
//
// 换宽度走 page.viewport：整个测试文档改成那一档宽，定位引擎按它的视口算可用区域。
// 不再挂进内嵌 iframe——浮层的 Scope 与 Layer 注册表都建在挂载它的那份文档上（48d6b8814 起
// 视觉绑定校验节点与注册表同属一份 Document），从主文档挂进另一份文档不是被支持的接法。
//
// 判据全在布局结果上（getBoundingClientRect），不是读那几个私有槽：槽写对了而声明没消费它，
// 面板照样越界。
import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { createApp, h } from 'vue'
import {
  XhComboboxContent,
  XhComboboxControl,
  XhComboboxInput,
  XhComboboxItem,
  XhComboboxItemText,
  XhComboboxPositioner,
  XhComboboxRoot,
  XhComboboxTrigger,
  XhPopconfirmCancelTrigger,
  XhPopconfirmConfirmTrigger,
  XhPopconfirmContent,
  XhPopconfirmDescription,
  XhPopconfirmPositioner,
  XhPopconfirmRoot,
  XhPopconfirmTitle,
  XhPopconfirmTrigger,
  XhPopoverContent,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTrigger,
  XhSelectContent,
  XhSelectControl,
  XhSelectIndicator,
  XhSelectItem,
  XhSelectItemText,
  XhSelectList,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTrigger,
  XhSelectValueText,
  XhTourContent,
  XhTourDescription,
  XhTourPositioner,
  XhTourRoot,
  XhTourTitle,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

/** 要量的三档视口宽。 */
const WIDTHS = [375, 768, 1280] as const

/** 长到足以把面板撑上静态上限的正文。 */
const LONG = '这是一段很长的说明文字用来把面板撑到它的静态上限以便量出越界量还要更长一些才够'

const CITIES = [
  { value: 'beijing', label: '北京 Beijing' },
  { value: 'berlin', label: '柏林 Berlin' },
]

/** 锚点比可用区还宽：375 档下这个宽度超过整条可用区域。 */
const WIDE_ANCHOR = 'inline-size: 420px'

/** tour 的目标选择器恒在主文档里查（它的 scope 建在 null 上），目标只能挂主文档。 */
const TOUR_TARGET_ID = 'inline-clamp-tour-target'

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

afterEach(async () => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  document.querySelector(`#${TOUR_TARGET_ID}`)?.remove()
  if (originalViewport)
    await page.viewport(originalViewport.width, originalViewport.height)
  originalViewport = null
})

/**
 * 等浮层落位且几何落定，返回 content。
 *
 * 引擎第一趟按面板未受锚宽 / 可用宽约束时量到的尺寸算坐标，同一趟把 anchor-w / available-w 写成槽；
 * 皮肤据槽改了面板宽度后，尺寸观察再触发一趟重算才把它挪回可用区。量的是挪回之后那一帧，
 * 所以落位之后还要等到相邻两帧帧尾的矩形不再变。
 */
async function contentAt(doc: Document, scope: string): Promise<HTMLElement> {
  const win = doc.defaultView
  if (!win)
    throw new Error('文档没有窗口')
  // 一帧算到帧尾：尺寸观察回调排在动画帧回调之后，只等 rAF 会在它之前采样
  const frame = (): Promise<void> => new Promise(resolve => win.requestAnimationFrame(() => win.setTimeout(resolve, 0)))
  let content: HTMLElement | null = null
  for (let i = 0; i < 120 && !content; i += 1) {
    const positioner = doc.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='positioner']`)
    const candidate = doc.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='content']`)
    if (positioner?.hasAttribute('data-positioned') && candidate)
      content = candidate
    else
      await frame()
  }
  if (!content)
    throw new Error(`${scope} 一直没落位`)
  let previous = JSON.stringify(content.getBoundingClientRect())
  for (let i = 0; i < 60; i += 1) {
    await frame()
    const current = JSON.stringify(content.getBoundingClientRect())
    if (current === previous)
      return content
    previous = current
  }
  throw new Error(`${scope} 的几何一直没落定`)
}

/** 读 positioner 上的一个私有槽，单位 px。 */
function slotPx(doc: Document, scope: string, slot: string): number {
  const positioner = doc.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='positioner']`)
  const raw = positioner?.style.getPropertyValue(`--xh-_${scope}-${slot}`).trim() ?? ''
  if (!raw.endsWith('px'))
    throw new Error(`${scope} 的 ${slot} 槽没有下发（读回 ${raw || '空串'}）`)
  return Number.parseFloat(raw)
}

function popover(): VNode {
  return h(XhPopoverRoot, { open: true, size: 'lg' }, () => [
    h(XhPopoverTrigger, null, () => '开'),
    h(XhPopoverPositioner, null, () => [h(XhPopoverContent, null, () => LONG + LONG)]),
  ])
}

function popconfirm(): VNode {
  return h(XhPopconfirmRoot, { open: true, size: 'lg' }, () => [
    h(XhPopconfirmTrigger, null, () => '删'),
    h(XhPopconfirmPositioner, null, () => [
      h(XhPopconfirmContent, null, () => [
        h(XhPopconfirmTitle, null, () => '确认删除'),
        h(XhPopconfirmDescription, null, () => LONG.repeat(6)),
        h(XhPopconfirmCancelTrigger, null, () => '取消'),
        h(XhPopconfirmConfirmTrigger, null, () => '确认'),
      ]),
    ]),
  ])
}

function tour(): VNode {
  if (!document.querySelector(`#${TOUR_TARGET_ID}`)) {
    const target = document.createElement('button')
    target.id = TOUR_TARGET_ID
    target.textContent = '目标'
    // 引擎按浮层所在文档的视口判有没有被滚出去，锚点的坐标得落在那块矩形里面
    target.style.cssText = 'position: fixed; left: 40px; top: 40px'
    document.body.append(target)
  }
  return h(XhTourRoot, {
    open: true,
    steps: [{ id: 'a', target: `#${TOUR_TARGET_ID}`, title: '锚定步' }],
  }, () => [
    h(XhTourPositioner, null, () => [
      h(XhTourContent, null, () => [h(XhTourTitle), h(XhTourDescription, null, () => LONG + LONG)]),
    ]),
  ])
}

/** select 的锚点是触发器：外面那层把它撑得比可用区还宽。 */
function select(): VNode {
  return h('div', { style: WIDE_ANCHOR }, [
    h(XhSelectRoot, { open: true, collection: CITIES }, () => [
      h(XhSelectControl, null, () => [
        h(XhSelectTrigger, { style: WIDE_ANCHOR }, () => [h(XhSelectValueText), h(XhSelectIndicator)]),
      ]),
      h(XhSelectPositioner, null, () => [
        h(XhSelectContent, null, () => [
          h(XhSelectList, null, () => CITIES.map(node =>
            h(XhSelectItem, { key: node.value, value: node.value }, () => [
              h(XhSelectItemText, null, () => node.label),
            ]),
          )),
        ]),
      ]),
    ]),
  ])
}

/** combobox 的锚点是 control 那只盒。 */
function combobox(): VNode {
  return h(XhComboboxRoot, { open: true, collection: CITIES }, () => [
    h(XhComboboxControl, { style: WIDE_ANCHOR }, () => [h(XhComboboxInput), h(XhComboboxTrigger)]),
    h(XhComboboxPositioner, null, () => [
      h(XhComboboxContent, null, () => CITIES.map(node =>
        h(XhComboboxItem, { key: node.value, value: node.value }, () => [
          h(XhComboboxItemText, null, () => node.label),
        ]),
      )),
    ]),
  ])
}

const RENDERS: [string, () => VNode][] = [
  ['popover', popover],
  ['popconfirm', popconfirm],
  ['tour', tour],
  ['select', select],
  ['combobox', combobox],
]

/** 锚宽跟随的那两家。 */
const ANCHOR_FOLLOWING: [string, () => VNode][] = [['select', select], ['combobox', combobox]]

/** 五件 × 三档的逐条用例：按维度拆开，单条不会因为一次挂五份而拖到超时。 */
const CASES: [string, number, () => VNode][] = RENDERS
  .flatMap(([scope, render]) => WIDTHS.map(width => [scope, width, render] as [string, number, () => VNode]))

describe('跟随锚宽的浮层：夹取写在 min 那一侧', () => {
  it.each(CASES)('%s 在 %i 档不伸出视口，宽度不超过落位后的可用宽度', async (scope, width, render) => {
    const doc = await mountAt(width, render)
    const rect = (await contentAt(doc, scope)).getBoundingClientRect()
    const viewport = doc.documentElement.clientWidth

    expect(rect.left, `${scope} 左缘越界`).toBeGreaterThanOrEqual(0)
    expect(rect.right, `${scope} 右缘越界`).toBeLessThanOrEqual(viewport)
    expect(rect.width, `${scope} 比可用宽度还宽`).toBeLessThanOrEqual(slotPx(doc, scope, 'available-w'))
  })

  // 这两家的 content 写着 min-inline-size: max(内容下限, 锚宽)，跟随锚宽是刻意的行为。
  // CSS 里 min-inline-size 恒压过 max-inline-size：锚点比可用区还宽时，
  // 夹取只写在 max 那一侧就是一条死声明，面板照样按锚宽铺出去。
  it.each(ANCHOR_FOLLOWING)('%s：锚宽超过可用区时，面板收在可用宽度内', async (scope, render) => {
    const doc = await mountAt(375, render)
    const rect = (await contentAt(doc, scope)).getBoundingClientRect()
    const available = slotPx(doc, scope, 'available-w')

    expect(slotPx(doc, scope, 'anchor-w'), '这一条要的就是锚宽大于可用区').toBeGreaterThan(available)
    expect(rect.width, `${scope} 跟着锚宽铺出了可用区`).toBeLessThanOrEqual(available)
    expect(rect.right, `${scope} 右缘越界`).toBeLessThanOrEqual(doc.documentElement.clientWidth)
  })

  it('popconfirm 块轴也夹取：面板不超过可用高度，长文交给自己滚', async () => {
    const doc = await mountAt(375, popconfirm)
    const content = await contentAt(doc, 'popconfirm')
    const rect = content.getBoundingClientRect()

    expect(rect.height, '面板比可用高度还高').toBeLessThanOrEqual(slotPx(doc, 'popconfirm', 'available-h'))
    expect(rect.bottom, '下缘越界').toBeLessThanOrEqual(doc.documentElement.clientHeight)
    expect(content.scrollHeight, '正文该长到要滚，否则这条量不出夹取').toBeGreaterThan(content.clientHeight)
  })
})
