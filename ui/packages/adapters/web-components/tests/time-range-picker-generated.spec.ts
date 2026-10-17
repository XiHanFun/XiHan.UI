// @vitest-environment jsdom

import type { DiagnosticRecord } from '@xihan-ui/core'
import { onDiagnostic } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface TimeRangePickerHost extends HTMLElement {
  updateComplete: Promise<unknown>
  label?: string
  defaultValue?: string[]
  granularity?: string
  hourCycle?: number
  presets?: readonly { value: string, label: string }[]
}

const stops: Array<() => void> = []
afterEach(() => {
  while (stops.length) stops.pop()!()
  document.body.replaceChildren()
})

async function settle(el: TimeRangePickerHost): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

function mount(props: Partial<TimeRangePickerHost>, inner = ''): TimeRangePickerHost {
  const el = document.createElement('xh-time-range-picker') as TimeRangePickerHost
  Object.assign(el, props)
  el.innerHTML = inner
  document.body.append(el)
  return el
}

function parts(el: Element, name: string): HTMLElement[] {
  return [...el.querySelectorAll<HTMLElement>(`[data-scope="time-range-picker"][data-part="${name}"]`)]
}

function part(el: Element, name: string): HTMLElement | null {
  return parts(el, name)[0] ?? null
}

/** 子节点里的部件名，滚动面旁的竖条这类非部件节点不算。 */
function childParts(el: Element): string[] {
  return [...el.children].map(node => node.getAttribute('data-xh-part')).filter((name): name is string => name != null)
}

describe('xh-time-range-picker 生成结构', () => {
  it('什么都不写：生成标题、起止两组段与分隔符、两颗钮、两份表单影子与起止两组时间列', async () => {
    const records: DiagnosticRecord[] = []
    stops.push(onDiagnostic(record => records.push(record)))
    const el = mount({ label: '营业时段', defaultValue: ['09:00', '18:00'] })
    await settle(el)

    expect(childParts(part(el, 'root')!)).toEqual(['label', 'control', 'hidden-input', 'hidden-input', 'positioner'])
    expect(part(el, 'label')!.tagName).toBe('LABEL')
    expect(childParts(part(el, 'control')!)).toEqual(['segment-group', 'range-separator', 'segment-group', 'clear-trigger', 'trigger'])
    expect(parts(el, 'segment-group').map(group => group.textContent)).toEqual(['09:00', '18:00'])
    expect(parts(el, 'hidden-input').map(input => (input as HTMLInputElement).value)).toEqual(['09:00', '18:00'])
    expect(childParts(part(el, 'content')!)).toEqual(['column-group', 'column-group'])
    expect(parts(el, 'column-group').map(group => childParts(group))).toEqual([
      ['column-group-label', 'column', 'column'],
      ['column-group-label', 'column', 'column'],
    ])
    expect(parts(el, 'column-group-label').every(label => label.textContent !== '')).toBe(true)
    expect(parts(el, 'item')).toHaveLength((24 + 60) * 2)
    expect(records.filter(record => record.code.startsWith('wc.'))).toEqual([])
  })

  it('换精度与小时制：两组段与两组列一起增减', async () => {
    const el = mount({ defaultValue: ['09:00', '18:00'] })
    await settle(el)
    el.granularity = 'second'
    el.hourCycle = 12
    await settle(el)

    for (const group of parts(el, 'segment-group'))
      expect([...group.querySelectorAll('[data-xh-part="segment"]')].map(segment => segment.getAttribute('segment'))).toEqual(['hour', 'minute', 'second', 'dayPeriod'])
    for (const group of parts(el, 'column-group'))
      expect([...group.querySelectorAll('[data-xh-part="column"]')].map(column => column.getAttribute('unit'))).toEqual(['hour', 'minute', 'second', 'dayPeriod'])
  })

  it('快捷选项排在两组时间列前面', async () => {
    const el = mount({ presets: [{ value: '09:00/18:00', label: '白班' }] })
    await settle(el)
    expect(childParts(part(el, 'content')!)).toEqual(['preset-group', 'column-group', 'column-group'])
    expect(part(el, 'preset')!.textContent).toBe('白班')
  })

  it('slot="label" 接管标题', async () => {
    const el = mount({}, '<b slot="label">营业时段</b>')
    await settle(el)

    expect(part(el, 'label')!.innerHTML).toBe('<b slot="label">营业时段</b>')
  })
})
