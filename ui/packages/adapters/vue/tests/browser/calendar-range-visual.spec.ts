import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhCalendarCell,
  XhCalendarCellTrigger,
  XhCalendarGrid,
  XhCalendarGridBody,
  XhCalendarGridHead,
  XhCalendarRoot,
  XhCalendarWeekDay,
  XhCalendarWeekRow,
  XhDatePickerControl,
  XhDatePickerRangeSeparator,
  XhDatePickerRoot,
  XhDatePickerSegmentGroup,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function cell(value: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(
    `[data-scope='calendar'][data-part='cell'][data-value='${value}']`,
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

function alpha(color: string): number {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1
  const context = canvas.getContext('2d')!
  context.fillStyle = color
  context.fillRect(0, 0, 1, 1)
  return context.getImageData(0, 0, 1, 1).data[3]!
}

async function mountCalendar(defaultValue?: string[], keepMotion = false): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhCalendarRoot, {
      defaultFocusedValue: '2026-09-09',
      defaultValue,
      fixedWeeks: true,
      locale: 'zh-CN',
      selectionMode: 'range',
      timeZone: 'UTC',
    }, {
      default: ({ weeks, weekDays }: any) => h(XhCalendarGrid, null, () => [
        h(XhCalendarGridHead, null, () => h(XhCalendarWeekRow, null, () =>
          weekDays.map((day: any) => h(XhCalendarWeekDay, { key: day.value, value: day.value })))),
        h(XhCalendarGridBody, null, () => weeks.map((week: any[]) =>
          h(XhCalendarWeekRow, { key: week[0].start }, () => week.map(day =>
            h(XhCalendarCell, { key: day.start, value: day.start }, () =>
              h(XhCalendarCellTrigger, null, () => String(day.day))))))),
      ]),
    }),
  })
  app.mount(host)
  await nextTick()
  if (!keepMotion) {
    document.querySelectorAll<HTMLElement>(`[data-scope='calendar'][data-part='cell-trigger']`)
      .forEach(element => element.style.transition = 'none')
  }
}

async function mountRangeField(): Promise<HTMLElement> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhDatePickerRoot, { selectionMode: 'range' }, () =>
      h(XhDatePickerControl, null, () => [
        h(XhDatePickerSegmentGroup, { index: 0 }),
        h(XhDatePickerRangeSeparator),
        h(XhDatePickerSegmentGroup, { index: 1 }),
      ])),
  })
  app.mount(host)
  await nextTick()
  const separator = document.querySelector<HTMLElement>(
    `[data-scope='date-picker'][data-part='range-separator']`,
  )
  if (!separator)
    throw new Error('找不到范围分隔符')
  return separator
}

async function mountPeriodCalendar(granularity: 'week' | 'month' | 'quarter' | 'year'): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhCalendarRoot, {
      defaultFocusedValue: '2026-09-09',
      granularity,
      locale: 'zh-CN',
      selectionMode: 'range',
      timeZone: 'UTC',
    }, {
      default: ({ panels }: any) => h(XhCalendarGrid, null, () =>
        panels[0].cells.map((period: any) =>
          h(XhCalendarCell, { key: period.key, value: period.start }, () =>
            h(XhCalendarCellTrigger, null, () => period.label)))),
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

describe('范围日历轨道', () => {
  it('已选区间连续铺底，起止圆帽完整，中间日期不叠加普通 hover 圆底', async () => {
    await mountCalendar(['2026-09-07', '2026-09-11'])
    const start = getComputedStyle(cell('2026-09-07'), '::before')
    const middle = getComputedStyle(cell('2026-09-09'), '::before')
    const end = getComputedStyle(cell('2026-09-11'), '::before')

    expect(alpha(middle.backgroundColor)).toBe(255)
    expect(Number.parseFloat(start.borderStartStartRadius)).toBeGreaterThan(0)
    expect(Number.parseFloat(middle.borderStartStartRadius)).toBe(0)
    expect(Number.parseFloat(end.borderStartEndRadius)).toBeGreaterThan(0)

    await userEvent.hover(trigger('2026-09-09'))
    expect(alpha(getComputedStyle(trigger('2026-09-09')).backgroundColor)).toBeLessThan(8)
  })

  it('只落起点时以更轻的轨道预览 hover 范围，并强调预览端点', async () => {
    await mountCalendar()
    await userEvent.click(trigger('2026-09-07'))
    await userEvent.hover(trigger('2026-09-11'))
    await nextTick()

    for (const day of ['07', '08', '09', '10', '11'])
      expect(cell(`2026-09-${day}`).hasAttribute('data-range-preview')).toBe(true)

    const preview = getComputedStyle(cell('2026-09-09'), '::before')
    expect(alpha(preview.backgroundColor)).toBeGreaterThan(0)
    expect(alpha(preview.backgroundColor)).toBeLessThan(255)
    expect(alpha(getComputedStyle(trigger('2026-09-09')).backgroundColor)).toBeLessThan(8)
    expect(alpha(getComputedStyle(trigger('2026-09-11')).backgroundColor)).toBe(255)
  })

  it('区间端点具备按压缩放的过渡通道', async () => {
    await mountCalendar(['2026-09-07', '2026-09-11'], true)
    const element = trigger('2026-09-07')
    const style = getComputedStyle(element)
    expect(style.transitionProperty).toContain('scale')
    expect(Number.parseFloat(style.transitionDuration)).toBeGreaterThan(0)
  })

  it('周粒度是一列整周周期格，区间预览不下沉到七个日格', async () => {
    await mountPeriodCalendar('week')
    const grid = document.querySelector<HTMLElement>(`[data-scope='calendar'][data-part='grid']`)!
    const periods = [...document.querySelectorAll<HTMLElement>(`[data-scope='calendar'][data-part='cell']`)]
    expect(periods).toHaveLength(5)
    expect(getComputedStyle(grid).gridTemplateColumns.split(' ')).toHaveLength(1)
    expect(getComputedStyle(trigger('2026-09-07')).aspectRatio).toBe('auto')

    await userEvent.click(trigger('2026-09-07'))
    await userEvent.hover(trigger('2026-09-21'))
    await nextTick()
    expect(['2026-09-07', '2026-09-14', '2026-09-21'].every(value => cell(value).hasAttribute('data-in-range'))).toBe(true)
  })

  it.each(['month', 'quarter', 'year'] as const)('%s 周期格选中前后保持相同尺寸', async (granularity) => {
    await mountPeriodCalendar(granularity)
    const elements = [...document.querySelectorAll<HTMLElement>(
      `[data-scope='calendar'][data-part='cell-trigger']`,
    )]
    const idle = elements[0]
    if (!idle)
      throw new Error(`找不到 ${granularity} 周期格`)

    const before = idle.getBoundingClientRect()
    await userEvent.click(idle)
    await nextTick()
    const after = idle.getBoundingClientRect()

    expect(getComputedStyle(idle).aspectRatio).toBe('auto')
    expect(after.width).toBeCloseTo(before.width, 1)
    expect(after.height).toBeCloseTo(before.height, 1)
    expect(after.width).toBeLessThanOrEqual(56)
    expect(after.height).toBeLessThanOrEqual(40)
  })

  it('日期范围字段使用正式分隔部件，默认字符不进入可访问树', async () => {
    const separator = await mountRangeField()
    const style = getComputedStyle(separator)
    expect(separator.textContent).toBe('-')
    expect(separator.getAttribute('aria-hidden')).toBe('true')
    expect(style.display).toBe('flex')
    expect(Number.parseFloat(style.paddingInlineStart)).toBeGreaterThan(0)
  })
})
