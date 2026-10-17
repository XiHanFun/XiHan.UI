// @vitest-environment jsdom

import type { DiagnosticRecord } from '@xihan-ui/core'
import { onDiagnostic } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface SeparatorHost extends HTMLElement {
  updateComplete: Promise<unknown>
}

const stops: Array<() => void> = []
afterEach(() => {
  while (stops.length) stops.pop()!()
  document.body.replaceChildren()
})

async function settle(el: SeparatorHost): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

function mount(inner = ''): SeparatorHost {
  const el = document.createElement('xh-separator') as SeparatorHost
  el.innerHTML = inner
  document.body.append(el)
  return el
}

function root(el: Element): HTMLElement {
  return el.querySelector<HTMLElement>('[data-scope="separator"][data-part="root"]')!
}

describe('xh-separator 生成结构', () => {
  it('什么都不写：生成的 root 自己就是那条线', async () => {
    const records: DiagnosticRecord[] = []
    stops.push(onDiagnostic(record => records.push(record)))
    const el = mount()
    await settle(el)

    expect(root(el).getAttribute('role')).toBe('separator')
    expect(root(el).children).toHaveLength(0)
    expect(records.filter(record => record.code.startsWith('wc.'))).toEqual([])
  })

  it('宿主直接子节点写 slot="content"：生成线、文字、线三段，那个节点搬进中间的 content', async () => {
    const el = mount('<b slot="content">基本信息</b>')
    await settle(el)

    expect(Array.from(root(el).children, node => node.getAttribute('data-part'))).toEqual(['line', 'content', 'line'])
    const content = root(el).querySelector('[data-part="content"]')!
    expect(content.querySelector('b')!.textContent).toBe('基本信息')
    expect(root(el).querySelectorAll('[data-part="line"][role="none"]')).toHaveLength(2)
  })

  it('只写 root：分节文字照样生成在作者的 root 里', async () => {
    const el = mount('<div data-xh-part="root"></div><span slot="content">附加项</span>')
    await settle(el)

    expect(root(el).hasAttribute('data-xh-gen')).toBe(false)
    expect(Array.from(root(el).children, node => node.getAttribute('data-part'))).toEqual(['line', 'content', 'line'])
  })
})
