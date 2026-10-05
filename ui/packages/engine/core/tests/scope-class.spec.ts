// 皮肤挂载类：解剖给每个角色节点带 xh-scope-<组件名>，与 data-scope 一一对应。
import { describe, expect, it } from 'vitest'
import { createAnatomy, SCOPE_CLASS_PREFIX, scopeClass, stripScopeClass } from '../src'

describe('皮肤挂载类', () => {
  it('组件名加前缀即挂载类', () => {
    expect(SCOPE_CLASS_PREFIX).toBe('xh-scope-')
    expect(scopeClass('dialog')).toBe('xh-scope-dialog')
  })

  it('解剖的每个部件都带同一个挂载类，与 data-scope 同名', () => {
    const parts = createAnatomy('dialog', ['trigger', 'content']).build()
    expect(parts.trigger.attrs).toEqual({ 'data-scope': 'dialog', 'data-part': 'trigger', 'class': 'xh-scope-dialog' })
    expect(parts.content.attrs.class).toBe('xh-scope-dialog')
    // JS 侧查节点仍按属性：data-scope / data-part 是公开契约
    expect(parts.content.selector).toBe('[data-scope="dialog"][data-part="content"]')
  })

  it('stripScopeClass 只去挂载类，其余词与顺序原样', () => {
    expect(stripScopeClass('mine xh-scope-menu  other')).toBe('mine other')
    expect(stripScopeClass('xh-scope-menu')).toBe('')
    // 只认前缀开头的整词，作者恰好含这几个字母的类不受影响
    expect(stripScopeClass('my-xh-scope-like')).toBe('my-xh-scope-like')
  })
})
