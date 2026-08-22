// @vitest-environment jsdom
// date-picker showTime：值升格为 datetime——选日保时不收起、时间列点选换单位、
// 确认按钮收口；没开 showTime 的行为原样。
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhDatePickerCalendar,
  XhDatePickerCell,
  XhDatePickerCellTrigger,
  XhDatePickerConfirmTrigger,
  XhDatePickerContent,
  XhDatePickerControl,
  XhDatePickerGrid,
  XhDatePickerGridBody,
  XhDatePickerPositioner,
  XhDatePickerRoot,
  XhDatePickerSegment,
  XhDatePickerSegmentGroup,
  XhDatePickerTimePanel,
  XhDatePickerTrigger,
  XhDatePickerWeekRow,
} from '../src'

async function tick(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise(r => setTimeout(r, 0))
  await nextTick()
}

let cleanup: Array<() => void> = []

afterEach(() => {
  for (const fn of cleanup) fn()
  cleanup = []
  document.body.innerHTML = ''
})

function mountPicker(props: Record<string, unknown> = {}): { change: ReturnType<typeof vi.fn> } {
  const change = vi.fn()
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp({
    setup: () => () =>
      h(XhDatePickerRoot, { 'showTime': true, 'onValue-change': change, ...props }, {
        default: ({ weeks }: { weeks: Array<Array<{ value: string, day: number }>> }) => [
          h(XhDatePickerControl, null, () => [
            h(XhDatePickerSegmentGroup, null, () => [
              h(XhDatePickerSegment, { index: 0 }),
              h(XhDatePickerSegment, { index: 1 }),
              h(XhDatePickerSegment, { index: 2 }),
            ]),
            h(XhDatePickerTrigger, () => '▾'),
          ]),
          h(XhDatePickerPositioner, null, () => [
            h(XhDatePickerContent, null, () => [
              h(XhDatePickerCalendar, null, () => [
                h(XhDatePickerGrid, null, () => [
                  h(XhDatePickerGridBody, null, () => weeks.map((week, i) =>
                    h(XhDatePickerWeekRow, { key: i }, () => week.map(day =>
                      h(XhDatePickerCell, { key: day.value, value: day.value }, () => [
                        h(XhDatePickerCellTrigger, () => String(day.day)),
                      ]),
                    )),
                  )),
                ]),
              ]),
              h(XhDatePickerTimePanel),
              h(XhDatePickerConfirmTrigger, () => '确定'),
            ]),
          ]),
        ],
      }),
  })
  app.mount(host)
  cleanup.push(() => {
    app.unmount()
    host.remove()
  })
  return { change }
}

function el(selector: string): HTMLElement {
  const hit = document.querySelector<HTMLElement>(selector)
  if (!hit)
    throw new Error(`找不到 ${selector}`)
  return hit
}

const CONTENT = '[data-scope="date-picker"][data-part="content"]'

async function open(): Promise<void> {
  el('[data-scope="date-picker"][data-part="trigger"]').click()
  await tick()
}

function pickDay(value?: string): string {
  const cells = [...document.querySelectorAll<HTMLElement>('[data-scope="calendar"][data-part="cell-trigger"]')]
  const cell = value
    ? cells.find(c => c.getAttribute('data-value') === value)!
    : cells.find(c => !c.hasAttribute('data-outside-month') && c.getAttribute('aria-disabled') !== 'true')!
  cell.click()
  return cell.getAttribute('data-value')!
}

describe('date-picker showTime', () => {
  it('选日不收起、值带零点时间；点时/分列换单位保日期', async () => {
    const m = mountPicker()
    await tick()
    await open()
    const day = pickDay()
    await tick()
    expect(m.change).toHaveBeenLastCalledWith({ value: [`${day}T00:00`] })
    expect(el(CONTENT).hasAttribute('hidden')).toBe(false)

    const hour9 = el('[data-part="time-column"][data-unit="hour"] [data-part="time-item"][data-value="09"]')
    hour9.click()
    await tick()
    expect(m.change).toHaveBeenLastCalledWith({ value: [`${day}T09:00`] })

    const min30 = el('[data-part="time-column"][data-unit="minute"] [data-part="time-item"][data-value="30"]')
    min30.click()
    await tick()
    expect(m.change).toHaveBeenLastCalledWith({ value: [`${day}T09:30`] })
    expect(hour9.getAttribute('data-state')).toBe('checked')

    el('[data-part="confirm-trigger"]').click()
    await tick()
    expect(el(CONTENT).hasAttribute('hidden')).toBe(true)
  })

  it('先点时间后点日：以聚焦日起值，换日保时', async () => {
    const m = mountPicker()
    await tick()
    await open()
    el('[data-part="time-column"][data-unit="hour"] [data-part="time-item"][data-value="14"]').click()
    await tick()
    const first = m.change.mock.calls[0]![0].value[0] as string
    expect(first.endsWith('T14:00')).toBe(true)

    const day = pickDay()
    await tick()
    expect(m.change).toHaveBeenLastCalledWith({ value: [`${day}T14:00`] })
  })

  it('timeGranularity=second：三列且零点带秒', async () => {
    const m = mountPicker({ timeGranularity: 'second' })
    await tick()
    await open()
    expect(document.querySelectorAll('[data-part="time-column"]')).toHaveLength(3)
    const day = pickDay()
    await tick()
    expect(m.change).toHaveBeenLastCalledWith({ value: [`${day}T00:00:00`] })
  })

  it('没开 showTime：时间列与确认按钮不渲染、选日即收', async () => {
    const m = mountPicker({ showTime: false })
    await tick()
    await open()
    expect(document.querySelectorAll('[data-part="time-column"]')).toHaveLength(0)
    expect(el('[data-part="confirm-trigger"]').hasAttribute('hidden')).toBe(true)
    const day = pickDay()
    await tick()
    expect(m.change).toHaveBeenLastCalledWith({ value: [day] })
    expect(el(CONTENT).hasAttribute('hidden')).toBe(true)
  })
})
