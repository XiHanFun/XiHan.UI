// 一个角色节点同时接两份 connect 产出时，挂载类随 data-scope 让位给节点自己的解剖。
import { describe, expect, it } from 'vitest'
import { mergeAsChildProps } from '../src/dom/as-child'

describe('mergeAsChildProps 的皮肤挂载类', () => {
  it('节点自己的挂载类留着，部件那份只合作者的类、不带它的 xh-scope-*', () => {
    const merged = mergeAsChildProps(
      { 'data-scope': 'menu', 'data-part': 'trigger', 'class': 'xh-scope-menu author', 'id': 'menu-trigger' },
      { 'data-scope': 'tooltip', 'data-part': 'trigger', 'class': 'xh-scope-tooltip' },
    )
    expect(merged['data-scope']).toBe('tooltip')
    expect(String(merged.class).split(/\s+/)).toEqual(['xh-scope-tooltip', 'author'])
    expect(merged.id).toBe('menu-trigger')
  })

  it('部件那份只有挂载类时不额外写 class', () => {
    const merged = mergeAsChildProps({ class: 'xh-scope-menu' }, { class: 'xh-scope-tooltip' })
    expect(merged.class).toBe('xh-scope-tooltip')
  })
})
