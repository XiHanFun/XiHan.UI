// date-picker 浮层的手机档排布：面板放不下并排的那几块时，它们改成上下堆叠。
//
// 宿主视口固定改不动，换宽度只能靠内嵌 iframe：浮层挂进 iframe 的文档，
// 定位引擎按那份文档的视口算可用区，媒体查询也按它求值。
// 皮肤与令牌以 <style> 注入主文档，克隆一份进 iframe 的 head 才生效。
//
// 位置一律读 offsetTop / offsetLeft：面板展开时正播缩放动画，
// getBoundingClientRect 会把那一帧的缩放算进去，布局偏移量不受它影响。
import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import {
  XhDatePickerCalendar,
  XhDatePickerCell,
  XhDatePickerCellTrigger,
  XhDatePickerConfirmTrigger,
  XhDatePickerContent,
  XhDatePickerControl,
  XhDatePickerGrid,
  XhDatePickerGridBody,
  XhDatePickerGridHead,
  XhDatePickerHeader,
  XhDatePickerHeading,
  XhDatePickerPositioner,
  XhDatePickerPresetGroup,
  XhDatePickerRoot,
  XhDatePickerSegment,
  XhDatePickerSegmentGroup,
  XhDatePickerTimePanel,
  XhDatePickerWeekDay,
  XhDatePickerWeekRow,
} from '../../src'
import { provideXhConfig } from '../../src/config/config'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

/** 手机 / 平板 / 电脑三档各取一个宽度。 */
const PHONE = 375
const TABLET = 768
const DESKTOP = 1280

let frame: HTMLIFrameElement | null = null
let app: App | null = null

/** 在给定宽度的 iframe 里挂一个展开着的日期选择器，返回它的文档。 */
function mountAt(width: number, render: () => VNode): Document {
  frame = document.createElement('iframe')
  frame.style.cssText = `width: ${width}px; height: 900px; border: 0`
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

/** 等浮层落位：可用宽度要等引擎算完才写到 positioner 上，皮肤的夹取在那之后才成立。 */
async function contentAt(doc: Document): Promise<HTMLElement> {
  const win = doc.defaultView
  if (!win)
    throw new Error('iframe 没有窗口')
  for (let i = 0; i < 180; i += 1) {
    const positioner = doc.querySelector<HTMLElement>(`[data-scope='date-picker'][data-part='positioner']`)
    const content = doc.querySelector<HTMLElement>(`[data-scope='date-picker'][data-part='content']`)
    if (positioner?.style.getPropertyValue('--xh-_date-picker-available-w') && content)
      return content
    await new Promise(resolve => win.requestAnimationFrame(() => resolve(null)))
  }
  throw new Error('可用宽度一直没下发')
}

function part(doc: Document, name: string, extra = ''): HTMLElement {
  const hit = doc.querySelector<HTMLElement>(`[data-scope='date-picker'][data-part='${name}']${extra}`)
  if (!hit)
    throw new Error(`面板里没有 ${name}${extra}`)
  return hit
}

function parts(doc: Document, name: string): HTMLElement[] {
  return [...doc.querySelectorAll<HTMLElement>(`[data-scope='date-picker'][data-part='${name}']:not([hidden])`)]
}

/** 一张月历的内容：标题、星期行、日期矩阵。 */
function calendarBody(panel: any, weekDays: any): VNode[] {
  return [
    h(XhDatePickerHeader, null, () => [h(XhDatePickerHeading)]),
    h(XhDatePickerGrid, null, () => [
      h(XhDatePickerGridHead, null, () => [
        h(XhDatePickerWeekRow, null, () => (weekDays ?? []).map((d: any) =>
          h(XhDatePickerWeekDay, { key: d.value, value: d.value }))),
      ]),
      h(XhDatePickerGridBody, null, () => (panel.weeks ?? []).map((week: any) =>
        h(XhDatePickerWeekRow, { key: week[0].value }, () => week.map((day: any) =>
          h(XhDatePickerCell, { key: day.value, value: day.value }, () => [
            h(XhDatePickerCellTrigger, null, () => String(day.day)),
          ]))))),
    ]),
  ]
}

function control(): VNode {
  return h(XhDatePickerControl, null, () => [
    h(XhDatePickerSegmentGroup, { index: 0 }, () => [h(XhDatePickerSegment, { index: 0 })]),
  ])
}

/** 区间选择：两端跨月时并排两张月历。 */
function rangeShape(): VNode {
  return h(XhDatePickerRoot, { open: true, selectionMode: 'range', locale: 'zh-CN' } as any, {
    default: ({ panels, weekDays }: any) => [
      control(),
      h(XhDatePickerPositioner, null, () => [
        h(XhDatePickerContent, null, () => (panels ?? []).map((panel: any) =>
          h(XhDatePickerCalendar, { key: panel.index, index: panel.index }, () => calendarBody(panel, weekDays)))),
      ]),
    ],
  })
}

/** 带时间：日历之外多出时/分两列与一颗确认按钮。 */
function showTimeShape(): VNode {
  return h(XhDatePickerRoot, { open: true, showTime: true, locale: 'zh-CN' } as any, {
    default: ({ panels, weekDays }: any) => [
      control(),
      h(XhDatePickerPositioner, null, () => [
        h(XhDatePickerContent, null, () => [
          ...(panels ?? []).map((panel: any) =>
            h(XhDatePickerCalendar, { key: panel.index, index: panel.index }, () => calendarBody(panel, weekDays))),
          h(XhDatePickerTimePanel),
          h(XhDatePickerConfirmTrigger, null, () => '确定'),
        ]),
      ]),
    ],
  })
}

const PRESETS = [
  { value: '2026-01-01', label: '今天' },
  { value: '2026-01-02', label: '昨天' },
  { value: '2026-01-03', label: '近 7 天' },
  { value: '2026-01-04', label: '近 30 天' },
]

/** 带快捷选项：面板里多出一条「今天 / 昨天 / 近 7 天」。 */
function presetShape(): VNode {
  return h(XhDatePickerRoot, { open: true, locale: 'zh-CN', presets: PRESETS } as any, {
    default: ({ panels, weekDays }: any) => [
      control(),
      h(XhDatePickerPositioner, null, () => [
        h(XhDatePickerContent, null, () => [
          h(XhDatePickerPresetGroup),
          ...(panels ?? []).map((panel: any) =>
            h(XhDatePickerCalendar, { key: panel.index, index: panel.index }, () => calendarBody(panel, weekDays))),
        ]),
      ]),
    ],
  })
}

describe('区间两张月历', () => {
  it(`${PHONE}px 下第二张落到第一张下面`, async () => {
    const doc = mountAt(PHONE, rangeShape)
    await contentAt(doc)
    const calendars = parts(doc, 'calendar')
    const first = calendars[0]!
    const second = calendars[1]!
    expect(second.offsetTop).toBeGreaterThanOrEqual(first.offsetTop + first.offsetHeight)
    expect(second.offsetLeft).toBe(first.offsetLeft)
  })

  it.each([[TABLET], [DESKTOP]])('%ipx 下两张仍并排', async (width) => {
    const doc = mountAt(width, rangeShape)
    await contentAt(doc)
    const calendars = parts(doc, 'calendar')
    const first = calendars[0]!
    const second = calendars[1]!
    expect(second.offsetTop).toBe(first.offsetTop)
    expect(second.offsetLeft).toBeGreaterThanOrEqual(first.offsetLeft + first.offsetWidth)
  })

  it(`${PHONE}px 下堆叠起来就不再靠面内横滚够到第二张`, async () => {
    const doc = mountAt(PHONE, rangeShape)
    const content = await contentAt(doc)
    expect(content.scrollWidth).toBe(content.clientWidth)
  })

  it(`${PHONE}px 下分隔线画在两张之间的块起始边`, async () => {
    const doc = mountAt(PHONE, rangeShape)
    await contentAt(doc)
    const second = parts(doc, 'calendar')[1]!
    const style = doc.defaultView!.getComputedStyle(second)
    expect(Number.parseFloat(style.borderBlockStartWidth)).toBeGreaterThan(0)
    expect(Number.parseFloat(style.borderInlineStartWidth)).toBe(0)
  })

  it.each([[TABLET], [DESKTOP]])('%ipx 下分隔线回到行内起始边', async (width) => {
    const doc = mountAt(width, rangeShape)
    await contentAt(doc)
    const second = parts(doc, 'calendar')[1]!
    const style = doc.defaultView!.getComputedStyle(second)
    expect(Number.parseFloat(style.borderInlineStartWidth)).toBeGreaterThan(0)
    expect(Number.parseFloat(style.borderBlockStartWidth)).toBe(0)
  })

  // 堆叠是靠折行做的，网格轨道一格也没被压窄：日期钮的宽度定死，轨道再窄就会与右邻叠上
  it.each([[PHONE], [TABLET], [DESKTOP]])('%ipx 下日期钮不与右邻重叠、末钮不越出周行', async (width) => {
    const doc = mountAt(width, rangeShape)
    await contentAt(doc)
    const row = doc.querySelector<HTMLElement>(`[data-scope='calendar'][data-part='grid-body'] [data-part='week-row']`)
    if (!row)
      throw new Error('没有铺出周行')
    const cells = [...row.querySelectorAll<HTMLElement>(`[data-part='cell-trigger']`)]
    expect(cells).toHaveLength(7)
    const rects = cells.map(cell => cell.getBoundingClientRect())
    for (let i = 1; i < rects.length; i += 1)
      expect(rects[i]!.left - rects[i - 1]!.right).toBeGreaterThanOrEqual(0)
    expect(rects[6]!.right).toBeLessThanOrEqual(row.getBoundingClientRect().right)
  })
})

describe('带时间的时间列', () => {
  it.each([[PHONE], [TABLET], [DESKTOP]])('%ipx 下时列与分列横着并排，不各占一行', async (width) => {
    const doc = mountAt(width, showTimeShape)
    await contentAt(doc)
    const hour = part(doc, 'time-column', `[data-unit='hour']`)
    const minute = part(doc, 'time-column', `[data-unit='minute']`)
    expect(minute.offsetTop).toBe(hour.offsetTop)
    expect(minute.offsetLeft).toBeGreaterThanOrEqual(hour.offsetLeft + hour.offsetWidth)
  })

  it(`${PHONE}px 下每列只占日历一小截宽，整块面板不再纵向溢出`, async () => {
    const doc = mountAt(PHONE, showTimeShape)
    const content = await contentAt(doc)
    const calendar = parts(doc, 'calendar')[0]!
    const hour = part(doc, 'time-column', `[data-unit='hour']`)
    expect(hour.offsetWidth).toBeLessThan(calendar.offsetWidth / 2)
    expect(content.scrollHeight).toBe(content.clientHeight)
  })

  it.each([[TABLET], [DESKTOP]])('%ipx 下确认按钮沉到日历底边，不吊在顶上', async (width) => {
    const doc = mountAt(width, showTimeShape)
    await contentAt(doc)
    const calendar = parts(doc, 'calendar')[0]!
    const confirm = part(doc, 'confirm-trigger')
    expect(confirm.offsetTop + confirm.offsetHeight).toBe(calendar.offsetTop + calendar.offsetHeight)
    expect(confirm.offsetTop).toBeGreaterThan(calendar.offsetTop)
  })

  it(`${PHONE}px 下确认按钮落在时间列下面`, async () => {
    const doc = mountAt(PHONE, showTimeShape)
    await contentAt(doc)
    const hour = part(doc, 'time-column', `[data-unit='hour']`)
    const confirm = part(doc, 'confirm-trigger')
    expect(confirm.offsetTop).toBeGreaterThanOrEqual(hour.offsetTop + hour.offsetHeight)
  })
})

describe('快捷选项', () => {
  it(`${PHONE}px 下压在面板顶部横着排、自己横滚`, async () => {
    const doc = mountAt(PHONE, presetShape)
    const content = await contentAt(doc)
    const group = part(doc, 'preset-group')
    const calendar = parts(doc, 'calendar')[0]!
    const style = doc.defaultView!.getComputedStyle(group)
    expect(style.flexDirection).toBe('row')
    expect(style.overflowX).toBe('auto')
    // 整条横过来压在日历上方，占满面板这一行
    expect(calendar.offsetTop).toBeGreaterThanOrEqual(group.offsetTop + group.offsetHeight)
    const box = doc.defaultView!.getComputedStyle(content)
    const inner = content.clientWidth - Number.parseFloat(box.paddingLeft) - Number.parseFloat(box.paddingRight)
    expect(group.offsetWidth).toBeCloseTo(inner, 0)
  })

  it(`${PHONE}px 下条目排成一行、不被压扁`, async () => {
    const doc = mountAt(PHONE, presetShape)
    await contentAt(doc)
    const items = parts(doc, 'preset')
    expect(items).toHaveLength(PRESETS.length)
    for (let i = 1; i < items.length; i += 1) {
      expect(items[i]!.offsetTop).toBe(items[0]!.offsetTop)
      expect(items[i]!.offsetLeft).toBeGreaterThanOrEqual(items[i - 1]!.offsetLeft + items[i - 1]!.offsetWidth)
    }
    // 条目按自己那行字的宽度排：被压扁的话文字会折行，高度会比单行高
    expect(items[0]!.offsetHeight).toBeLessThan(items[0]!.offsetWidth)
  })

  it(`${PHONE}px 下选项与日历之间的空当留在块轴`, async () => {
    const doc = mountAt(PHONE, presetShape)
    await contentAt(doc)
    const style = doc.defaultView!.getComputedStyle(parts(doc, 'calendar')[0]!)
    expect(Number.parseFloat(style.paddingBlockStart)).toBeGreaterThan(0)
    expect(Number.parseFloat(style.paddingInlineStart)).toBe(0)
  })

  it.each([[TABLET], [DESKTOP]])('%ipx 下选项与日历之间的空当回到行内轴', async (width) => {
    const doc = mountAt(width, presetShape)
    await contentAt(doc)
    const style = doc.defaultView!.getComputedStyle(parts(doc, 'calendar')[0]!)
    expect(Number.parseFloat(style.paddingInlineStart)).toBeGreaterThan(0)
    expect(Number.parseFloat(style.paddingBlockStart)).toBe(0)
  })

  it.each([[TABLET], [DESKTOP]])('%ipx 下回到日历行内起始一侧的竖列', async (width) => {
    const doc = mountAt(width, presetShape)
    await contentAt(doc)
    const group = part(doc, 'preset-group')
    const calendar = parts(doc, 'calendar')[0]!
    const style = doc.defaultView!.getComputedStyle(group)
    expect(style.flexDirection).toBe('column')
    expect(group.offsetTop).toBe(calendar.offsetTop)
    expect(calendar.offsetLeft).toBeGreaterThanOrEqual(group.offsetLeft + group.offsetWidth)
  })
})
