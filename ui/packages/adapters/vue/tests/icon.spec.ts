// @vitest-environment jsdom
import type { IconRecord } from '@xihan-ui/kernel'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { XhIcon } from '../src'

const check: IconRecord = {
  name: 'check',
  viewBox: '0 0 24 24',
  attrs: {
    'fill': 'none',
    'stroke': 'currentColor',
    'stroke-width': '2',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  },
  nodes: [{ tag: 'path', attrs: { d: 'M20 6 9 17l-5-5' } }],
}

const badge: IconRecord = {
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

function attrNames(el: Element): string[] {
  return Array.from(el.attributes).map(a => a.name)
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('xhIcon 标记形状', () => {
  it('渲染 svg > g 两层，解剖标记与 viewBox 来自记录', () => {
    const w = mount(XhIcon, { props: { icon: check } })
    const root = w.element as SVGElement
    expect(root.tagName).toBe('svg')
    expect(root.namespaceURI).toBe('http://www.w3.org/2000/svg')
    expect(root.getAttribute('data-scope')).toBe('icon')
    expect(root.getAttribute('data-part')).toBe('root')
    expect(root.getAttribute('viewBox')).toBe('0 0 24 24')
    expect(root.getAttribute('data-icon')).toBe('check')

    const glyph = root.firstElementChild!
    expect(glyph.tagName).toBe('g')
    expect(glyph.namespaceURI).toBe('http://www.w3.org/2000/svg')
    // glyph 只带身份标记，别的一概不写
    expect(attrNames(glyph).sort()).toEqual(['data-part', 'data-scope'])
    expect(glyph.getAttribute('data-scope')).toBe('icon')
    expect(glyph.getAttribute('data-part')).toBe('glyph')
  })

  it('记录的呈现属性打在 root 上，连字符键逐字保留', () => {
    const w = mount(XhIcon, { props: { icon: check } })
    const root = w.element as SVGElement
    expect(root.getAttribute('fill')).toBe('none')
    expect(root.getAttribute('stroke')).toBe('currentColor')
    expect(root.getAttribute('stroke-width')).toBe('2')
    expect(root.getAttribute('stroke-linecap')).toBe('round')
    expect(root.getAttribute('stroke-linejoin')).toBe('round')
  })

  it('图元铺在 glyph 内部，属性逐字透传', () => {
    const w = mount(XhIcon, { props: { icon: check } })
    const path = w.element.querySelector('path')!
    expect(path.parentElement!.getAttribute('data-part')).toBe('glyph')
    expect(path.getAttribute('d')).toBe('M20 6 9 17l-5-5')
    expect(attrNames(path)).toEqual(['d'])
  })

  it('没传 icon 时 glyph 为空壳，root 上不写 viewBox 与 data-icon', () => {
    const w = mount(XhIcon)
    const root = w.element as SVGElement
    expect(root.hasAttribute('viewBox')).toBe(false)
    expect(root.hasAttribute('data-icon')).toBe(false)
    const glyph = root.firstElementChild!
    expect(glyph.getAttribute('data-part')).toBe('glyph')
    expect(glyph.childElementCount).toBe(0)
  })

  it('作者给了默认插槽时不生成 glyph，几何归作者', () => {
    const w = mount(XhIcon, {
      props: { label: '删除' },
      slots: { default: () => h('path', { d: 'M0 0h24' }) },
    })
    const root = w.element as SVGElement
    expect(root.querySelector('[data-part=\'glyph\']')).toBeNull()
    expect(root.querySelector('path')!.getAttribute('d')).toBe('M0 0h24')
    expect(root.getAttribute('aria-label')).toBe('删除')
  })
})

describe('xhIcon 嵌套建树', () => {
  it('defs / clipPath / 多层 g 逐层建出，标签大小写与深度不变', () => {
    const w = mount(XhIcon, { props: { icon: badge } })
    const glyph = w.element.firstElementChild!

    const defs = glyph.children[0]!
    expect(defs.tagName).toBe('defs')
    const clip = defs.children[0]!
    // SVG 命名空间下 setAttribute 不小写化，clipPath / clipPathUnits 的大小写原样保留
    expect(clip.tagName).toBe('clipPath')
    expect(clip.getAttribute('clipPathUnits')).toBe('userSpaceOnUse')
    expect(clip.getAttribute('id')).toBe('xh-badge-0')
    expect(clip.children[0]!.tagName).toBe('circle')
    expect(clip.children[0]!.getAttribute('r')).toBe('10')

    const g = glyph.children[1]!
    expect(g.tagName).toBe('g')
    expect(g.getAttribute('clip-path')).toBe('url(#xh-badge-0)')
    expect(g.children[0]!.tagName).toBe('rect')

    const inner = g.children[1]!
    expect(inner.getAttribute('transform')).toBe('translate(1 1)')
    expect(inner.children[0]!.tagName).toBe('line')
    expect(inner.children[0]!.getAttribute('x2')).toBe('18')

    // 整棵子树里没有一个 data- 前缀属性
    const all = Array.from<Element>(glyph.querySelectorAll('*'))
    const dataKeys = all.flatMap(el => attrNames(el)).filter(n => n.startsWith('data-'))
    expect(dataKeys).toEqual([])
  })

  it('所有图元都落在 SVG 命名空间', () => {
    const w = mount(XhIcon, { props: { icon: badge } })
    const all = Array.from<Element>(w.element.querySelectorAll('*'))
    expect(all.length).toBeGreaterThan(0)
    for (const el of all)
      expect(el.namespaceURI).toBe('http://www.w3.org/2000/svg')
  })
})

describe('xhIcon 命名两态', () => {
  it('给了名字：role=img + aria-label，不写 aria-hidden', () => {
    const root = mount(XhIcon, { props: { icon: check, label: '已通过' } }).element
    expect(root.getAttribute('role')).toBe('img')
    expect(root.getAttribute('aria-label')).toBe('已通过')
    expect(root.hasAttribute('aria-hidden')).toBe(false)
  })

  it('没给名字：aria-hidden=true，不写 role 与 aria-label', () => {
    const root = mount(XhIcon, { props: { icon: check } }).element
    expect(root.getAttribute('aria-hidden')).toBe('true')
    expect(root.hasAttribute('role')).toBe(false)
    expect(root.hasAttribute('aria-label')).toBe(false)
  })

  it('空串与纯空白的名字归装饰态', () => {
    for (const label of ['', '   ', '\t\n']) {
      const root = mount(XhIcon, { props: { icon: check, label } }).element
      expect(root.getAttribute('aria-hidden')).toBe('true')
      expect(root.hasAttribute('role')).toBe(false)
      expect(root.hasAttribute('aria-label')).toBe(false)
    }
  })

  it('label 变更后两态互换', async () => {
    const w = mount(XhIcon, { props: { icon: check } })
    expect(w.element.getAttribute('aria-hidden')).toBe('true')
    await w.setProps({ label: '已通过' })
    expect(w.element.getAttribute('role')).toBe('img')
    expect(w.element.getAttribute('aria-label')).toBe('已通过')
    expect(w.element.hasAttribute('aria-hidden')).toBe(false)
    await w.setProps({ label: undefined })
    expect(w.element.getAttribute('aria-hidden')).toBe('true')
    expect(w.element.hasAttribute('role')).toBe(false)
  })
})

describe('xhIcon 档位', () => {
  it('缺省档不输出 data-size 与 data-weight', () => {
    const root = mount(XhIcon, { props: { icon: check } }).element
    expect(root.hasAttribute('data-size')).toBe(false)
    expect(root.hasAttribute('data-weight')).toBe(false)
  })

  it('给了档位就输出，换档后跟着变', async () => {
    const w = mount(XhIcon, { props: { icon: check, size: 'lg', weight: 'bold' } })
    expect(w.element.getAttribute('data-size')).toBe('lg')
    expect(w.element.getAttribute('data-weight')).toBe('bold')
    await w.setProps({ size: 'sm', weight: undefined })
    expect(w.element.getAttribute('data-size')).toBe('sm')
    expect(w.element.hasAttribute('data-weight')).toBe(false)
  })
})

describe('xhIcon 换图标', () => {
  it('换记录后 data-icon 与图元一起换', async () => {
    const w = mount(XhIcon, { props: { icon: check } })
    expect(w.element.getAttribute('data-icon')).toBe('check')
    expect(w.element.querySelectorAll('path').length).toBe(1)
    await w.setProps({ icon: badge })
    expect(w.element.getAttribute('data-icon')).toBe('badge')
    expect(w.element.querySelectorAll('path').length).toBe(0)
    expect(w.element.querySelector('clipPath')).not.toBeNull()
  })
})

describe('xhIcon 服务端渲染', () => {
  async function ssr(props: Record<string, unknown>): Promise<string> {
    return renderToString(createSSRApp({ render: () => h(XhIcon, props) }))
  }

  it('产出完整 SVG，两层解剖与图元都在', async () => {
    const html = await ssr({ icon: check, label: '已通过' })
    expect(html).toContain('data-scope="icon"')
    expect(html).toContain('data-part="root"')
    expect(html).toContain('viewBox="0 0 24 24"')
    expect(html).toContain('data-icon="check"')
    expect(html).toContain('role="img"')
    expect(html).toContain('aria-label="已通过"')
    expect(html).not.toContain('aria-hidden')
    expect(html).toContain('<g data-scope="icon" data-part="glyph">')
    expect(html).toContain('d="M20 6 9 17l-5-5"')
  })

  it('装饰态的产出只有 aria-hidden', async () => {
    const html = await ssr({ icon: check })
    expect(html).toContain('aria-hidden="true"')
    expect(html).not.toContain('role="img"')
    expect(html).not.toContain('aria-label')
  })

  for (const [name, props] of [
    ['命名态', { icon: check, label: '已通过', size: 'lg' }],
    ['装饰态', { icon: check }],
    ['嵌套记录', { icon: badge, weight: 'bold' }],
    ['无图标', {}],
  ] as [string, Record<string, unknown>][]) {
    it(`${name}：服务端产出与客户端 DOM 逐字节同形状`, async () => {
      const html = await ssr(props)
      const host = document.createElement('div')
      host.innerHTML = html
      const client = mount(XhIcon, { props }).element
      expect(host.firstElementChild!.outerHTML).toBe(client.outerHTML)
    })
  }
})
