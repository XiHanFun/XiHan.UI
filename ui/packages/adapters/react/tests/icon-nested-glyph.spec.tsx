// @vitest-environment jsdom
//
// 图元树逐层铺进 glyph 时，标签与属性名要逐字保留。共享的一致性套件核到了连字符
// （fill-rule）与一层嵌套，核不到大小写这一路：defs / clipPath / clipPathUnits 这类
// 驼峰名字在 HTML 命名空间下会被小写化，小写之后 clipPath 不再是裁剪路径，整个图标空白。
import type { IconRecord } from '@xihan-ui/core'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { XhIcon } from '../src'

const SVG_NS = 'http://www.w3.org/2000/svg'

const BADGE: IconRecord = {
  name: 'badge',
  viewBox: '0 0 24 24',
  nodes: [
    {
      tag: 'defs',
      children: [
        {
          tag: 'clipPath',
          attrs: { id: 'xh-badge-0', clipPathUnits: 'userSpaceOnUse' },
          children: [{ tag: 'circle', attrs: { cx: '12', cy: '12', r: '10' } }],
        },
      ],
    },
    {
      tag: 'g',
      attrs: { 'clip-path': 'url(#xh-badge-0)', 'stroke-linecap': 'round' },
      children: [
        { tag: 'rect', attrs: { x: '2', y: '2', width: '20', height: '20' } },
        {
          tag: 'g',
          attrs: { transform: 'translate(1 1)' },
          children: [{ tag: 'line', attrs: { x1: '4', y1: '4', x2: '18', y2: '18' } }],
        },
      ],
    },
  ],
}

let host: HTMLElement | null = null
let root: ReturnType<typeof createRoot> | null = null

afterEach(async () => {
  await act(async () => {
    root?.unmount()
  })
  host?.remove()
  root = null
  host = null
})

async function mountIcon(): Promise<Element> {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  await act(async () => {
    root!.render(<XhIcon icon={BADGE} />)
  })
  return host.firstElementChild!.firstElementChild!
}

describe('xhIcon 嵌套建树', () => {
  it('defs / clipPath / 多层 g 逐层建出，标签大小写与深度不变', async () => {
    const glyph = await mountIcon()

    const defs = glyph.children[0]!
    expect(defs.localName).toBe('defs')
    const clip = defs.children[0]!
    // SVG 命名空间下 createElementNS 不小写化，clipPath / clipPathUnits 的大小写原样保留
    expect(clip.localName).toBe('clipPath')
    expect(clip.getAttribute('clipPathUnits')).toBe('userSpaceOnUse')
    expect(clip.getAttribute('id')).toBe('xh-badge-0')
    expect(clip.children[0]!.localName).toBe('circle')
    expect(clip.children[0]!.getAttribute('r')).toBe('10')

    const g = glyph.children[1]!
    expect(g.localName).toBe('g')
    expect(g.getAttribute('clip-path')).toBe('url(#xh-badge-0)')
    expect(g.children[0]!.localName).toBe('rect')

    const inner = g.children[1]!
    expect(inner.getAttribute('transform')).toBe('translate(1 1)')
    expect(inner.children[0]!.localName).toBe('line')
    expect(inner.children[0]!.getAttribute('x2')).toBe('18')
  })

  it('整棵子树落在 SVG 命名空间，且没有一个 data- 前缀属性', async () => {
    const glyph = await mountIcon()
    const all = [...glyph.querySelectorAll('*')]
    expect(all.length).toBeGreaterThan(0)
    for (const el of all)
      expect(el.namespaceURI).toBe(SVG_NS)
    const dataKeys = all.flatMap(el => el.getAttributeNames()).filter(n => n.startsWith('data-'))
    expect(dataKeys).toEqual([])
  })

  it('SVG 连字符属性先转成 React 属性名，不产生无效 DOM 属性警告', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      await mountIcon()
      expect(error).not.toHaveBeenCalled()
    }
    finally {
      error.mockRestore()
    }
  })
})
