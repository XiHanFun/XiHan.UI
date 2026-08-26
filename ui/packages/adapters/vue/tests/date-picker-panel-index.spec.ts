// @vitest-environment jsdom
// 面板号写在日历上一处：面板内的标题、网格与格子跟着它走，自己写了仍按自己写的算。
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhDatePickerCalendar,
  XhDatePickerCell,
  XhDatePickerCellTrigger,
  XhDatePickerContent,
  XhDatePickerControl,
  XhDatePickerGrid,
  XhDatePickerGridBody,
  XhDatePickerHeading,
  XhDatePickerPositioner,
  XhDatePickerRoot,
  XhDatePickerSegment,
  XhDatePickerSegmentGroup,
  XhDatePickerTrigger,
  XhDatePickerWeekRow,
} from '../src'

interface Day { value: string, day: number }
interface Panel { index: number, weeks: Day[][] }

let cleanup: Array<() => void> = []

afterEach(async () => {
  // 日历落焦推迟一拍：先把这一拍走完再拆，免得回调落到已经拆掉的机器上
  await tick()
  ;(document.activeElement as HTMLElement | null)?.blur?.()
  for (const fn of cleanup) fn()
  cleanup = []
  document.body.innerHTML = ''
})

async function tick(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise(r => setTimeout(r, 0))
  await nextTick()
}

/** 双面板区间：面板号只写在日历上，标题与格子都不写。 */
async function mountPicker(props: Record<string, unknown> = {}): Promise<void> {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp({
    setup: () => () =>
      h(XhDatePickerRoot, {
        locale: 'zh-CN',
        timeZone: 'UTC',
        selectionMode: 'range',
        defaultValue: ['2026-07-01', '2026-08-05'],
        ...props,
      }, {
        default: ({ panels }: { panels: Panel[] }) => [
          h(XhDatePickerControl, null, () => [
            h(XhDatePickerSegmentGroup, null, () => [h(XhDatePickerSegment, { index: 0 })]),
            h(XhDatePickerTrigger),
          ]),
          h(XhDatePickerPositioner, null, () => [
            h(XhDatePickerContent, null, () => panels.map(panel =>
              h(XhDatePickerCalendar, { key: panel.index, index: panel.index }, () => [
                h(XhDatePickerHeading),
                h(XhDatePickerGrid, null, () => [
                  h(XhDatePickerGridBody, null, () => panel.weeks.map(week =>
                    h(XhDatePickerWeekRow, { key: week[0]!.value }, () => week.map(day =>
                      h(XhDatePickerCell, { key: day.value, value: day.value }, () =>
                        h(XhDatePickerCellTrigger, null, () => String(day.day))),
                    )),
                  )),
                ]),
              ]),
            )),
          ]),
        ],
      }),
  })
  app.mount(host)
  cleanup.push(() => app.unmount())
  await tick()
  await open()
}

/** 点开浮层：机器在这一拍之后才把焦点送进日历 */
async function open(): Promise<void> {
  document.querySelector<HTMLElement>('[data-scope="date-picker"][data-part="trigger"]')?.click()
  await tick()
}

function headings(): string[] {
  return [...document.querySelectorAll('[data-scope="calendar"][data-part="heading"]')]
    .map(el => el.textContent ?? '')
}

function cellsOf(panelIndex: number, value: string): Element | null {
  const calendars = document.querySelectorAll('[data-scope="date-picker"][data-part="calendar"]')
  return calendars[panelIndex]?.querySelector(`[data-part="cell"][data-value="${value}"]`) ?? null
}

describe('双面板的面板号写在日历上', () => {
  it('两张标题各是各的月份', async () => {
    await mountPicker()
    expect(headings()).toEqual(['2026年7月', '2026年8月'])
  })

  it('每张网格各有自己那行标题当名字', async () => {
    await mountPicker()
    const grids = [...document.querySelectorAll('[data-scope="calendar"][data-part="grid"]')]
    const ids = headings().length
    expect(ids).toBe(2)
    expect(grids).toHaveLength(2)
    expect(grids[0]!.getAttribute('aria-labelledby')).not.toBe(grids[1]!.getAttribute('aria-labelledby'))
  })

  it('邻月的格子按所在面板判，区间与端点只在认领它的那张上画', async () => {
    await mountPicker()
    // 8/1 既在七月网格的末行，也在八月网格里
    expect(cellsOf(0, '2026-08-01')?.hasAttribute('data-outside-month')).toBe(true)
    expect(cellsOf(1, '2026-08-01')?.hasAttribute('data-outside-month')).toBe(false)
    expect(cellsOf(0, '2026-08-01')?.hasAttribute('data-in-range')).toBe(false)
    expect(cellsOf(1, '2026-08-01')?.hasAttribute('data-in-range')).toBe(true)
    // 区间终点 8/5 只在八月那张上是端点
    expect(cellsOf(1, '2026-08-05')?.hasAttribute('data-range-end')).toBe(true)
  })

  it('部件自己写了面板号仍按自己写的算', async () => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const app = createApp({
      setup: () => () =>
        h(XhDatePickerRoot, {
          locale: 'zh-CN',
          timeZone: 'UTC',
          selectionMode: 'range',
          defaultValue: ['2026-07-01', '2026-08-05'],
        }, {
          default: ({ panels }: { panels: Panel[] }) => [
            h(XhDatePickerControl, null, () => [
              h(XhDatePickerSegmentGroup, null, () => [h(XhDatePickerSegment, { index: 0 })]),
              h(XhDatePickerTrigger),
            ]),
            h(XhDatePickerPositioner, null, () => [
              h(XhDatePickerContent, null, () => panels.map(panel =>
                // 日历自报 0，标题偏要写 1
                h(XhDatePickerCalendar, { key: panel.index, index: 0 }, () => [
                  h(XhDatePickerHeading, { index: 1 }),
                ]),
              )),
            ]),
          ],
        }),
    })
    app.mount(host)
    cleanup.push(() => app.unmount())
    await tick()
    await open()
    expect(headings()).toEqual(['2026年8月', '2026年8月'])
  })
})
