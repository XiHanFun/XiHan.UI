// @vitest-environment jsdom
// xh-empty-state 不写部件时按标准结构生成：title-text、description 两个属性或 slot 节点给出各段内容。

import type { DiagnosticRecord } from '@xihan-ui/core'
import { onDiagnostic } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface EmptyStateHost extends HTMLElement {
  updateComplete: Promise<unknown>
}

const stops: Array<() => void> = []
afterEach(() => {
  while (stops.length) stops.pop()!()
  document.body.replaceChildren()
})

async function settle(el: EmptyStateHost): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

function mount(attrs: Record<string, string>, inner = ''): EmptyStateHost {
  const el = document.createElement('xh-empty-state') as EmptyStateHost
  for (const [name, value] of Object.entries(attrs))
    el.setAttribute(name, value)
  el.innerHTML = inner
  document.body.append(el)
  return el
}

function part(el: Element, name: string): HTMLElement | null {
  return el.querySelector<HTMLElement>(`[data-scope="empty-state"][data-part="${name}"]`)
}

function partsOf(parent: Element): string[] {
  return Array.from(parent.children).map(node => node.getAttribute('data-part') ?? '')
}

describe('xh-empty-state 生成结构', () => {
  it('title-text、description 与 indicator、action 的 slot 节点生成图标、标题、说明与操作，节点搬进对应部件', async () => {
    const records: DiagnosticRecord[] = []
    stops.push(onDiagnostic(record => records.push(record)))
    const el = mount(
      { 'title-text': '还没有任何工单', 'description': '新建一条工单，或者换个筛选条件再看看。' },
      '<button slot="action" type="button">新建工单</button><span slot="indicator">∅</span>',
    )
    await settle(el)

    expect(partsOf(part(el, 'root')!)).toEqual(['indicator', 'title', 'description', 'action'])
    expect(part(el, 'title')!.localName).toBe('p')
    expect(part(el, 'title')!.textContent).toBe('还没有任何工单')
    expect(part(el, 'description')!.textContent).toBe('新建一条工单，或者换个筛选条件再看看。')
    expect(part(el, 'indicator')!.getAttribute('aria-hidden')).toBe('true')
    expect(part(el, 'action')!.querySelector('button')!.textContent).toBe('新建工单')
    expect(part(el, 'root')!.getAttribute('role')).toBe('status')
    // 标题文字不走宿主的全局 title：宿主上不出浏览器原生提示
    expect(el.hasAttribute('title')).toBe(false)
    expect(records.filter(record => record.code.startsWith('wc.'))).toEqual([])
  })

  it('什么都不写时 root 里是空的；手写了标题就整份归作者', async () => {
    const empty = mount({})
    await settle(empty)
    expect(partsOf(part(empty, 'root')!)).toEqual([])

    const authored = mount({ 'title-text': '不用这段' }, '<div data-xh-part="root"><p data-xh-part="title">没有匹配的结果</p></div>')
    await settle(authored)
    expect(partsOf(part(authored, 'root')!)).toEqual(['title'])
    expect(part(authored, 'title')!.textContent).toBe('没有匹配的结果')
  })
})
