// @vitest-environment jsdom
import type { IconRecord } from '@xihan-ui/core'
import type { IconProps } from '../src/icon'
import { normalizeProps } from '@xihan-ui/core'
import { describe, expect, it } from 'vitest'
// 直接指到组件目录：包主入口的导出由接线一并补，测试不等它
import { connectIcon, iconAnatomy, iconKeyboard, iconMeta } from '../src/icon'

type Dict = Record<string, unknown>

const check: IconRecord = {
  name: 'check',
  viewBox: '0 0 24 24',
  attrs: {
    'fill': 'none',
    'stroke': 'currentColor',
    'stroke-width': '2',
    'stroke-linecap': 'round',
  },
  nodes: [
    { tag: 'path', attrs: { d: 'M20 6 9 17l-5-5' } },
  ],
}

// 嵌套：clipPath 里再套图元，用来验证 nodes 原样透出、不被拍平
const nested: IconRecord = {
  name: 'nested',
  viewBox: '0 0 32 32',
  nodes: [
    {
      tag: 'defs',
      children: [
        {
          tag: 'clipPath',
          attrs: { id: 'xh-nested-0' },
          children: [{ tag: 'rect', attrs: { x: '0', y: '0', width: '32', height: '32' } }],
        },
      ],
    },
    { tag: 'g', attrs: { 'clip-path': 'url(#xh-nested-0)' }, children: [{ tag: 'circle', attrs: { cx: '16', cy: '16', r: '8' } }] },
  ],
}

function api(props: IconProps = {}) {
  return connectIcon(props, normalizeProps)
}

function root(props: IconProps = {}): Dict {
  return api(props).getRootProps() as Dict
}

describe('icon 解剖', () => {
  it('两个部件：svg 本身与作者留出的空壳，只有 root 是必需的', () => {
    expect(iconAnatomy.build().root.attrs).toEqual({ 'data-scope': 'icon', 'data-part': 'root' })
    expect(iconAnatomy.build().glyph.attrs).toEqual({ 'data-scope': 'icon', 'data-part': 'glyph' })
    expect(iconMeta.requiredParts).toEqual(['root'])
  })

  it('不可聚焦、不接任何键', () => {
    expect(iconKeyboard.rows).toEqual([])
  })
})

describe('connectIcon 命名两态', () => {
  it('label 有非空白文本：role="img" + aria-label，不写 aria-hidden', () => {
    const attrs = root({ icon: check, label: '已通过' })
    expect(attrs.role).toBe('img')
    expect(attrs['aria-label']).toBe('已通过')
    expect(attrs['aria-hidden']).toBeUndefined()
    expect(api({ icon: check, label: '已通过' }).decorative).toBe(false)
    expect(api({ icon: check, label: '已通过' }).label).toBe('已通过')
  })

  it('label 缺席：aria-hidden="true"，不写 role、不写 aria-label', () => {
    const attrs = root({ icon: check })
    expect(attrs['aria-hidden']).toBe(true)
    expect(attrs.role).toBeUndefined()
    expect(attrs['aria-label']).toBeUndefined()
    expect(api({ icon: check }).decorative).toBe(true)
    expect(api({ icon: check }).label).toBeUndefined()
  })

  it('空串与纯空白不算给过名字：认了它就得到一个有 role="img" 却没有名字的对象', () => {
    for (const label of ['', '   ']) {
      const attrs = root({ icon: check, label })
      expect(attrs['aria-hidden']).toBe(true)
      expect(attrs.role).toBeUndefined()
      expect(attrs['aria-label']).toBeUndefined()
      expect(api({ icon: check, label }).decorative).toBe(true)
      expect(api({ icon: check, label }).label).toBeUndefined()
    }
  })

  it('名字前后的空白原样保留：只用来判断给没给，不改写作者的文案', () => {
    expect(root({ label: ' 已通过 ' })['aria-label']).toBe(' 已通过 ')
  })
})

describe('connectIcon 记录属性', () => {
  it('记录的呈现属性铺在 root 上，键逐字保留连字符', () => {
    const attrs = root({ icon: check })
    expect(attrs.fill).toBe('none')
    expect(attrs.stroke).toBe('currentColor')
    expect(attrs['stroke-width']).toBe('2')
    expect(attrs['stroke-linecap']).toBe('round')
  })

  it('viewBox 来自记录；没传图标时不写', () => {
    expect(root({ icon: check }).viewBox).toBe('0 0 24 24')
    expect(root({ icon: nested }).viewBox).toBe('0 0 32 32')
    expect(root().viewBox).toBeUndefined()
  })

  it('data-icon 是记录的规范化名', () => {
    expect(root({ icon: check })['data-icon']).toBe('check')
    expect(root()['data-icon']).toBeUndefined()
  })

  it('解剖标记与语义属性写在记录之后：记录里出现同名键也盖不掉', () => {
    const rogue: IconRecord = {
      name: 'rogue',
      viewBox: '0 0 24 24',
      attrs: {
        'data-scope': 'evil',
        'data-part': 'evil',
        'data-icon': 'evil',
        'data-size': 'lg',
        'data-weight': 'bold',
        'role': 'button',
        'aria-label': '越权的名字',
        'aria-hidden': 'false',
        'viewBox': '0 0 999 999',
      },
      nodes: [{ tag: 'path', attrs: { d: 'M0 0' } }],
    }

    const decorated = root({ icon: rogue })
    expect(decorated['data-scope']).toBe('icon')
    expect(decorated['data-part']).toBe('root')
    expect(decorated['data-icon']).toBe('rogue')
    expect(decorated.viewBox).toBe('0 0 24 24')
    expect(decorated['aria-hidden']).toBe(true)
    expect(decorated.role).toBeUndefined()
    expect(decorated['aria-label']).toBeUndefined()
    // 档位只认 props，记录写不进去
    expect(decorated['data-size']).toBeUndefined()
    expect(decorated['data-weight']).toBeUndefined()

    const named = root({ icon: rogue, label: '删除' })
    expect(named.role).toBe('img')
    expect(named['aria-label']).toBe('删除')
    expect(named['aria-hidden']).toBeUndefined()
  })
})

describe('connectIcon 档位', () => {
  it('缺省档不写属性：皮肤的基础规则就是缺省档', () => {
    const attrs = root({ icon: check })
    expect(attrs['data-size']).toBeUndefined()
    expect(attrs['data-weight']).toBeUndefined()
  })

  it('给了档位就原样写出去', () => {
    expect(root({ size: 'sm' })['data-size']).toBe('sm')
    expect(root({ size: 'lg' })['data-size']).toBe('lg')
    expect(root({ weight: 'light' })['data-weight']).toBe('light')
    expect(root({ weight: 'bold' })['data-weight']).toBe('bold')
  })
})

describe('connectIcon 图元树', () => {
  it('没传图标：nodes 是空数组、content 是 undefined', () => {
    expect(api().nodes).toEqual([])
    expect(api().content).toBeUndefined()
    // 恒等的空树，反复调用不换新数组
    expect(api().nodes).toBe(api().nodes)
  })

  it('nodes 原样透出，含任意深度的 children', () => {
    expect(api({ icon: check }).nodes).toBe(check.nodes)
    expect(api({ icon: nested }).nodes).toBe(nested.nodes)
    expect(api({ icon: nested }).nodes).toEqual([
      {
        tag: 'defs',
        children: [
          {
            tag: 'clipPath',
            attrs: { id: 'xh-nested-0' },
            children: [{ tag: 'rect', attrs: { x: '0', y: '0', width: '32', height: '32' } }],
          },
        ],
      },
      { tag: 'g', attrs: { 'clip-path': 'url(#xh-nested-0)' }, children: [{ tag: 'circle', attrs: { cx: '16', cy: '16', r: '8' } }] },
    ])
  })

  it('content 就是记录本身：引用相等即内容相等，两端据此判断要不要重铺', () => {
    expect(api({ icon: check }).content).toBe(check)
    expect(api({ icon: nested }).content).toBe(nested)
  })
})

describe('connectIcon 空壳', () => {
  it('glyph 只带身份标记：命名归 root，内容由两端按 nodes 铺', () => {
    expect(api({ icon: check, label: '已通过' }).getGlyphProps()).toEqual({
      'data-scope': 'icon',
      'data-part': 'glyph',
    })
  })
})
