// @vitest-environment jsdom

import type { DiagnosticRecord } from '@xihan-ui/core'
import { onDiagnostic } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface ColorFieldHost extends HTMLElement {
  updateComplete: Promise<unknown>
  label?: string
  name?: string
  clearable?: boolean
  defaultValue?: string
}

const stops: Array<() => void> = []
afterEach(() => {
  while (stops.length) stops.pop()!()
  document.body.replaceChildren()
})

async function settle(el: ColorFieldHost): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

function mount(props: Partial<ColorFieldHost>, inner = ''): ColorFieldHost {
  const el = document.createElement('xh-color-field') as ColorFieldHost
  Object.assign(el, props)
  el.innerHTML = inner
  document.body.append(el)
  return el
}

function part(el: Element, name: string): HTMLElement | null {
  return el.querySelector<HTMLElement>(`[data-scope="color-field"][data-part="${name}"]`)
}

function partsOf(parent: Element): string[] {
  return Array.from(parent.children).map(node => node.getAttribute('data-part') ?? '')
}

describe('xh-color-field 生成结构', () => {
  it('什么都不写：生成标题、盒里的色块与输入框，标题的 for 指向输入框，输入框显示当前颜色', async () => {
    const records: DiagnosticRecord[] = []
    stops.push(onDiagnostic(record => records.push(record)))
    const el = mount({ label: '主题色', defaultValue: '#3b82f6' })
    await settle(el)

    expect(partsOf(part(el, 'root')!)).toEqual(['label', 'control'])
    expect(partsOf(part(el, 'control')!)).toEqual(['swatch', 'input'])
    const input = part(el, 'input') as HTMLInputElement
    expect(part(el, 'label')!.getAttribute('for')).toBe(input.id)
    expect(input.value).toBe('#3b82f6')
    expect(records.filter(record => record.code.startsWith('wc.'))).toEqual([])
  })

  it('开了 clearable 才铺清空按钮，点它清空；给了 name 才带表单影子', async () => {
    const el = mount({ clearable: true, name: 'accent', defaultValue: '#ff0000' })
    await settle(el)
    expect(partsOf(part(el, 'root')!)).toEqual(['control', 'hidden-input'])
    expect(partsOf(part(el, 'control')!)).toEqual(['swatch', 'input', 'clear-trigger'])

    part(el, 'clear-trigger')!.click()
    await settle(el)
    expect((part(el, 'input') as HTMLInputElement).value).toBe('')

    el.clearable = false
    el.name = undefined
    await settle(el)
    expect(partsOf(part(el, 'root')!)).toEqual(['control'])
    expect(partsOf(part(el, 'control')!)).toEqual(['swatch', 'input'])
  })

  it('标题可由宿主直接子节点 slot="label" 接管', async () => {
    const el = mount({}, '<b slot="label">强调色</b>')
    await settle(el)
    const label = part(el, 'label')!
    expect(label.querySelector('b')!.textContent).toBe('强调色')
    expect(label.getAttribute('for')).toBe(part(el, 'input')!.id)
  })
})
