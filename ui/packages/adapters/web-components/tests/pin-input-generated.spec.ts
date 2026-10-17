// @vitest-environment jsdom

import type { DiagnosticRecord } from '@xihan-ui/core'
import { onDiagnostic } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface PinInputHost extends HTMLElement {
  updateComplete: Promise<unknown>
  label?: string
  length?: number
  name?: string
  value?: string[]
}

const stops: Array<() => void> = []
afterEach(() => {
  while (stops.length) stops.pop()!()
  document.body.replaceChildren()
})

async function settle(el: PinInputHost): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

function mount(props: Partial<PinInputHost>, inner = ''): PinInputHost {
  const el = document.createElement('xh-pin-input') as PinInputHost
  Object.assign(el, props)
  el.innerHTML = inner
  document.body.append(el)
  return el
}

function partsOf(parent: Element): string[] {
  return Array.from(parent.children).map(node => node.getAttribute('data-part') ?? '')
}

function part(el: Element, name: string): HTMLElement {
  return el.querySelector<HTMLElement>(`[data-scope="pin-input"][data-part="${name}"]`)!
}

describe('xh-pin-input 生成结构', () => {
  it('什么都不写：生成标题与一段装下 length 个格子的分段，标题的 for 指向首格，填一格表单值跟着走', async () => {
    const records: DiagnosticRecord[] = []
    stops.push(onDiagnostic(record => records.push(record)))
    const el = mount({ label: '验证码', length: 4, name: 'code' })
    await settle(el)

    expect(partsOf(part(el, 'root'))).toEqual(['label', 'group', 'hidden-input'])
    const inputs = [...part(el, 'group').querySelectorAll<HTMLInputElement>('[data-part="input"]')]
    expect(inputs.map(input => input.getAttribute('data-index'))).toEqual(['0', '1', '2', '3'])
    expect(part(el, 'label').getAttribute('for')).toBe(inputs[0]!.id)
    inputs[0]!.value = '7'
    inputs[0]!.dispatchEvent(new Event('input', { bubbles: true }))
    await settle(el)
    expect((part(el, 'hidden-input') as HTMLInputElement).value).toBe('7')
    expect(records.filter(record => record.code.startsWith('wc.'))).toEqual([])
  })

  it('格数变了格子跟着增减；不给 name 时不带表单影子', async () => {
    const el = mount({ length: 3 })
    await settle(el)
    expect(partsOf(part(el, 'root'))).toEqual(['group'])
    expect(part(el, 'group').children).toHaveLength(3)

    el.length = 5
    await settle(el)
    expect(part(el, 'group').children).toHaveLength(5)
  })

  it('slot="label" 接管标题', async () => {
    const el = mount({ length: 4 }, '<span slot="label">短信<b>验证码</b></span>')
    await settle(el)
    expect(part(el, 'label').querySelector('b')!.textContent).toBe('验证码')
  })
})
