// @vitest-environment jsdom
// 侧栏导航的标准结构：按 collection 铺整棵树，图标是一枚组合进来的 Icon；
// 落成图标栏后顶层分支的子层外面套一层定位层，嵌套的子层不套。
import type { StructureChild } from '../src/shared/structure'
import type { SideNavNode, SideNavSchema } from '../src/side-nav'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it } from 'vitest'
import { connectSideNav, sideNavMachine, sideNavStructure } from '../src/side-nav'

type Props = SideNavSchema['props']

const ICON = { viewBox: '0 0 24 24', nodes: [] } as unknown as NonNullable<SideNavNode['icon']>

const COLLECTION: SideNavNode[] = [
  { value: 'home', label: '工作台', href: '#home', icon: ICON },
  {
    value: 'user',
    label: '用户管理',
    icon: ICON,
    children: [
      { value: 'user-list', label: '用户列表', href: '#user-list' },
      { value: 'audit', children: [{ value: 'audit-log', label: '日志' }] },
    ],
  },
]

function api(props: Partial<Props>) {
  const runtime = createVanillaRuntime()
  const service = createService(sideNavMachine, { runtime, props: () => ({ collection: COLLECTION, ...props }) as Props })
  runtime.start()
  return connectSideNav(service, normalizeProps)
}

function outline(nodes: readonly StructureChild[], depth = 0): string[] {
  return nodes.flatMap((node) => {
    const pad = '  '.repeat(depth)
    if ('instance' in node)
      return [`${pad}<${node.instance}>`]
    if (!('part' in node))
      return [`${pad}other`]
    const attrs = node.attrs ? ` ${JSON.stringify(node.attrs)}` : ''
    return [`${pad}${node.tag}|${node.part}|${node.text ?? ''}${attrs}`, ...outline(node.children ?? [], depth + 1)]
  })
}

describe('sideNavStructure', () => {
  it('平铺：叶子是 li 里的链接，分支是行按钮加子层；给了图标的行图标在前，文字缺省回退为 value', () => {
    expect(outline(sideNavStructure(api({})))).toEqual([
      'ul|list|',
      '  li|item|',
      '    a|link| {"value":"home"}',
      '      <icon>',
      '      span|link-text|工作台',
      '  li|branch| {"value":"user"}',
      '    button|branch-trigger|',
      '      <icon>',
      '      span|branch-text|用户管理',
      '      span|branch-indicator|',
      '    ul|branch-content|',
      '      li|item|',
      '        a|link| {"value":"user-list"}',
      '          span|link-text|用户列表',
      '      li|branch| {"value":"audit"}',
      '        button|branch-trigger|',
      '          span|branch-text|audit',
      '          span|branch-indicator|',
      '        ul|branch-content|',
      '          li|item|',
      '            a|link| {"value":"audit-log"}',
      '              span|link-text|日志',
    ])
  })

  it('图标栏：顶层分支的子层外面套定位层，面板里的嵌套分支照旧是子层', () => {
    const lines = outline(sideNavStructure(api({ collapsed: true })))
    expect(lines.filter(line => line.includes('|positioner|'))).toEqual(['    div|positioner|'])
    expect(lines.indexOf('    div|positioner|')).toBe(lines.indexOf('      ul|branch-content|') - 1)
    expect(lines).toContain('          ul|branch-content|')
  })

  it('图标栏关掉弹出时没有定位层；没有入口时什么都不铺', () => {
    expect(outline(sideNavStructure(api({ collapsed: true, collapsedPopout: false }))).some(line => line.includes('positioner'))).toBe(false)
    expect(sideNavStructure(api({ collection: [] }))).toEqual([])
  })

  it('组合进来的图标按 icon 传：Vue / React 渲 Icon 的根组件，Web Components 生成 xh-icon', () => {
    const link = sideNavStructure(api({}))[0]!.children?.[0]
    const anchor = link && 'children' in link ? link.children?.[0] : undefined
    const icon = anchor && 'children' in anchor ? anchor.children?.[0] : undefined
    expect(icon).toEqual({ key: 'icon', instance: 'icon', props: { icon: ICON } })
  })
})
