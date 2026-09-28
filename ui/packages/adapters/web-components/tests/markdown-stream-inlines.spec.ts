// @vitest-environment jsdom
// 流式正文里的行内挂点：新铺出的占位节点报给作者，作者挂进去的节点不被下一轮铺块冲掉；
// 写成外层 xh-citation 的 trigger 并声明归属时，外层引用元素认领并接线。
import type { MarkdownBlock, MarkdownInlineMount } from '@xihan-ui/headless'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface Updatable extends HTMLElement { updateComplete: Promise<unknown> }

async function settle(): Promise<void> {
  for (let round = 0; round < 4; round++) {
    await Promise.resolve()
    for (const el of document.querySelectorAll<Updatable>('xh-markdown-stream, xh-citation'))
      await el.updateComplete
  }
}

afterEach(() => {
  document.body.innerHTML = ''
})

const CITED: MarkdownBlock = {
  key: '0:a',
  kind: 'markdown',
  html: '<p>结论<span data-md-inline="0" data-md-citation="report">[report]</span>。</p>',
  complete: true,
  inlines: [{ kind: 'citation', sourceIds: ['report'] }],
}

const TAIL: MarkdownBlock = { key: 'live', kind: 'markdown', html: '<p>还在写</p>', complete: false }

function markdownStream(): Updatable & { blocks?: readonly MarkdownBlock[] } {
  const el = document.createElement('xh-markdown-stream') as Updatable & { blocks?: readonly MarkdownBlock[] }
  el.innerHTML = '<div data-xh-part="root"><div data-xh-part="content"></div></div>'
  return el
}

describe('xh-markdown-stream 行内挂点', () => {
  it('新铺出的占位节点派发 inline-mount，detail 带块、下标与挂点内容', async () => {
    const el = markdownStream()
    const seen: MarkdownInlineMount[] = []
    el.addEventListener('inline-mount', event => seen.push((event as CustomEvent<MarkdownInlineMount>).detail))
    el.blocks = [CITED]
    document.body.append(el)
    await settle()
    expect(seen).toHaveLength(1)
    expect(seen[0]!.inline).toEqual({ kind: 'citation', sourceIds: ['report'] })
    expect(seen[0]!.element.getAttribute('data-md-inline')).toBe('0')
    expect(seen[0]!.key).toBe('0:a:0')
  })

  it('作者挂进去的节点在块没变时留着，块没重铺也不再派发', async () => {
    const el = markdownStream()
    let count = 0
    el.addEventListener('inline-mount', (event) => {
      count += 1
      const { element } = (event as CustomEvent<MarkdownInlineMount>).detail
      element.innerHTML = '<b class="probe">1</b>'
    })
    el.blocks = [CITED]
    document.body.append(el)
    await settle()
    el.blocks = [CITED, TAIL]
    await settle()
    expect(count).toBe(1)
    expect(el.querySelector('.probe')).not.toBeNull()
  })

  it('声明归属的 trigger 由外层 xh-citation 认领并接线', async () => {
    const citation = document.createElement('xh-citation') as Updatable & { sources?: unknown }
    citation.sources = [{ type: 'source-url', sourceId: 'report', url: 'https://example.com/r', title: '报告' }]
    citation.innerHTML = `
      <div data-xh-part="root">
        <div data-xh-part="text"></div>
        <div data-xh-part="preview" value="report"><div data-xh-part="preview-title"></div></div>
        <div data-xh-part="list"><div data-xh-part="source" value="report"><button data-xh-part="source-link"></button></div></div>
      </div>`
    const md = markdownStream()
    md.addEventListener('inline-mount', (event) => {
      const { element, inline } = (event as CustomEvent<MarkdownInlineMount>).detail
      if (inline.kind !== 'citation')
        return
      const trigger = document.createElement('button')
      trigger.setAttribute('data-xh-part', 'trigger')
      trigger.setAttribute('data-xh-part-owner', 'citation')
      trigger.setAttribute('value', inline.sourceIds[0]!)
      trigger.textContent = '1'
      element.append(trigger)
    })
    md.blocks = [CITED]
    citation.querySelector('[data-xh-part="text"]')!.append(md)
    document.body.append(citation)
    await settle()
    const trigger = md.querySelector<HTMLElement>('[data-xh-part="trigger"]')!
    expect(trigger.getAttribute('data-scope')).toBe('citation')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    trigger.click()
    await settle()
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    // 内层正文元素不替外层接线：trigger 上没有 markdown-stream 的作用域
    expect(md.querySelectorAll('[data-scope="markdown-stream"][data-part="trigger"]')).toHaveLength(0)
  })
})
