// 粗指针下日历格的命中区：格子首尾相接，伪元素往外扩会压到相邻的格，改由加大行距与列宽兑现——
// 每格本身就是不低于 44×44 的触摸盒、彼此不重叠；视觉不动：钮仍是 24 的圆，禁用横条与区间轨道仍以格子中线为轴、32 高，
// 区间两端的帽与端点圆同心。页内日历、日期选择器与日期范围选择器里内嵌的网格同一套；带时刻的面板里时间列仍与网格底边对齐。
import type { App } from 'vue'
import type { DatePickerRootSlotProps } from '../../src/components/date-picker/date-picker'
import type { DateRangePickerRootSlotProps } from '../../src/components/date-range-picker/date-range-picker'
import { afterEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhCalendarPickerCell,
  XhCalendarPickerCellTrigger,
  XhCalendarPickerGrid,
  XhCalendarPickerGridBody,
  XhCalendarPickerGridHead,
  XhCalendarPickerRoot,
  XhCalendarPickerWeekDay,
  XhCalendarPickerWeekRow,
  XhCalendarRangePickerCell,
  XhCalendarRangePickerCellTrigger,
  XhCalendarRangePickerGrid,
  XhCalendarRangePickerGridBody,
  XhCalendarRangePickerRoot,
  XhCalendarRangePickerWeekRow,
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
  XhDatePickerRoot,
  XhDatePickerTimePanel,
  XhDatePickerTrigger,
  XhDatePickerWeekDay,
  XhDatePickerWeekRow,
  XhDateRangePickerCalendar,
  XhDateRangePickerCell,
  XhDateRangePickerCellTrigger,
  XhDateRangePickerContent,
  XhDateRangePickerControl,
  XhDateRangePickerGrid,
  XhDateRangePickerGridBody,
  XhDateRangePickerHeader,
  XhDateRangePickerHeading,
  XhDateRangePickerPositioner,
  XhDateRangePickerRoot,
  XhDateRangePickerTrigger,
  XhDateRangePickerWeekRow,
} from '../../src'
import { coarsePointer, finePointer } from './pseudo-box'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(async () => {
  await finePointer()
  app?.unmount()
  host?.remove()
  document.getElementById('xh-portal-root')?.remove()
  app = null
  host = null
})

async function settle(): Promise<void> {
  for (let i = 0; i < 3; i++) {
    await nextTick()
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  }
}

function mountHost(style: string): HTMLElement {
  host = document.createElement('div')
  host.style.cssText = style
  document.body.append(host)
  return host
}

interface Box { left: number, top: number, right: number, bottom: number }

/**
 * 日期钮的命中区：钮不当定位盒，::after 的包含块是格子。getBoundingClientRect 量不到伪元素，
 * 按格子的盒加上伪元素算出来的 left / top 与宽高折算（粗指针那条把平移钉回了 none）。
 */
function hitBox(trigger: HTMLElement): Box {
  const cell = trigger.parentElement!.getBoundingClientRect()
  const style = getComputedStyle(trigger, '::after')
  expect(style.position).toBe('absolute')
  expect(style.translate).toBe('none')
  const left = cell.left + Number.parseFloat(style.left)
  const top = cell.top + Number.parseFloat(style.top)
  return { left, top, right: left + Number.parseFloat(style.width), bottom: top + Number.parseFloat(style.height) }
}

/** 本月那几格（邻月格在区间网格里照样可点，这里一并量）。 */
function triggers(scope: string): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>(`[data-scope='${scope}'][data-part='cell-trigger']`)]
    .filter(el => !el.hidden && el.getBoundingClientRect().width > 0)
}

/** 每格命中区不低于 44×44、两两不重叠；钮自己仍是 24 见方。 */
function expectTargets(scope: string): void {
  const all = triggers(scope)
  expect(all.length).toBeGreaterThanOrEqual(28)
  const boxes = all.map(hitBox)
  for (const [index, el] of all.entries()) {
    const box = boxes[index]!
    const observed = `${el.textContent} ${JSON.stringify(box)}`
    expect(box.right - box.left, observed).toBeGreaterThanOrEqual(44)
    expect(box.bottom - box.top, observed).toBeGreaterThanOrEqual(44)
    const rect = el.getBoundingClientRect()
    expect(rect.width).toBe(24)
    expect(rect.height).toBe(24)
  }
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i]!
      const b = boxes[j]!
      const overlapX = Math.min(a.right, b.right) - Math.max(a.left, b.left)
      const overlapY = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)
      expect(overlapX > 0.5 && overlapY > 0.5, `${all[i]!.textContent} 与 ${all[j]!.textContent} 的命中区重叠`).toBe(false)
    }
  }
}

/** 格内一条横条（禁用 / 区间轨道）：32 高、以格子中线为轴。 */
function expectBand(cell: HTMLElement): void {
  const rect = cell.getBoundingClientRect()
  const band = getComputedStyle(cell, '::before')
  const top = Number.parseFloat(band.top)
  const bottom = Number.parseFloat(band.bottom)
  const observed = `cell ${JSON.stringify(rect)} band ${band.top}/${band.bottom}`
  expect(rect.height - top - bottom, observed).toBeCloseTo(32, 1)
  expect(top, observed).toBeCloseTo(bottom, 1)
}

describe('粗指针下日历格的命中区', () => {
  it('页内日历按内容收：行距与列宽都到 44，每格命中区 44×44 且互不重叠，钮仍是 24 的圆、禁用横条仍 32 高', async () => {
    await coarsePointer()
    mountHost('display: inline-block')
    app = createApp({
      render: () => h(XhCalendarPickerRoot, {
        locale: 'zh-CN',
        defaultFocusedValue: '2026-09-10',
        isDateUnavailable: (date: string) => date === '2026-09-16' || date === '2026-09-17',
      }, {
        default: ({ weeks, weekDays }: { weeks: { start: string, day: number }[][], weekDays: { value: number }[] }) => h(XhCalendarPickerGrid, null, () => [
          h(XhCalendarPickerGridHead, null, () => h(XhCalendarPickerWeekRow, null, () =>
            weekDays.map(day => h(XhCalendarPickerWeekDay, { key: day.value, value: day.value })))),
          h(XhCalendarPickerGridBody, null, () => weeks.map(week => h(XhCalendarPickerWeekRow, { key: week[0]!.start }, () =>
            week.map(day => h(XhCalendarPickerCell, { key: day.start, value: day.start }, () =>
              h(XhCalendarPickerCellTrigger, null, () => String(day.day))))))),
        ]),
      }),
    })
    app.mount(host!)
    await settle()
    expectTargets('calendar-picker')
    expectBand(document.querySelector<HTMLElement>(`[data-scope='calendar-picker'][data-part='cell'][data-value='2026-09-16']`)!)
  })

  it('页内范围日历铺满宿主：每格命中区 44×44 且互不重叠；区间轨道仍 32 高，两端的帽与端点圆同心', async () => {
    await coarsePointer()
    mountHost('inline-size: 480px')
    app = createApp({
      render: () => h(XhCalendarRangePickerRoot, {
        locale: 'zh-CN',
        defaultValue: ['2026-09-08', '2026-09-11'],
      }, {
        default: ({ weeks }: { weeks: { start: string, day: number }[][] }) => h(XhCalendarRangePickerGrid, null, () =>
          h(XhCalendarRangePickerGridBody, null, () => weeks.map(week => h(XhCalendarRangePickerWeekRow, { key: week[0]!.start }, () =>
            week.map(day => h(XhCalendarRangePickerCell, { key: day.start, value: day.start }, () =>
              h(XhCalendarRangePickerCellTrigger, null, () => String(day.day)))))))),
      }),
    })
    app.mount(host!)
    await settle()
    expectTargets('calendar-range-picker')
    for (const edge of ['start', 'end'] as const) {
      const cell = document.querySelector<HTMLElement>(`[data-scope='calendar-range-picker'][data-part='cell'][data-range-${edge}]`)!
      expectBand(cell)
      const rect = cell.getBoundingClientRect()
      const track = getComputedStyle(cell, '::before')
      const radius = 16
      const capX = edge === 'start'
        ? rect.left + Number.parseFloat(track.left) + radius
        : rect.right - Number.parseFloat(track.right) - radius
      const dot = cell.querySelector<HTMLElement>(`[data-part='cell-trigger']`)!.getBoundingClientRect()
      expect(Math.abs(capX - (dot.left + dot.width / 2))).toBeLessThanOrEqual(0.5)
    }
  })

  it('日期选择器浮层里内嵌的网格同一套命中区；带时刻时时间列仍与网格底边对齐', async () => {
    await coarsePointer()
    await page.viewport(1200, 900)
    mountHost('')
    app = createApp({
      render: () => h(XhDatePickerRoot, {
        locale: 'zh-CN',
        timeZone: 'UTC',
        showTime: true,
        open: true,
        defaultValue: ['2026-09-10T09:30'],
      }, {
        default: ({ weeks, weekDays }: DatePickerRootSlotProps) => [
          h(XhDatePickerControl, null, () => h(XhDatePickerTrigger)),
          h(XhDatePickerPositioner, null, () => [
            h(XhDatePickerContent, null, () => [
              h('div', { style: { display: 'flex', alignItems: 'stretch' } }, [
                h(XhDatePickerCalendar, null, () => [
                  h(XhDatePickerHeader, null, () => h(XhDatePickerHeading)),
                  h(XhDatePickerGrid, null, () => [
                    h(XhDatePickerGridHead, null, () => h(XhDatePickerWeekRow, null, () =>
                      weekDays.map(day => h(XhDatePickerWeekDay, { key: day.value, value: day.value })))),
                    h(XhDatePickerGridBody, null, () => weeks.map(week => h(XhDatePickerWeekRow, { key: week[0]!.start }, () =>
                      week.map(day => h(XhDatePickerCell, { key: day.start, value: day.start }, () =>
                        h(XhDatePickerCellTrigger, null, () => String(day.day))))))),
                  ]),
                ]),
                h(XhDatePickerTimePanel),
              ]),
              h(XhDatePickerConfirmTrigger, null, () => '确定'),
            ]),
          ]),
        ],
      }),
    })
    app.mount(host!)
    await settle()
    expectTargets('calendar-picker')
    const grid = document.querySelector<HTMLElement>(`[data-scope='calendar-picker'][data-part='grid']`)!.getBoundingClientRect()
    const column = document.querySelector<HTMLElement>(`[data-scope='date-picker'][data-part='time-column']`)!.getBoundingClientRect()
    expect(Math.abs(column.bottom - grid.bottom), `grid ${grid.bottom} column ${column.bottom}`).toBeLessThanOrEqual(1)
  })

  it('日期范围选择器浮层里内嵌的网格同一套命中区', async () => {
    await coarsePointer()
    await page.viewport(1200, 900)
    mountHost('')
    app = createApp({
      render: () => h(XhDateRangePickerRoot, {
        locale: 'zh-CN',
        timeZone: 'UTC',
        open: true,
        defaultFocusedValue: '2026-09-10',
      }, {
        default: ({ weeks }: DateRangePickerRootSlotProps) => [
          h(XhDateRangePickerControl, null, () => h(XhDateRangePickerTrigger)),
          h(XhDateRangePickerPositioner, null, () => [
            h(XhDateRangePickerContent, null, () => [
              h(XhDateRangePickerCalendar, null, () => [
                h(XhDateRangePickerHeader, null, () => h(XhDateRangePickerHeading)),
                h(XhDateRangePickerGrid, null, () => h(XhDateRangePickerGridBody, null, () =>
                  weeks.map(week => h(XhDateRangePickerWeekRow, { key: week[0]!.start }, () =>
                    week.map(day => h(XhDateRangePickerCell, { key: day.start, value: day.start }, () =>
                      h(XhDateRangePickerCellTrigger, null, () => String(day.day)))))))),
              ]),
            ]),
          ]),
        ],
      }),
    })
    app.mount(host!)
    await settle()
    expectTargets('calendar-range-picker')
  })
})
