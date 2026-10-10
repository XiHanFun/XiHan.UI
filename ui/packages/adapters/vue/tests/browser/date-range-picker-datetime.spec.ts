// DateRangePicker 的 showTime 落到真实浏览器里：起止两组时间列并排、小标题强调正在编辑的一端；
// defaultTime 在只点日期时补上两端时刻，确认钮收起浮层；起止同一天时终点早于起点的格换成禁用前景；
// 12 小时制两组都多出上下午列，字按 locale 现译。
import type { App } from 'vue'
import type { DateRangePickerRootSlotProps } from '../../src/components/date-range-picker/date-range-picker'
import { afterEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { createApp, h, nextTick, ref } from 'vue'
import {
  XhDateRangePickerCalendar,
  XhDateRangePickerCell,
  XhDateRangePickerCellTrigger,
  XhDateRangePickerConfirmTrigger,
  XhDateRangePickerContent,
  XhDateRangePickerControl,
  XhDateRangePickerGrid,
  XhDateRangePickerGridBody,
  XhDateRangePickerHeader,
  XhDateRangePickerHeading,
  XhDateRangePickerPositioner,
  XhDateRangePickerRangeSeparator,
  XhDateRangePickerRoot,
  XhDateRangePickerSegment,
  XhDateRangePickerSegmentGroup,
  XhDateRangePickerTimePanel,
  XhDateRangePickerTrigger,
  XhDateRangePickerWeekRow,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

async function settle(): Promise<void> {
  for (let i = 0; i < 3; i++) {
    await nextTick()
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  }
}

async function mount(props: Record<string, unknown>): Promise<{ value: () => string[], open: () => boolean }> {
  // 桌面宽度：日历与两组时间列放得下一行
  await page.viewport(1200, 800)
  host = document.createElement('div')
  document.body.append(host)
  const value = ref<string[]>([])
  const open = ref(true)
  app = createApp({
    render: () => h(XhDateRangePickerRoot, {
      'locale': 'zh-CN',
      'timeZone': 'UTC',
      'showTime': true,
      'defaultFocusedValue': '2026-09-10',
      'open': open.value,
      ...props,
      'onUpdate:value': (next: string[]) => { value.value = next },
      'onUpdate:open': (next: boolean) => { open.value = next },
    }, {
      default: ({ weeks, segments, endSegments }: DateRangePickerRootSlotProps) => [
        h(XhDateRangePickerControl, null, () => [
          h(XhDateRangePickerSegmentGroup, { index: 0 }, () => segments.map((segment, index) =>
            h(XhDateRangePickerSegment, { key: segment.type, index }))),
          h(XhDateRangePickerRangeSeparator),
          h(XhDateRangePickerSegmentGroup, { index: 1 }, () => endSegments.map((segment, index) =>
            h(XhDateRangePickerSegment, { key: segment.type, index }))),
          h(XhDateRangePickerTrigger),
        ]),
        h(XhDateRangePickerPositioner, null, () => [
          h(XhDateRangePickerContent, null, () => [
            h(XhDateRangePickerCalendar, null, () => [
              h(XhDateRangePickerHeader, null, () => h(XhDateRangePickerHeading)),
              h(XhDateRangePickerGrid, null, () => h(XhDateRangePickerGridBody, null, () =>
                weeks.map(week => h(XhDateRangePickerWeekRow, { key: week[0]!.start }, () =>
                  week.map(day => h(XhDateRangePickerCell, { key: day.start, value: day.start }, () =>
                    h(XhDateRangePickerCellTrigger, null, () => String(day.day)))))))),
            ]),
            h(XhDateRangePickerTimePanel),
            h(XhDateRangePickerConfirmTrigger, null, () => '确定'),
          ]),
        ]),
      ],
    }),
  })
  app.mount(host)
  await settle()
  return { value: () => value.value, open: () => open.value }
}

function part(name: string, index?: 0 | 1): HTMLElement {
  const suffix = index == null ? '' : `[data-index='${index}']`
  const el = document.querySelector<HTMLElement>(`[data-scope='date-range-picker'][data-part='${name}']${suffix}`)
  if (!el)
    throw new Error(`缺少 date-range-picker/${name}`)
  return el
}

function item(index: 0 | 1, unit: string, value: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(
    `[data-scope='date-range-picker'][data-part='time-column'][data-index='${index}'][data-unit='${unit}'] [data-part='time-item'][data-value='${value}']`,
  )
  if (!el)
    throw new Error(`缺少第 ${index} 端 ${unit} 列的 ${value}`)
  return el
}

function cell(value: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-scope='calendar-range-picker'][data-part='cell-trigger'][data-value='${value}']`)
  if (!el)
    throw new Error(`缺少 ${value} 那一格`)
  return el
}

/** 某个语义令牌在此刻主题下解出的颜色。 */
function tokenColor(token: string): string {
  const probe = document.createElement('span')
  probe.style.color = `var(${token})`
  document.body.append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
}

afterEach(() => {
  app?.unmount()
  host?.remove()
  document.getElementById('xh-portal-root')?.remove()
  app = null
  host = null
})

describe('日期范围选择器 showTime', () => {
  it('起止两组时间列并排在日历旁：各自带小标题，组内几列横着排', async () => {
    await mount({ defaultValue: ['2026-09-10T09:30', '2026-09-12T18:00'] })
    const calendar = document.querySelector<HTMLElement>('[data-scope="date-range-picker"][data-part="content"] > [data-part="calendar"]')!
    expect(part('column-group', 0).getBoundingClientRect().left).toBeGreaterThanOrEqual(calendar.getBoundingClientRect().right - 1)
    const start = part('column-group', 0)
    const end = part('column-group', 1)
    expect(start.getBoundingClientRect().width).toBeGreaterThan(0)
    expect(end.getBoundingClientRect().left).toBeGreaterThanOrEqual(start.getBoundingClientRect().right - 1)
    const hour = document.querySelector<HTMLElement>(`[data-scope='date-range-picker'][data-part='time-column'][data-index='0'][data-unit='hour']`)!
    const minute = document.querySelector<HTMLElement>(`[data-scope='date-range-picker'][data-part='time-column'][data-index='0'][data-unit='minute']`)!
    expect(minute.getBoundingClientRect().left).toBeGreaterThanOrEqual(hour.getBoundingClientRect().right - 1)
    // 小标题落在列顶上那一带，列的顶边在它下面
    const label = part('column-group-label', 0)
    expect(label.textContent).toBe('Start time')
    expect(hour.getBoundingClientRect().top).toBeGreaterThanOrEqual(label.getBoundingClientRect().bottom - 1)
    expect(item(0, 'hour', '09').getAttribute('aria-selected')).toBe('true')
    expect(item(1, 'hour', '18').getAttribute('aria-selected')).toBe('true')
  })

  it('时间列顶边接着标题栏的分隔线、列高与带星期行的日历网格同高；竖线只画在组边，组与组之间不另留空当', async () => {
    await mount({ defaultValue: ['2026-09-10T09:30', '2026-09-12T18:00'] })
    const header = document.querySelector<HTMLElement>(`[data-scope='calendar-range-picker'][data-part='header']`)!.getBoundingClientRect()
    // 这份挂载没摆星期行：网格比列矮一行，列高按令牌（星期行加六周与上下内衬）再加列顶那道线核
    const probe = document.createElement('span')
    probe.style.cssText = 'display: block; inline-size: var(--xh-overlay-calendar-column-h)'
    part('content').append(probe)
    const columnHeight = probe.getBoundingClientRect().width + 1
    probe.remove()
    const columns = [...document.querySelectorAll<HTMLElement>(`[data-scope='date-range-picker'][data-part='time-column']:not([hidden])`)]
    expect(columns.length).toBeGreaterThanOrEqual(4)
    for (const column of columns) {
      const box = column.getBoundingClientRect()
      const style = getComputedStyle(column)
      expect(box.top).toBeCloseTo(header.bottom - 1, 1)
      expect(box.height).toBeCloseTo(columnHeight, 1)
      expect(style.borderTopWidth).toBe('1px')
      expect(style.borderTopColor).toBe(tokenColor('--xh-border-default'))
      expect(style.borderInlineStartWidth).toBe('0px')
    }
    const start = part('column-group', 0)
    const end = part('column-group', 1)
    expect(getComputedStyle(start).borderInlineStartWidth).toBe('1px')
    expect(getComputedStyle(end).borderInlineStartWidth).toBe('1px')
    expect(end.getBoundingClientRect().left).toBe(start.getBoundingClientRect().right)
    // 时间格的命中区补满列内间距：两格之间的缝落在上下两格上
    const upper = item(1, 'hour', '18')
    const lower = item(1, 'hour', '19')
    const gap = lower.getBoundingClientRect().top - upper.getBoundingClientRect().bottom
    expect(gap).toBeGreaterThan(0)
    const x = upper.getBoundingClientRect().left + upper.getBoundingClientRect().width / 2
    expect(document.elementFromPoint(x, upper.getBoundingClientRect().bottom + gap / 2 - 1)?.closest('[data-part="time-item"]')).toBe(upper)
    expect(document.elementFromPoint(x, lower.getBoundingClientRect().top - gap / 2 + 1)?.closest('[data-part="time-item"]')).toBe(lower)
    // 小标题占满列顶那一带：与标题栏的内容区等高
    expect(part('column-group-label', 0).getBoundingClientRect().bottom).toBeCloseTo(header.bottom - 1, 1)
  })

  it('defaultTime：只点日期时起止各补上时刻，浮层不收；确认钮收起', async () => {
    const h = await mount({ defaultTime: ['00:00', '23:59'] })
    await userEvent.click(cell('2026-09-10'))
    await userEvent.click(cell('2026-09-14'))
    await settle()
    expect(h.value()).toEqual(['2026-09-10T00:00', '2026-09-14T23:59'])
    expect(h.open()).toBe(true)
    expect(item(1, 'hour', '23').getAttribute('aria-selected')).toBe('true')
    await userEvent.click(part('confirm-trigger'))
    await settle()
    expect(h.open()).toBe(false)
  })

  it('起止同一天：终点列早于起点时刻的格换成禁用前景，点了不写值；点终点的格后两组小标题仍是同一副样式', async () => {
    const h = await mount({ defaultValue: ['2026-09-10T09:30', '2026-09-10T18:00'] })
    const blocked = item(1, 'hour', '08')
    const open = item(1, 'hour', '10')
    expect(blocked.getAttribute('aria-disabled')).toBe('true')
    expect(getComputedStyle(blocked).color).toBe(tokenColor('--xh-fg-disabled'))
    expect(getComputedStyle(open).color).not.toBe(tokenColor('--xh-fg-disabled'))
    await userEvent.click(blocked, { force: true })
    await settle()
    expect(h.value()).toEqual([])
    await userEvent.click(open)
    await settle()
    expect(h.value()).toEqual(['2026-09-10T09:30', '2026-09-10T10:00'])
    const endLabel = part('column-group-label', 1)
    const startLabel = part('column-group-label', 0)
    // 正在编辑哪一端仍投影成状态事实，但皮肤不拿它给两组标题分档：两个并排的标题一深一浅读起来像一个可用、一个不可用，
    // 与时间范围选择器的两组标题同一副样式
    expect(endLabel.hasAttribute('data-editing')).toBe(true)
    expect(startLabel.hasAttribute('data-editing')).toBe(false)
    expect(getComputedStyle(startLabel).color).toBe(tokenColor('--xh-fg-subtle'))
    expect(getComputedStyle(endLabel).color).toBe(tokenColor('--xh-fg-subtle'))
    expect(getComputedStyle(endLabel).fontWeight).toBe(getComputedStyle(startLabel).fontWeight)
  })

  it('12 小时制：两组时间列都多出上下午列，排在末位、字按 locale 现译', async () => {
    await mount({ hourCycle: 12, defaultValue: ['2026-09-10T21:30', ''] })
    for (const index of [0, 1] as const) {
      const minute = document.querySelector<HTMLElement>(`[data-scope='date-range-picker'][data-part='time-column'][data-index='${index}'][data-unit='minute']`)!
      const period = document.querySelector<HTMLElement>(`[data-scope='date-range-picker'][data-part='time-column'][data-index='${index}'][data-unit='dayPeriod']`)!
      expect(period.getBoundingClientRect().left).toBeGreaterThanOrEqual(minute.getBoundingClientRect().right - 1)
    }
    expect(item(0, 'dayPeriod', '01').textContent).toBe('下午')
    expect(item(0, 'dayPeriod', '01').getAttribute('aria-selected')).toBe('true')
    expect(item(0, 'hour', '09').getAttribute('aria-selected')).toBe('true')
  })
})
