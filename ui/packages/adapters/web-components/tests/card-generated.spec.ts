// @vitest-environment jsdom

import type { DiagnosticRecord } from '@xihan-ui/core'
import { onDiagnostic } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface CardHost extends HTMLElement {
  updateComplete: Promise<unknown>
}

const stops: Array<() => void> = []
afterEach(() => {
  while (stops.length) stops.pop()!()
  document.body.replaceChildren()
})

async function settle(el: CardHost): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

function mount(inner = ''): CardHost {
  const el = document.createElement('xh-card') as CardHost
  el.innerHTML = inner
  document.body.append(el)
  return el
}

function part(el: Element, name: string): HTMLElement | null {
  return el.querySelector<HTMLElement>(`[data-scope="card"][data-part="${name}"]`)
}

function partsOf(parent: Element): string[] {
  return Array.from(parent.children).map(node => node.getAttribute('data-part') ?? '')
}

describe('xh-card 生成结构', () => {
  it('slot 写了哪几段就生成哪几段：页头里标题在前、说明在后，接着正文与页脚，节点搬进对应部件', async () => {
    const records: DiagnosticRecord[] = []
    stops.push(onDiagnostic(record => records.push(record)))
    const el = mount('<span slot="footer">查看全部</span><span slot="title">订单</span><p slot="content">共 12 笔</p><span slot="description">最近 30 天</span>')
    await settle(el)

    expect(partsOf(part(el, 'root')!)).toEqual(['header', 'content', 'footer'])
    expect(partsOf(part(el, 'header')!)).toEqual(['title', 'description'])
    expect(part(el, 'title')!.localName).toBe('h3')
    expect(part(el, 'title')!.textContent).toBe('订单')
    expect(part(el, 'description')!.textContent).toBe('最近 30 天')
    expect(part(el, 'content')!.querySelector('p')!.textContent).toBe('共 12 笔')
    expect(part(el, 'footer')!.textContent).toBe('查看全部')
    expect(records.filter(record => record.code.startsWith('wc.'))).toEqual([])
  })

  it('什么都不写是一张空卡片；只给正文就只有正文，不生成空页头', async () => {
    const empty = mount()
    await settle(empty)
    expect(partsOf(part(empty, 'root')!)).toEqual([])
    empty.remove()

    const el = mount('<p slot="content">只有正文</p>')
    await settle(el)
    expect(partsOf(part(el, 'root')!)).toEqual(['content'])
  })
})
