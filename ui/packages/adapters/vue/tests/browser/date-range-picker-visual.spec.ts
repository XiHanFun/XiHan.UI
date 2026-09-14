import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhDateRangePickerCalendar,
  XhDateRangePickerCell,
  XhDateRangePickerCellTrigger,
  XhDateRangePickerContent,
  XhDateRangePickerControl,
  XhDateRangePickerGrid,
  XhDateRangePickerGridBody,
  XhDateRangePickerGridHead,
  XhDateRangePickerPositioner,
  XhDateRangePickerRangeSeparator,
  XhDateRangePickerRoot,
  XhDateRangePickerSegment,
  XhDateRangePickerSegmentGroup,
  XhDateRangePickerTrigger,
  XhDateRangePickerWeekDay,
  XhDateRangePickerWeekRow,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function part(name: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-scope='date-range-picker'][data-part='${name}']`)
  if (!element)
    throw new Error(`找不到部件 ${name}`)
  return element
}

function cell(value: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(
    `[data-scope='calendar-range-picker'][data-part='cell'][data-value='${value}']`,
  )
  if (!element)
    throw new Error(`找不到日期格 ${value}`)
  return element
}

function trigger(value: string): HTMLElement {
  const element = cell(value).querySelector<HTMLElement>(`[data-part='cell-trigger']`)
  if (!element)
    throw new Error(`找不到日期按钮 ${value}`)
  return element
}

const values: string[][] = []

function segmentGroup(index: 0 | 1) {
  return h(XhDateRangePickerSegmentGroup, { index }, () => [
    h(XhDateRangePickerSegment, { index: 0 }),
    h('span', '/'),
    h(XhDateRangePickerSegment, { index: 1 }),
    h('span', '/'),
    h(XhDateRangePickerSegment, { index: 2 }),
  ])
}

async function mountPicker(props: Record<string, unknown> = {}): Promise<void> {
  values.length = 0
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhDateRangePickerRoot, {
      defaultFocusedValue: '2026-09-09',
      locale: 'zh-CN',
      timeZone: 'UTC',
      onValueChange: ({ value }: { value: string[] }) => values.push(value),
      ...props,
    }, {
      default: ({ weeks, weekDays }: any) => [
        h(XhDateRangePickerControl, null, () => [
          segmentGroup(0),
          h(XhDateRangePickerRangeSeparator),
          segmentGroup(1),
          h(XhDateRangePickerTrigger),
        ]),
        h(XhDateRangePickerPositioner, null, () => h(XhDateRangePickerContent, null, () =>
          h(XhDateRangePickerCalendar, null, () => h(XhDateRangePickerGrid, null, () => [
            h(XhDateRangePickerGridHead, null, () => h(XhDateRangePickerWeekRow, null, () =>
              weekDays.map((day: any) => h(XhDateRangePickerWeekDay, { key: day.value, value: day.value })))),
            h(XhDateRangePickerGridBody, null, () => weeks.map((week: any[]) =>
              h(XhDateRangePickerWeekRow, { key: week[0].start }, () => week.map(day =>
                h(XhDateRangePickerCell, { key: day.start, value: day.start }, () =>
                  h(XhDateRangePickerCellTrigger, null, () => String(day.day))))))),
          ])))),
      ],
    }),
  })
  app.mount(host)
  await nextTick()
}

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

describe('日期范围选择器的输入行', () => {
  it('分隔部件默认字符不进入可访问树；起点那组只占自己的宽度，分隔符紧跟在它后面', async () => {
    await mountPicker()
    const separator = part('range-separator')
    const style = getComputedStyle(separator)
    expect(separator.textContent).toBe('-')
    expect(separator.getAttribute('aria-hidden')).toBe('true')
    expect(style.display).toBe('flex')
    expect(Number.parseFloat(style.paddingInlineStart)).toBeGreaterThan(0)

    const [start, end] = document.querySelectorAll<HTMLElement>(`[data-scope='date-range-picker'][data-part='segment-group']`)
    expect(getComputedStyle(start!).flexGrow).toBe('0')
    expect(getComputedStyle(end!).flexGrow).toBe('1')
    // 分隔符紧跟在起点后面：两侧各只留一个小间距
    const gapBefore = separator.getBoundingClientRect().left - start!.getBoundingClientRect().right
    const gapAfter = end!.getBoundingClientRect().left - separator.getBoundingClientRect().right
    expect(gapBefore).toBeGreaterThan(0)
    expect(gapBefore).toBeLessThanOrEqual(6)
    expect(gapAfter).toBeCloseTo(gapBefore, 0)
  })

  it('两组段位各报各的名字，终点早于起点时整个控件画成不合法', async () => {
    await mountPicker({ defaultValue: ['2026-09-20', '2026-09-10'] })
    const [start, end] = document.querySelectorAll<HTMLElement>(`[data-scope='date-range-picker'][data-part='segment-group']`)
    expect(start!.getAttribute('aria-label')).toBe('Start date')
    expect(end!.getAttribute('aria-label')).toBe('End date')
    expect(part('root').hasAttribute('data-invalid')).toBe(true)
    expect(part('control').hasAttribute('data-invalid')).toBe(true)
  })
})

describe('浮层里的范围日历', () => {
  it('点触发钮展开：先落起点再落终点，两端都落定才写值并收起', async () => {
    await mountPicker()
    await userEvent.click(part('trigger'))
    await nextTick()
    expect(part('content').hasAttribute('hidden')).toBe(false)
    await userEvent.click(trigger('2026-09-07'))
    await nextTick()
    expect(values).toHaveLength(0)
    expect(cell('2026-09-07').getAttribute('aria-selected')).toBe('true')
    await userEvent.click(trigger('2026-09-11'))
    await nextTick()
    expect(values.at(-1)).toEqual(['2026-09-07', '2026-09-11'])
    expect(part('root').getAttribute('data-state')).toBe('closed')
  })

  it('终点点在邻月格上：落的是被点的那一格，不是翻页后压在指针下的另一格', async () => {
    await mountPicker({ closeOnSelect: false })
    await userEvent.click(part('trigger'))
    await nextTick()
    await userEvent.click(trigger('2026-09-28'))
    expect(cell('2026-10-06').hasAttribute('data-outside-month')).toBe(true)
    await userEvent.click(trigger('2026-10-06'))
    await nextTick()
    expect(values.at(-1)).toEqual(['2026-09-28', '2026-10-06'])
    // 翻到了十月：10 月 6 日成了本月格子
    expect(cell('2026-10-06').hasAttribute('data-outside-month')).toBe(false)
    expect(cell('2026-10-06').hasAttribute('data-range-end')).toBe(true)
  })
})
