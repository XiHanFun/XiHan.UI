// @vitest-environment jsdom
import type { MarkdownBlock } from '../src/markdown-stream'
import { describe, expect, it } from 'vitest'
import { MARKDOWN_INLINE_ATTR, queryMarkdownInlines, sameMarkdownInlines } from '../src/markdown-stream'

/** 照适配器的铺法搭一份 content：块节点是直接子节点，markdown 块铺 html。 */
function content(blocks: readonly MarkdownBlock[], authored: readonly number[] = []): HTMLElement {
  const root = document.createElement('div')
  blocks.forEach((block, index) => {
    const node = document.createElement('div')
    node.setAttribute('data-scope', 'markdown-stream')
    node.setAttribute('data-part', 'block')
    if (authored.includes(index))
      node.textContent = '作者接管的块'
    else
      node.innerHTML = block.html
    root.append(node)
  })
  return root
}

const CITED: MarkdownBlock = {
  key: '0:a',
  kind: 'markdown',
  html: '<p>结论<span data-md-inline="0" data-md-citation="s1">[s1]</span>与<span data-md-inline="1" data-md-math="inline">x</span></p>',
  complete: true,
  inlines: [
    { kind: 'citation', sourceIds: ['s1'] },
    { kind: 'math', source: 'x', display: false },
  ],
}

describe('行内挂点的查找', () => {
  it('按块的先后找出占位节点，挂上块、块内下标与稳定 key', () => {
    const plain: MarkdownBlock = { key: '1:b', kind: 'markdown', html: '<p>无挂点</p>', complete: true }
    const root = content([CITED, plain])
    const mounts = queryMarkdownInlines(root, [CITED, plain])
    expect(mounts.map(mount => mount.key)).toEqual(['0:a:0', '0:a:1'])
    expect(mounts[0]!.inline).toBe(CITED.inlines![0])
    expect(mounts[1]!.element.getAttribute(MARKDOWN_INLINE_ATTR)).toBe('1')
    expect(mounts[1]!.block).toBe(CITED)
  })

  it('作者接管的块没有铺 html，也就没有挂点', () => {
    const root = content([CITED], [0])
    expect(queryMarkdownInlines(root, [CITED])).toEqual([])
  })

  it('下标越界的占位节点跳过，不拿别的挂点顶上', () => {
    const broken: MarkdownBlock = { ...CITED, inlines: [CITED.inlines![0]!] }
    const mounts = queryMarkdownInlines(content([broken]), [broken])
    expect(mounts.map(mount => mount.index)).toEqual([0])
  })

  it('同一批节点判为相同，节点换了判为不同', () => {
    const root = content([CITED])
    const a = queryMarkdownInlines(root, [CITED])
    expect(sameMarkdownInlines(a, queryMarkdownInlines(root, [CITED]))).toBe(true)
    root.firstElementChild!.innerHTML = CITED.html
    expect(sameMarkdownInlines(a, queryMarkdownInlines(root, [CITED]))).toBe(false)
  })
})
