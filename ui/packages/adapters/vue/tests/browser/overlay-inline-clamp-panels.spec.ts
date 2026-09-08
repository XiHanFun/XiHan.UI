// 浮层的行内轴夹取：面板宽过落位那一侧的可用区时，皮肤把它夹回来，撑出去的那截改成面内横滚。
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
  XhDatePickerCalendar,
  XhDatePickerCell,
  XhDatePickerCellTrigger,
  XhDatePickerContent,
  XhDatePickerControl,
  XhDatePickerGrid,
  XhDatePickerGridBody,
  XhDatePickerGridHead,
  XhDatePickerHeader,
  XhDatePickerHeading,
  XhDatePickerPositioner,
  XhDatePickerRoot,
  XhDatePickerSegment,
  XhDatePickerSegmentGroup,
  XhDatePickerWeekDay,
  XhDatePickerWeekRow,
  XhPopoverContent,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTrigger,
} from '../../src'
import { provideXhConfig } from '../../src/config/config'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

/** 窄到放不下的那一档，与放得下的那一档。 */
const NARROW = 375
const WIDE = 1280

let frame: HTMLIFrameElement | null = null
let app: App | null = null

/** 在给定宽度的 iframe 里挂一个浮层，返回它的文档。 */
function mountAt(width: number, render: () => VNode): Document {
  frame = document.createElement('iframe')
  frame.style.cssText = `width: ${width}px; height: 700px; border: 0`
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

function unmount(): void {
  app?.unmount()
  app = null
  frame?.remove()
  frame = null
}

afterEach(unmount)

/** 等浮层落位：可用宽度要等引擎算完才写到 positioner 上，皮肤的夹取在那之后才成立。 */
async function contentAt(doc: Document, scope: string): Promise<HTMLElement> {
  const win = doc.defaultView
  if (!win)
    throw new Error('iframe 没有窗口')
  for (let i = 0; i < 180; i += 1) {
    const positioner = doc.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='positioner']`)
    const content = doc.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='content']`)
    if (positioner?.style.getPropertyValue(`--xh-_${scope}-available-w`) && content)
      return content
    await new Promise(resolve => win.requestAnimationFrame(() => resolve(null)))
  }
  throw new Error(`${scope} 的可用宽度一直没下发`)
}

/** 深度 n 的单链集合：每一层一个选项，展开到底就是 n 列。 */
function chain(depth: number): { value: string, label: string, children?: unknown[] }[] {
  const make = (level: number): any => ({
    value: `l${level}`,
    label: `第 ${level} 层选项`,
    children: level < depth - 1 ? [make(level + 1)] : undefined,
  })
  return [make(0)]
}

function cascaderOf(depth: number): () => VNode {
  const collection = chain(depth)
  const path = Array.from({ length: depth }, (_, i) => `l${i}`)
  return () => h(
    XhCascaderRoot,
    { open: true, collection, value: [path] } as any,
    {
      default: ({ levels }: any) => [
        h(XhCascaderTrigger, null, () => [h(XhCascaderValueText)]),
        h(XhCascaderPositioner, null, () => [
          h(XhCascaderContent, null, () => (levels ?? []).map((lv: any) =>
            h(XhCascaderColumn, { key: lv.level, level: lv.level }, () => (lv.items ?? []).map((node: any) =>
              h(XhCascaderItem, { key: node.value, value: node.value }, () => [
                h(XhCascaderItemText, null, () => node.label),
              ]),
            )),
          )),
        ]),
      ],
    },
  )
}

/** 区间选择：两端跨月时并排两张月历，天然宽度超过窄视口。 */
function datePickerRange(): VNode {
  return h(
    XhDatePickerRoot,
    { open: true, selectionMode: 'range', locale: 'zh-CN' } as any,
    {
      default: ({ panels, weekDays }: any) => [
        h(XhDatePickerControl, null, () => [
          h(XhDatePickerSegmentGroup, { index: 0 }, () => [h(XhDatePickerSegment, { index: 0 })]),
        ]),
        h(XhDatePickerPositioner, null, () => [
          h(XhDatePickerContent, null, () => (panels ?? []).map((panel: any) =>
            h(XhDatePickerCalendar, { key: panel.index, index: panel.index }, () => [
              h(XhDatePickerHeader, null, () => [h(XhDatePickerHeading)]),
              h(XhDatePickerGrid, null, () => [
                h(XhDatePickerGridHead, null, () => [
                  h(XhDatePickerWeekRow, null, () => (weekDays ?? []).map((d: any) =>
                    h(XhDatePickerWeekDay, { key: d.value, value: d.value }),
                  )),
                ]),
                h(XhDatePickerGridBody, null, () => (panel.weeks ?? []).map((week: any) =>
                  h(XhDatePickerWeekRow, { key: week[0].value }, () => week.map((day: any) =>
                    h(XhDatePickerCell, { key: day.value, value: day.value }, () => [
                      h(XhDatePickerCellTrigger, null, () => String(day.day)),
                    ]),
                  )),
                )),
              ]),
            ]),
          )),
        ]),
      ],
    },
  )
}

/** 尺寸档最宽的那一档面板，天然宽度超过窄视口。 */
function popoverLg(): VNode {
  return h(XhPopoverRoot, { open: true, size: 'lg' } as any, () => [
    h(XhPopoverTrigger, null, () => '开'),
    h(XhPopoverPositioner, null, () => [
      h(XhPopoverContent, null, () => '一段足够长的正文，用来把面板撑到尺寸档的上限那么宽，看看它会不会伸出视口。'),
    ]),
  ])
}

describe('窄视口下浮层不伸出视口', () => {
  const CASES: [string, string, () => VNode][] = [
    ['cascader', '四列', cascaderOf(4)],
    ['cascader', '五列', cascaderOf(5)],
    ['date-picker', '区间两页', datePickerRange],
    ['popover', 'lg 档', popoverLg],
  ]

  it.each(CASES)('%s（%s）的右缘留在视口里', async (scope, _shape, render) => {
    const doc = mountAt(NARROW, render)
    const content = await contentAt(doc, scope)
    const rect = content.getBoundingClientRect()
    expect(rect.right).toBeLessThanOrEqual(doc.documentElement.clientWidth)
  })

  it.each(CASES.filter(([scope]) => scope !== 'popover'))('%s（%s）撑出去的那截改成面内横滚', async (scope, _shape, render) => {
    const doc = mountAt(NARROW, render)
    const content = await contentAt(doc, scope)
    // 夹住外框之后盒内才产生溢出，overflow-x 这才有事可做：滚得到就点得到
    expect(content.scrollWidth).toBeGreaterThan(content.clientWidth)
  })

  it.each(CASES)('%s（%s）宽视口下不夹', async (scope, _shape, render) => {
    const doc = mountAt(WIDE, render)
    const content = await contentAt(doc, scope)
    expect(content.scrollWidth).toBe(content.clientWidth)
    expect(content.getBoundingClientRect().right).toBeLessThanOrEqual(doc.documentElement.clientWidth)
  })
})

describe('日期面板夹窄了也不压排布', () => {
  /** 同一行里相邻两颗日期钮的横向间距：负数就是它们叠在一起。 */
  async function gapBetweenCells(width: number): Promise<number> {
    const doc = mountAt(width, datePickerRange)
    await contentAt(doc, 'date-picker')
    const triggers = [...doc.querySelectorAll<HTMLElement>(`[data-part='cell']:not([hidden]) [data-part='cell-trigger']`)]
    const [first, second] = triggers
    if (!first || !second)
      throw new Error('这一行没铺出两颗日期钮')
    return second.getBoundingClientRect().left - first.getBoundingClientRect().right
  }

  it.each([[NARROW], [WIDE]])('%ipx 下相邻两颗日期钮不重叠', async (width) => {
    expect(await gapBetweenCells(width)).toBeGreaterThanOrEqual(0)
  })
})

describe('每份浮层皮肤都消费落位后的可用宽度', () => {
  /** 皮肤名 → 挂着行内轴夹取的那个部件与它要带的属性。 */
  const SKINS: [string, string, Record<string, string>][] = [
    ['cascader', 'content', {}],
    ['color-picker', 'content', {}],
    ['combobox', 'content', {}],
    ['context-menu', 'content', {}],
    ['date-picker', 'content', {}],
    ['hover-card', 'content', {}],
    ['mention', 'content', {}],
    ['menu', 'content', {}],
    ['menubar', 'content', {}],
    ['pagination', 'content', {}],
    ['popover', 'content', {}],
    ['select', 'content', {}],
    ['side-nav', 'branch-content', { 'data-popout': '' }],
    ['tour', 'content', {}],
    ['tree-select', 'content', {}],
  ]

  /** 引擎算出的那个数由测试直接给：这里查的是皮肤有没有把它接到行内轴上，与引擎无关。 */
  const AVAILABLE = 120

  let host: HTMLElement | null = null

  afterEach(() => {
    host?.remove()
    host = null
  })

  it.each(SKINS)('%s 的 %s 跟着可用宽度收', (scope, part, attrs) => {
    host = document.createElement('div')
    const positioner = document.createElement('div')
    positioner.dataset.scope = scope
    positioner.dataset.part = 'positioner'
    positioner.style.setProperty(`--xh-_${scope}-available-w`, `${AVAILABLE}px`)
    const content = document.createElement('div')
    content.dataset.scope = scope
    content.dataset.part = part
    for (const [name, value] of Object.entries(attrs))
      content.setAttribute(name, value)
    positioner.append(content)
    host.append(positioner)
    document.body.append(host)

    expect(getComputedStyle(content).maxInlineSize).toBe(`${AVAILABLE}px`)
  })
})
