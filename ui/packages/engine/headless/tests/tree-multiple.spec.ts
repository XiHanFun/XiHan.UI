// 树的选择模式：新的 multiple 布尔与旧的 selectionMode 枚举同指一件事。
//
// TreeSelectionMode 只有 single | multiple 两个取值，与布尔等价——而同族的 tree-select
// 与另外六家都用 multiple?: boolean。两者同时给时以 selectionMode 为准（与 listbox 同一条
// 规矩），过渡期里旧代码的行为因此一点不变。
import { describe, expect, it } from 'vitest'
import { treeSelectionMode } from '../src/tree/tree.machine'

describe('树的选择模式', () => {
  it('两个都没写即单选', () => {
    expect(treeSelectionMode(undefined, undefined)).toBe('single')
  })

  it('只写 multiple', () => {
    expect(treeSelectionMode(undefined, true)).toBe('multiple')
    expect(treeSelectionMode(undefined, false)).toBe('single')
  })

  it('只写旧的 selectionMode 时照旧生效', () => {
    expect(treeSelectionMode('multiple', undefined)).toBe('multiple')
    expect(treeSelectionMode('single', undefined)).toBe('single')
  })

  it('两个都写时以 selectionMode 为准——旧代码行为不变', () => {
    expect(treeSelectionMode('single', true)).toBe('single')
    expect(treeSelectionMode('multiple', false)).toBe('multiple')
  })
})
