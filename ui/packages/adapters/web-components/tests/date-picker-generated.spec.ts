// @vitest-environment jsdom

import type { DiagnosticRecord } from '@xihan-ui/core'
import { onDiagnostic } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface DatePickerHost extends HTMLElement {
  updateComplete: Promise<unknown>
  label?: string
  locale?: string
  timeZone?: string
  defaultValue?: string | string[]
  selectionMode?: string
  showTime?: boolean
  presets?: readonly { value: string, label: string }[]
}

const stops: Array<() => void> = []
afterEach(() => {
  while (stops.length) stops.pop()!()
  document.body.replaceChildren()
})

async function settle(el: DatePickerHost): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

function mount(props: Partial<DatePickerHost>, inner = ''): DatePickerHost {
  const el = document.createElement('xh-date-picker') as DatePickerHost
  Object.assign(el, { locale: 'zh-CN', timeZone: 'UTC', ...props })
  el.innerHTML = inner
  document.body.append(el)
  return el
}

function parts(el: Element, scope: string, name: string): HTMLElement[] {
  return [...el.querySelectorAll<HTMLElement>(`[data-scope="${scope}"][data-part="${name}"]`)]
}

function part(el: Element, name: string): HTMLElement | null {
  return parts(el, 'date-picker', name)[0] ?? null
}

describe('xh-date-picker 生成结构', () => {
  it('什么都不写：生成标题、盒里的段组与两颗钮、表单影子与浮层里的日历', async () => {
    const records: DiagnosticRecord[] = []
    stops.push(onDiagnostic(record => records.push(record)))
    const el = mount({ label: '出发日期', defaultValue: '2026-07-28' })
    await settle(el)

    const root = part(el, 'root')!
    expect([...root.children].map(node => node.getAttribute('data-xh-part'))).toEqual(['label', 'control', 'hidden-input', 'positioner'])
    expect([...part(el, 'control')!.children].map(node => node.getAttribute('data-xh-part'))).toEqual(['segment-group', 'clear-trigger', 'trigger'])
    expect(part(el, 'segment-group')!.textContent).toBe('2026/07/28')
    expect(part(el, 'segment-group')!.getAttribute('aria-labelledby')).toBe(part(el, 'label')!.id)
    expect((parts(el, 'date-field', 'hidden-input')[0] as HTMLInputElement).value).toBe('2026-07-28')
    // 日历恒六行
    expect(parts(el, 'calendar-picker', 'cell')).toHaveLength(42)
    expect(parts(el, 'calendar-picker', 'week-day')).toHaveLength(7)
    expect(records.filter(record => record.code.startsWith('wc.'))).toEqual([])
  })

  it('翻月后网格按新的月份重生成', async () => {
    const el = mount({ defaultValue: '2026-07-28' })
    await settle(el)
    const month = (): string => parts(el, 'calendar-picker', 'heading-month-trigger')[0]!.textContent ?? ''
    const before = month()

    parts(el, 'calendar-picker', 'next-trigger')[0]!.click()
    await settle(el)
    expect(month()).not.toBe(before)
    expect(parts(el, 'calendar-picker', 'cell').some(cell => cell.getAttribute('value') === '2026-08-31')).toBe(true)
    expect(parts(el, 'calendar-picker', 'cell')).toHaveLength(42)
  })

  it('多选：盒里换成标签行，按标签上的删除钮摘掉那一天', async () => {
    const el = mount({ selectionMode: 'multiple', defaultValue: ['2026-07-01', '2026-07-09'] })
    await settle(el)
    expect(part(el, 'segment-group')).toBeNull()
    const tags = (): HTMLElement[] => parts(el, 'tag', 'root').filter(tag => !tag.hidden)
    expect(tags()).toHaveLength(2)
    expect(tags()[0]!.querySelector('[data-scope="tag"][data-part="label"]')!.textContent).not.toBe('')

    tags()[0]!.querySelector<HTMLElement>('[data-scope="tag"][data-part="close-trigger"]')!.click()
    await settle(el)
    expect(tags()).toHaveLength(1)
    expect(parts(el, 'date-field', 'hidden-input').map(input => (input as HTMLInputElement).value)).toEqual(['2026-07-09'])
  })

  it('快捷选项与 showTime：浮层里依次是快捷选项列、日历、时间列与底栏', async () => {
    const el = mount({ defaultValue: '2026-07-28T09:30', showTime: true, presets: [{ value: '2026-07-01', label: '月初' }] })
    await settle(el)
    const content = part(el, 'content')!
    // 滚动面旁的竖条也是 content 的子节点，只数部件
    expect([...content.children].map(node => node.getAttribute('data-xh-part')).filter(Boolean)).toEqual(['preset-group', 'calendar', 'time-column', 'time-column', 'footer'])
    expect(part(el, 'preset')!.textContent).toBe('月初')
    expect(parts(el, 'date-picker', 'time-item')).toHaveLength(24 + 60)
    expect(part(el, 'confirm-trigger')!.textContent).not.toBe('')
  })

  it('slot="label" 接管标题', async () => {
    const el = mount({}, '<b slot="label">出发日期</b>')
    await settle(el)

    expect(part(el, 'label')!.innerHTML).toBe('<b slot="label">出发日期</b>')
  })
})
