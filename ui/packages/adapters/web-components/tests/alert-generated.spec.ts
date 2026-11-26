// @vitest-environment jsdom
// xh-alert 不写部件时按标准结构生成：文本列恒有，title-text、description 两个属性或 slot 节点给出各段内容，写了 closable 才有关闭钮。

import type { DiagnosticRecord } from '@xihan-ui/core'
import { onDiagnostic } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface AlertHost extends HTMLElement {
  updateComplete: Promise<unknown>
}

const stops: Array<() => void> = []
afterEach(() => {
  while (stops.length) stops.pop()!()
  document.body.replaceChildren()
})

async function settle(el: AlertHost): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

function mount(attrs: Record<string, string>, inner = ''): AlertHost {
  const el = document.createElement('xh-alert') as AlertHost
  for (const [name, value] of Object.entries(attrs))
    el.setAttribute(name, value)
  el.innerHTML = inner
  document.body.append(el)
  return el
}

function part(el: Element, name: string): HTMLElement | null {
  return el.querySelector<HTMLElement>(`[data-scope="alert"][data-part="${name}"]`)
}

function partsOf(parent: Element): string[] {
  return Array.from(parent.children).map(node => node.getAttribute('data-part') ?? '')
}

describe('xh-alert 生成结构', () => {
  it('title-text、description、closable 生成文本列里的标题与说明和末尾的关闭钮，root 的名字与描述指向两段', async () => {
    const records: DiagnosticRecord[] = []
    stops.push(onDiagnostic(record => records.push(record)))
    const el = mount({ 'title-text': '部署已排队', 'description': '构建完成后会自动发布。', 'closable': '' }, '<span slot="indicator">i</span>')
    await settle(el)

    const root = part(el, 'root')!
    expect(partsOf(root)).toEqual(['indicator', 'content', 'close-trigger'])
    expect(partsOf(part(el, 'content')!)).toEqual(['title', 'description'])
    expect(part(el, 'title')!.textContent).toBe('部署已排队')
    expect(root.getAttribute('aria-labelledby')).toBe(part(el, 'title')!.id)
    expect(root.getAttribute('aria-describedby')).toBe(part(el, 'description')!.id)
    expect(part(el, 'close-trigger')!.localName).toBe('button')
    expect(part(el, 'close-trigger')!.getAttribute('aria-label')).toBe('Close')
    expect(el.hasAttribute('title')).toBe(false)
    expect(records.filter(record => record.code.startsWith('wc.'))).toEqual([])
  })

  it('不写 closable 只有文本列；只给说明时 root 只描述、不命名', async () => {
    const el = mount({ description: '构建完成后会自动发布。' })
    await settle(el)
    const root = part(el, 'root')!
    expect(partsOf(root)).toEqual(['content'])
    expect(partsOf(part(el, 'content')!)).toEqual(['description'])
    expect(root.hasAttribute('aria-labelledby')).toBe(false)
    expect(root.getAttribute('aria-describedby')).toBe(part(el, 'description')!.id)
  })

  it('点生成的关闭钮收起提示并派发 open-change', async () => {
    const el = mount({ 'title-text': '已保存', 'closable': '' })
    await settle(el)
    const seen: unknown[] = []
    el.addEventListener('open-change', event => seen.push((event as CustomEvent).detail))
    part(el, 'close-trigger')!.click()
    await settle(el)
    expect(seen).toEqual([{ open: false }])
    expect(part(el, 'root')!.getAttribute('data-state')).toBe('closed')
  })
})
