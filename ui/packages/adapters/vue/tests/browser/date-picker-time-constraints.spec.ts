// DatePicker showTime 的时间约束落到真实浏览器里：12 小时制的上下午列排在分列之后、字按 locale 现译；
// 带时间段的 min 让同一天的界外时刻留在列里、换成禁用前景且点了不写值。
import type { App } from 'vue'
import type { DatePickerRootSlotProps } from '../../src/components/date-picker/date-picker'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick, ref } from 'vue'
import {
  XhDatePickerCalendar,
  XhDatePickerContent,
  XhDatePickerControl,
  XhDatePickerGrid,
  XhDatePickerHeader,
  XhDatePickerHeading,
  XhDatePickerPositioner,
  XhDatePickerRoot,
  XhDatePickerSegment,
  XhDatePickerSegmentGroup,
  XhDatePickerTimePanel,
  XhDatePickerTrigger,
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

async function mount(props: Record<string, unknown>): Promise<{ value: () => string[] }> {
  host = document.createElement('div')
  document.body.append(host)
  const value = ref<string[]>([])
  app = createApp({
    render: () => h(XhDatePickerRoot, {
      'locale': 'zh-CN',
      'timeZone': 'UTC',
      'open': true,
      'showTime': true,
      ...props,
      'onUpdate:value': (next: string[]) => { value.value = next },
    }, {
      default: ({ segments }: DatePickerRootSlotProps) => [
        h(XhDatePickerControl, null, () => [
          h(XhDatePickerSegmentGroup, null, () => segments.map((segment, index) =>
            h(XhDatePickerSegment, { key: segment.type, index }))),
          h(XhDatePickerTrigger),
        ]),
        h(XhDatePickerPositioner, null, () => [
          h(XhDatePickerContent, null, () => [
            h(XhDatePickerCalendar, null, () => [
              h(XhDatePickerHeader, null, () => h(XhDatePickerHeading)),
              h(XhDatePickerGrid),
            ]),
            h(XhDatePickerTimePanel),
          ]),
        ]),
      ],
    }),
  })
  app.mount(host)
  await settle()
  return { value: () => value.value }
}

function column(unit: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-scope='date-picker'][data-part='time-column'][data-unit='${unit}']`)
  if (!el)
    throw new Error(`缺少 ${unit} 列`)
  return el
}

function item(unit: string, value: string): HTMLElement {
  const el = column(unit).querySelector<HTMLElement>(`[data-part='time-item'][data-value='${value}']`)
  if (!el)
    throw new Error(`缺少 ${unit} 列的 ${value}`)
  return el
}

afterEach(() => {
  app?.unmount()
  host?.remove()
  document.getElementById('xh-portal-root')?.remove()
  app = null
  host = null
})

describe('日期选择器 showTime 的时间约束', () => {
  it('12 小时制：上下午列排在分列之后、字按 locale 现译，时列写 1-12；点上下午改的是背后 24 小时制的时', async () => {
    const h = await mount({ hourCycle: 12, defaultValue: '2026-09-11T21:30' })
    const hour = column('hour')
    const minute = column('minute')
    const period = column('dayPeriod')
    expect(period.getBoundingClientRect().width).toBeGreaterThan(0)
    expect(period.getBoundingClientRect().left).toBeGreaterThanOrEqual(minute.getBoundingClientRect().right - 1)
    expect(minute.getBoundingClientRect().left).toBeGreaterThanOrEqual(hour.getBoundingClientRect().right - 1)
    expect(item('dayPeriod', '00').textContent).toBe('上午')
    expect(item('dayPeriod', '01').textContent).toBe('下午')
    expect([...hour.querySelectorAll('[data-part="time-item"]')].map(el => el.textContent)).toEqual(
      ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
    )
    expect(item('hour', '09').getAttribute('aria-selected')).toBe('true')
    expect(item('dayPeriod', '01').getAttribute('aria-selected')).toBe('true')
    // 输入行同样是 12 小时制：时刻段后面多出上下午段
    const segments = [...host!.querySelectorAll<HTMLElement>(`[data-scope='date-field'][data-part='segment']:not([hidden])`)]
    expect(segments.map(segment => segment.dataset.segment)).toEqual(['year', 'month', 'day', 'hour', 'minute', 'dayPeriod'])
    expect(segments.at(-1)!.textContent).toBe('下午')

    await userEvent.click(item('dayPeriod', '00'))
    await settle()
    expect(h.value()).toEqual(['2026-09-11T09:30'])
  })

  it('min 带时间段：同一天的界外时刻留在列里、前景换成禁用色，点了不写值', async () => {
    const h = await mount({ min: '2026-09-11T09:30', defaultValue: '2026-09-11T09:45' })
    // 列长不随界变：24 格都在
    expect(column('hour').querySelectorAll('[data-part="time-item"]')).toHaveLength(24)
    const blocked = item('minute', '15')
    const open = item('minute', '30')
    expect(blocked.getAttribute('aria-disabled')).toBe('true')
    expect(open.getAttribute('aria-disabled')).toBe('false')
    const probe = document.createElement('span')
    probe.style.color = 'var(--xh-fg-disabled)'
    document.body.append(probe)
    const disabledColor = getComputedStyle(probe).color
    probe.remove()
    expect(getComputedStyle(blocked).color).toBe(disabledColor)
    expect(getComputedStyle(open).color).not.toBe(disabledColor)

    await userEvent.click(blocked, { force: true })
    await settle()
    expect(h.value()).toEqual([])
  })
})
