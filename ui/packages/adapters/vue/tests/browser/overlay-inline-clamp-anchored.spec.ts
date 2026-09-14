// 行内轴夹取：popover / popconfirm / tour / select / combobox 的面板宽度受落位后的可用宽度约束，
// 窄视口下不再伸出屏幕。
//
// 宿主视口固定改不动，换宽度只能靠内嵌 iframe：浮层挂在 iframe 文档里，
// 定位引擎按那份文档的视口算可用区域。皮肤与令牌以 <style> 注入主文档，克隆一份进 iframe 才生效。
//
// 判据全在布局结果上（getBoundingClientRect），不是读那几个私有槽：槽写对了而声明没消费它，
// 面板照样越界。
import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
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
import { provideXhConfig } from '../../src/config/config'
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
  document.querySelector(`#${TOUR_TARGET_ID}`)?.remove()
})

/** 等浮层落位，返回 content。 */
async function contentAt(doc: Document, scope: string): Promise<HTMLElement> {
  const win = doc.defaultView
  if (!win)
    throw new Error('iframe 没有窗口')
  for (let i = 0; i < 120; i += 1) {
    const positioner = doc.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='positioner']`)
    const content = doc.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='content']`)
    if (positioner?.hasAttribute('data-positioned') && content)
      return content
    await new Promise(resolve => win.requestAnimationFrame(() => resolve(null)))
  }
  throw new Error(`${scope} 一直没落位`)
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
    // 引擎按浮层所在文档（iframe）的视口判有没有被滚出去，锚点的坐标得落在那块矩形里面
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
    const doc = mountAt(width, render)
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
    const doc = mountAt(375, render)
    const rect = (await contentAt(doc, scope)).getBoundingClientRect()
    const available = slotPx(doc, scope, 'available-w')

    expect(slotPx(doc, scope, 'anchor-w'), '这一条要的就是锚宽大于可用区').toBeGreaterThan(available)
    expect(rect.width, `${scope} 跟着锚宽铺出了可用区`).toBeLessThanOrEqual(available)
    expect(rect.right, `${scope} 右缘越界`).toBeLessThanOrEqual(doc.documentElement.clientWidth)
  })

  it('popconfirm 块轴也夹取：面板不超过可用高度，长文交给自己滚', async () => {
    const doc = mountAt(375, popconfirm)
    const content = await contentAt(doc, 'popconfirm')
    const rect = content.getBoundingClientRect()

    expect(rect.height, '面板比可用高度还高').toBeLessThanOrEqual(slotPx(doc, 'popconfirm', 'available-h'))
    expect(rect.bottom, '下缘越界').toBeLessThanOrEqual(doc.documentElement.clientHeight)
    expect(content.scrollHeight, '正文该长到要滚，否则这条量不出夹取').toBeGreaterThan(content.clientHeight)
  })
})
