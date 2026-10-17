// @vitest-environment jsdom

import type { DiagnosticRecord } from '@xihan-ui/core'
import { onDiagnostic } from '@xihan-ui/core'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface TextFieldHost extends HTMLElement {
  updateComplete: Promise<unknown>
  label?: string
  clearable?: boolean
  showCount?: boolean
  maxLength?: number
  multiline?: boolean
}

const stops: Array<() => void> = []
afterEach(() => {
  while (stops.length) stops.pop()!()
  document.body.replaceChildren()
})

async function settle(el: TextFieldHost): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

function mount(props: Partial<TextFieldHost>, inner = ''): TextFieldHost {
  const el = document.createElement('xh-text-field') as TextFieldHost
  Object.assign(el, props)
  el.innerHTML = inner
  document.body.append(el)
  return el
}

function part(el: Element, name: string): HTMLElement | null {
  return el.querySelector<HTMLElement>(`[data-scope="text-field"][data-part="${name}"]`)
}

function partsOf(parent: Element): string[] {
  return Array.from(parent.children).map(node => node.getAttribute('data-part') ?? '')
}

describe('xh-text-field 生成结构', () => {
  it('什么都不写：生成标题、盒里的输入框与清空钮、字数，标题的 for 指向输入框', async () => {
    const records: DiagnosticRecord[] = []
    stops.push(onDiagnostic(record => records.push(record)))
    const el = mount({ label: '昵称', clearable: true, showCount: true, maxLength: 10 })
    await settle(el)

    const root = part(el, 'root')!
    expect(partsOf(root)).toEqual(['label', 'control', 'count'])
    expect(partsOf(part(el, 'control')!)).toEqual(['input', 'clear-trigger'])
    expect(part(el, 'label')!.getAttribute('for')).toBe(part(el, 'input')!.id)
    expect(part(el, 'count')!.textContent).toBe('0 / 10')
    expect(records.filter(record => record.code.startsWith('wc.'))).toEqual([])
  })

  it('只给输入框：不开 clearable / show-count、不给 label 时只铺盒与输入框', async () => {
    const el = mount({})
    await settle(el)

    expect(partsOf(part(el, 'root')!)).toEqual(['control'])
    expect(partsOf(part(el, 'control')!)).toEqual(['input'])
  })

  it('multiline：输入框生成 textarea，不带 type，标题的 for 照样指向它；关掉换回单行 input', async () => {
    const el = mount({ label: '备注', multiline: true })
    await settle(el)
    const input = part(el, 'input')!
    expect([input.localName, input.hasAttribute('type')]).toEqual(['textarea', false])
    expect(part(el, 'label')!.getAttribute('for')).toBe(input.id)
    el.multiline = false
    await settle(el)
    expect([part(el, 'input')!.localName, part(el, 'input')!.getAttribute('type')]).toEqual(['input', 'text'])
  })

  it('slot="label" 接管标题', async () => {
    const el = mount({}, '<b slot="label">昵称</b>')
    await settle(el)

    expect(part(el, 'label')!.innerHTML).toBe('<b slot="label">昵称</b>')
  })

  it('放进 xh-field：字段的说明接到生成的输入框上', async () => {
    document.body.innerHTML = `
      <xh-field>
        <div data-xh-part="root">
          <label data-xh-part="label">邮箱</label>
          <xh-text-field></xh-text-field>
          <p data-xh-part="description">工作邮箱</p>
        </div>
      </xh-field>`
    const description = document.querySelector<HTMLElement>('[data-xh-part="description"]')!
    await vi.waitFor(() => {
      const input = document.querySelector<HTMLInputElement>('[data-scope="text-field"][data-part="input"]')
      expect(input?.getAttribute('aria-describedby')?.split(' ')).toContain(description.id)
    })
  })
})
