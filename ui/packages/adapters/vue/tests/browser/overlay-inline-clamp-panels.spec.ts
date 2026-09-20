// 浮层的行内轴夹取：面板宽过落位那一侧的可用区时，皮肤把它夹回来，撑出去的那截改成面内横滚。
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
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

/** 窄到放不下的那一档，与放得下的那一档。 */
const NARROW = 375
const WIDE = 1280

/** 视口高固定一档，宽按用例换。 */
const HEIGHT = 700

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

/** 等浮层落位：可用宽度要等引擎算完才写到 positioner 上，皮肤的夹取在那之后才成立。 */
async function contentAt(doc: Document, scope: string): Promise<HTMLElement> {
  const win = doc.defaultView
  if (!win)
    throw new Error('文档没有窗口')
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
    { open: true, visibleCount: 2, locale: 'zh-CN' } as any,
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
                  h(XhDatePickerWeekRow, { key: week[0].start }, () => week.map((day: any) =>
                    h(XhDatePickerCell, { key: day.start, value: day.start }, () => [
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
    const doc = await mountAt(NARROW, render)
    const content = await contentAt(doc, scope)
    const rect = content.getBoundingClientRect()
    expect(rect.right).toBeLessThanOrEqual(doc.documentElement.clientWidth)
  })

  // popover 的正文本来就能换行，夹窄了不产生溢出；
  // date-picker 的两张月历放不下时自己折行堆叠，也不再靠横滚够到第二张
  it.each(CASES.filter(([scope]) => scope !== 'popover' && scope !== 'date-picker'))('%s（%s）撑出去的那截改成面内横滚', async (scope, _shape, render) => {
    const doc = await mountAt(NARROW, render)
    const content = await contentAt(doc, scope)
    // 夹住外框之后盒内才产生溢出，overflow-x 这才有事可做：滚得到就点得到
    expect(content.scrollWidth).toBeGreaterThan(content.clientWidth)
  })

  it.each(CASES)('%s（%s）宽视口下不夹', async (scope, _shape, render) => {
    const doc = await mountAt(WIDE, render)
    const content = await contentAt(doc, scope)
    expect(content.scrollWidth).toBe(content.clientWidth)
    expect(content.getBoundingClientRect().right).toBeLessThanOrEqual(doc.documentElement.clientWidth)
  })
})

describe('日期面板夹窄了也不压排布', () => {
  /** 同一行里相邻两颗日期钮的横向间距：负数就是它们叠在一起。 */
  async function gapBetweenCells(width: number): Promise<number> {
    const doc = await mountAt(width, datePickerRange)
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
