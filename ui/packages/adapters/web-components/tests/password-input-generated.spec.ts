// @vitest-environment jsdom

import type { DiagnosticRecord } from '@xihan-ui/core'
import { onDiagnostic } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface PasswordInputHost extends HTMLElement {
  updateComplete: Promise<unknown>
  label?: string
  strength?: number
}

const stops: Array<() => void> = []
afterEach(() => {
  while (stops.length) stops.pop()!()
  document.body.replaceChildren()
})

async function settle(el: PasswordInputHost): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

function mount(props: Partial<PasswordInputHost>, inner = ''): PasswordInputHost {
  const el = document.createElement('xh-password-input') as PasswordInputHost
  Object.assign(el, props)
  el.innerHTML = inner
  document.body.append(el)
  return el
}

function part(el: Element, name: string): HTMLElement | null {
  return el.querySelector<HTMLElement>(`[data-scope="password-input"][data-part="${name}"]`)
}

function partsOf(parent: Element): string[] {
  return Array.from(parent.children).map(node => node.getAttribute('data-part') ?? '')
}

describe('xh-password-input 生成结构', () => {
  it('什么都不写：生成标题、盒里的输入框、大写锁定提示与切换钮，标题的 for 指向输入框；点切换钮明文显示', async () => {
    const records: DiagnosticRecord[] = []
    stops.push(onDiagnostic(record => records.push(record)))
    const el = mount({ label: '密码' })
    await settle(el)

    expect(partsOf(part(el, 'root')!)).toEqual(['label', 'control'])
    expect(partsOf(part(el, 'control')!)).toEqual(['input', 'caps-lock-indicator', 'visibility-trigger'])
    expect(part(el, 'label')!.textContent).toBe('密码')
    expect(part(el, 'label')!.getAttribute('for')).toBe(part(el, 'input')!.id)
    expect(part(el, 'input')!.getAttribute('type')).toBe('password')
    expect(part(el, 'caps-lock-indicator')!.getAttribute('role')).toBe('status')

    part(el, 'visibility-trigger')!.click()
    await settle(el)
    expect(part(el, 'input')!.getAttribute('type')).toBe('text')
    expect(records.filter(record => record.code.startsWith('wc.'))).toEqual([])
  })

  it('给了 strength 才铺强度条，档位写在 data-level 上；撤掉 strength 强度条随之撤下', async () => {
    const el = mount({ strength: 3 })
    await settle(el)
    expect(partsOf(part(el, 'root')!)).toEqual(['control', 'strength-meter'])
    expect(part(el, 'strength-meter')!.getAttribute('data-level')).toBe('3')

    el.strength = undefined
    await settle(el)
    expect(partsOf(part(el, 'root')!)).toEqual(['control'])
  })

  it('标题可由宿主直接子节点 slot="label" 接管', async () => {
    const el = mount({}, '<b slot="label">登录密码</b>')
    await settle(el)
    const label = part(el, 'label')!
    expect(label.querySelector('b')!.textContent).toBe('登录密码')
    expect(label.getAttribute('for')).toBe(part(el, 'input')!.id)
  })
})
