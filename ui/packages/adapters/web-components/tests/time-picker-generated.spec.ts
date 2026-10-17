// @vitest-environment jsdom

import type { DiagnosticRecord } from '@xihan-ui/core'
import { onDiagnostic } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface TimePickerHost extends HTMLElement {
  updateComplete: Promise<unknown>
  label?: string
  defaultValue?: string | string[]
  selectionMode?: string
  granularity?: string
  hourCycle?: number
  presets?: readonly { value: string, label: string }[]
}

const stops: Array<() => void> = []
afterEach(() => {
  while (stops.length) stops.pop()!()
  document.body.replaceChildren()
})

async function settle(el: TimePickerHost): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

function mount(props: Partial<TimePickerHost>, inner = ''): TimePickerHost {
  const el = document.createElement('xh-time-picker') as TimePickerHost
  Object.assign(el, props)
  el.innerHTML = inner
  document.body.append(el)
  return el
}

function parts(el: Element, scope: string, name: string): HTMLElement[] {
  return [...el.querySelectorAll<HTMLElement>(`[data-scope="${scope}"][data-part="${name}"]`)]
}

function part(el: Element, name: string): HTMLElement | null {
  return parts(el, 'time-picker', name)[0] ?? null
}

/** 子节点里的部件名，滚动面旁的竖条这类非部件节点不算。 */
function childParts(el: Element): string[] {
  return [...el.children].map(node => node.getAttribute('data-xh-part')).filter((name): name is string => name != null)
}

describe('xh-time-picker 生成结构', () => {
  it('什么都不写：生成标题、段组与两颗钮、表单影子与浮层里的时间列', async () => {
    const records: DiagnosticRecord[] = []
    stops.push(onDiagnostic(record => records.push(record)))
    const el = mount({ label: '开始时间', defaultValue: '09:30' })
    await settle(el)

    expect(childParts(part(el, 'root')!)).toEqual(['label', 'control', 'hidden-input', 'positioner'])
    expect(part(el, 'label')!.tagName).toBe('LABEL')
    expect(childParts(part(el, 'control')!)).toEqual(['segment-group', 'clear-trigger', 'trigger'])
    expect(part(el, 'segment-group')!.textContent).toBe('09:30')
    expect((part(el, 'hidden-input') as HTMLInputElement).value).toBe('09:30')
    expect(childParts(part(el, 'content')!)).toEqual(['column', 'column'])
    expect(parts(el, 'time-picker', 'item')).toHaveLength(24 + 60)
    expect(records.filter(record => record.code.startsWith('wc.'))).toEqual([])
  })

  it('换精度与小时制：段与列跟着增减，上下午段前是空格', async () => {
    const el = mount({ defaultValue: '13:45:30' })
    await settle(el)
    el.granularity = 'second'
    el.hourCycle = 12
    await settle(el)

    expect(parts(el, 'time-picker', 'segment').map(segment => segment.getAttribute('segment'))).toEqual(['hour', 'minute', 'second', 'dayPeriod'])
    expect([...part(el, 'segment-group')!.children].filter(node => !node.hasAttribute('data-xh-part')).map(node => node.textContent)).toEqual([':', ':', ' '])
    expect(parts(el, 'time-picker', 'column').map(column => column.getAttribute('unit'))).toEqual(['hour', 'minute', 'second', 'dayPeriod'])
  })

  it('多选：盒里换成标签行，浮层底栏铺添加钮；按标签上的删除钮摘掉那一个', async () => {
    const el = mount({ selectionMode: 'multiple', defaultValue: ['09:00', '14:30'] })
    await settle(el)
    expect(part(el, 'segment-group')).toBeNull()
    expect(childParts(part(el, 'content')!)).toEqual(['column', 'column', 'footer'])
    expect(part(el, 'confirm-trigger')!.textContent).not.toBe('')
    const tags = (): HTMLElement[] => parts(el, 'tag', 'root').filter(tag => !tag.hidden)
    expect(tags()).toHaveLength(2)

    tags()[0]!.querySelector<HTMLElement>('[data-scope="tag"][data-part="close-trigger"]')!.click()
    await settle(el)
    expect(tags()).toHaveLength(1)
  })

  it('快捷选项排在各列前面', async () => {
    const el = mount({ presets: [{ value: '09:00', label: '上班' }] })
    await settle(el)
    expect(childParts(part(el, 'content')!)).toEqual(['preset-group', 'column', 'column'])
    expect(part(el, 'preset')!.textContent).toBe('上班')
  })

  it('slot="label" 接管标题', async () => {
    const el = mount({}, '<b slot="label">开始时间</b>')
    await settle(el)

    expect(part(el, 'label')!.innerHTML).toBe('<b slot="label">开始时间</b>')
  })
})
