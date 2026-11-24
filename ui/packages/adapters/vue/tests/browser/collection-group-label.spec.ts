// 集合里的分组：标题与组间隔开的方式，全家一种。
//
// 分组标题是一行小号次级文字：说明档 12px、中等字重、所在面的次要字色（frosted 浮层上取材质的 muted）。
// 不取 --xh-fg-subtle：那一档留给占位字与禁用标签，拿来画标题就与禁用的条目分不开。
// 组与组之间：浮层里的候选面板（Select、Combobox、Cascader）画一道面内分隔线、线下留 6px；
// 页内列表与命令面板（Listbox、Transfer、Command）不画线，只留 6px。
//
// 这里只验皮肤：作者节点按连接层的投影写好 data-scope / data-part 与挂载类，量计算样式。
import { afterEach, describe, expect, it } from 'vitest'
import { tokenLength, tokenValue } from './design-token'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

type Material = 'frosted' | 'solid'

/** 各家分组标题所在面的材质：决定次要字色取哪一支。 */
const LABELS: Record<string, Material> = {
  'menu': 'frosted',
  'context-menu': 'frosted',
  'menubar': 'frosted',
  'select': 'frosted',
  'combobox': 'frosted',
  'cascader': 'solid',
  'listbox': 'solid',
  'transfer': 'solid',
  'command': 'solid',
  'side-nav': 'solid',
}

/** 画线的候选面板与所在面的面内分隔令牌。 */
const LINED: Record<string, string> = {
  select: '--xh-material-frosted-separator',
  combobox: '--xh-material-frosted-separator',
  cascader: '--xh-material-solid-separator',
}

const SPACED = ['listbox', 'transfer', 'command'] as const

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

function node(scope: string, part: string, inner = ''): string {
  return `<div data-scope="${scope}" class="xh-scope-${scope}" data-part="${part}">${inner}</div>`
}

function mount(scope: string): HTMLElement[] {
  const group = (label: string) => node(scope, 'group', node(scope, 'group-label', label) + node(scope, 'item', `${label}一`))
  host = document.createElement('div')
  host.innerHTML = node(scope, 'content', group('最近') + group('全部'))
  document.body.append(host)
  return [...host.querySelectorAll<HTMLElement>(`[data-part='group']`)]
}

describe('集合分组标题', () => {
  it.each(Object.entries(LABELS))('%s：说明档字号、中等字重、所在面的次要字色', (scope, material) => {
    const [first] = mount(scope)
    const label = getComputedStyle(first!.querySelector<HTMLElement>(`[data-part='group-label']`)!)
    expect(label.fontSize).toBe(`${tokenLength('--xh-text-caption-size')}px`)
    expect(label.fontWeight).toBe(tokenValue('font-weight', '--xh-font-weight-medium'))
    const muted = material === 'frosted' ? '--xh-material-frosted-fg-muted' : '--xh-fg-muted'
    expect(label.color).toBe(tokenValue('color', muted))
  })
})

describe('组与组之间', () => {
  it.each(Object.entries(LINED))('%s：后继分组顶上一道面内分隔线，线下留 6px', (scope, separator) => {
    const [, second] = mount(scope)
    const style = getComputedStyle(second!)
    expect(style.borderTopStyle).toBe('solid')
    expect(style.borderTopWidth).toBe(`${tokenLength('--xh-stroke-thin')}px`)
    expect(style.borderTopColor).toBe(tokenValue('border-top-color', separator))
    expect(style.paddingTop).toBe(`${tokenLength('--xh-space-1_5')}px`)
    expect(style.marginTop).toBe('0px')
  })

  it.each(SPACED)('%s：不画线，后继分组只隔 6px', (scope) => {
    const [, second] = mount(scope)
    const style = getComputedStyle(second!)
    expect(style.borderTopWidth).toBe('0px')
    expect(style.marginTop).toBe(`${tokenLength('--xh-space-1_5')}px`)
  })
})
