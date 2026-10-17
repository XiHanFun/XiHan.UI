// @vitest-environment jsdom

import type { DiagnosticRecord } from '@xihan-ui/core'
import { onDiagnostic } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface SwitchHost extends HTMLElement {
  updateComplete: Promise<unknown>
  name?: string
  checked?: boolean
}

const stops: Array<() => void> = []
afterEach(() => {
  while (stops.length) stops.pop()!()
  document.body.replaceChildren()
})

async function settle(el: SwitchHost): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

function mount(props: Partial<SwitchHost>, inner = ''): SwitchHost {
  const el = document.createElement('xh-switch') as SwitchHost
  Object.assign(el, props)
  el.innerHTML = inner
  document.body.append(el)
  return el
}

function partsOf(parent: Element): string[] {
  return Array.from(parent.children).map(node => node.getAttribute('data-part') ?? '')
}

describe('xh-switch 生成结构', () => {
  it('什么都不写：生成一颗原生按钮当 root，里面一个滑块，点击即切换', async () => {
    const records: DiagnosticRecord[] = []
    stops.push(onDiagnostic(record => records.push(record)))
    const el = mount({})
    await settle(el)

    const root = el.querySelector<HTMLButtonElement>('[data-scope="switch"][data-part="root"]')!
    expect(root.localName).toBe('button')
    expect(root.getAttribute('role')).toBe('switch')
    expect(partsOf(root)).toEqual(['thumb'])
    root.click()
    await settle(el)
    expect(root.getAttribute('aria-checked')).toBe('true')
    expect(records.filter(record => record.code.startsWith('wc.'))).toEqual([])
  })

  it('给了 name 才带表单影子，去掉 name 时撤掉', async () => {
    const el = mount({ name: 'notify' })
    await settle(el)
    const root = el.querySelector('[data-scope="switch"][data-part="root"]')!
    expect(partsOf(root)).toEqual(['thumb', 'hidden-input'])

    el.name = undefined
    await settle(el)
    expect(partsOf(root)).toEqual(['thumb'])
  })

  it('只写 root：滑块生成在作者的按钮里', async () => {
    const el = mount({}, '<button data-xh-part="root" aria-label="静音"></button>')
    await settle(el)

    const root = el.querySelector('button')!
    expect(root.hasAttribute('data-xh-gen')).toBe(false)
    expect(partsOf(root)).toEqual(['thumb'])
  })
})
