// @vitest-environment jsdom

import type { DiagnosticRecord } from '@xihan-ui/core'
import { onDiagnostic } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface DateRangePickerHost extends HTMLElement {
  updateComplete: Promise<unknown>
  label?: string
  locale?: string
  timeZone?: string
  defaultValue?: string[]
  showTime?: boolean
  visibleCount?: number
  presets?: readonly { value: string, label: string }[]
}

const stops: Array<() => void> = []
afterEach(() => {
  while (stops.length) stops.pop()!()
  document.body.replaceChildren()
})

async function settle(el: DateRangePickerHost): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

function mount(props: Partial<DateRangePickerHost>, inner = ''): DateRangePickerHost {
  const el = document.createElement('xh-date-range-picker') as DateRangePickerHost
  Object.assign(el, { locale: 'zh-CN', timeZone: 'UTC', ...props })
  el.innerHTML = inner
  document.body.append(el)
  return el
}

function parts(el: Element, scope: string, name: string): HTMLElement[] {
  return [...el.querySelectorAll<HTMLElement>(`[data-scope="${scope}"][data-part="${name}"]`)]
}

function part(el: Element, name: string): HTMLElement | null {
  return parts(el, 'date-range-picker', name)[0] ?? null
}

/** 子节点里的部件名，滚动面旁的竖条这类非部件节点不算。 */
function childParts(el: Element): string[] {
  return [...el.children].map(node => node.getAttribute('data-xh-part')).filter((name): name is string => name != null)
}

describe('xh-date-range-picker 生成结构', () => {
  it('什么都不写：生成标题、盒里的起止两组段与分隔符、两颗钮、两份表单影子与浮层里的日历', async () => {
    const records: DiagnosticRecord[] = []
    stops.push(onDiagnostic(record => records.push(record)))
    const el = mount({ label: '有效期', defaultValue: ['2026-07-01', '2026-07-09'] })
    await settle(el)

    expect(childParts(part(el, 'root')!)).toEqual(['label', 'control', 'hidden-input', 'hidden-input', 'positioner'])
    expect(childParts(part(el, 'control')!)).toEqual(['segment-group', 'range-separator', 'segment-group', 'clear-trigger', 'trigger'])
    expect(parts(el, 'date-range-picker', 'segment-group').map(group => group.textContent)).toEqual(['2026/07/01', '2026/07/09'])
    expect(part(el, 'range-separator')!.textContent).toBe('-')
    expect(parts(el, 'date-field', 'hidden-input').map(input => (input as HTMLInputElement).value)).toEqual(['2026-07-01', '2026-07-09'])
    // 日历恒六行
    expect(parts(el, 'calendar-range-picker', 'cell')).toHaveLength(42)
    expect(records.filter(record => record.code.startsWith('wc.'))).toEqual([])
  })

  it('翻月后网格按新的月份重生成', async () => {
    const el = mount({ defaultValue: ['2026-07-01', '2026-07-09'] })
    await settle(el)
    const month = (): string => parts(el, 'calendar-range-picker', 'heading-month-trigger')[0]!.textContent ?? ''
    const before = month()

    parts(el, 'calendar-range-picker', 'next-trigger')[0]!.click()
    await settle(el)
    expect(month()).not.toBe(before)
    expect(parts(el, 'calendar-range-picker', 'cell').some(cell => cell.getAttribute('value') === '2026-08-31')).toBe(true)
  })

  it('两个面板：每个面板一份日历，向前的翻页钮在首个面板、向后的在末个', async () => {
    const el = mount({ defaultValue: ['2026-07-01', '2026-07-09'], visibleCount: 2 })
    await settle(el)
    const calendars = parts(el, 'date-range-picker', 'calendar')
    expect(calendars).toHaveLength(2)
    const header = (calendar: HTMLElement): string[] => childParts(calendar.querySelector('[data-xh-part="header"]')!)
    expect(header(calendars[0]!)).toEqual(['prev-year-trigger', 'prev-trigger', 'heading'])
    expect(header(calendars[1]!)).toEqual(['heading', 'next-trigger', 'next-year-trigger'])
  })

  it('快捷选项与 showTime：浮层里依次是快捷选项列、日历、起止两组时间列与底栏', async () => {
    const el = mount({ defaultValue: ['2026-07-01T09:30', '2026-07-09T18:00'], showTime: true, presets: [{ value: '2026-07-01/2026-07-07', label: '首周' }] })
    await settle(el)
    expect(childParts(part(el, 'content')!)).toEqual(['preset-group', 'calendar', 'column-group', 'column-group', 'footer'])
    expect(part(el, 'preset')!.textContent).toBe('首周')
    const groups = parts(el, 'date-range-picker', 'column-group')
    expect(groups.map(group => childParts(group))).toEqual([
      ['column-group-label', 'time-column', 'time-column'],
      ['column-group-label', 'time-column', 'time-column'],
    ])
    expect(parts(el, 'date-range-picker', 'column-group-label').every(label => label.textContent !== '')).toBe(true)
    expect(parts(el, 'date-range-picker', 'time-item')).toHaveLength((24 + 60) * 2)
    expect(part(el, 'confirm-trigger')!.textContent).not.toBe('')
  })

  it('slot="label" 接管标题', async () => {
    const el = mount({}, '<b slot="label">有效期</b>')
    await settle(el)

    expect(part(el, 'label')!.innerHTML).toBe('<b slot="label">有效期</b>')
  })
})
