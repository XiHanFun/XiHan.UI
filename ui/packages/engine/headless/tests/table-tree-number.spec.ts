// 表格的树形子行、大纲编号与前缀列。
//
// 最要紧的一条：收起某一枝时，仍在场的行编号一个都不变。
// 编号取「在父的 children 里的下标」而不是可见序——取可见序的话收起一枝，
// 其后所有行的号会整体前移，用户看到的是「序号跳了」。
import type { TableRowDef } from '../src/table'
import { describe, expect, it } from 'vitest'
import { flattenTableRows } from '../src/table'

/** 目录 → 菜单 → 按钮 三层。 */
const tree: TableRowDef[] = [
  { id: 'system' },
  { id: 'user', parentId: 'system' },
  { id: 'user:add', parentId: 'user' },
  { id: 'user:del', parentId: 'user' },
  { id: 'role', parentId: 'system' },
  { id: 'role:add', parentId: 'role' },
  { id: 'log' },
]

function outlines(expanded: string[]): Array<[string, string]> {
  return flattenTableRows(tree, expanded)
    .filter(row => row.kind === 'data')
    .map(row => [row.id, row.outline])
}

describe('树形子行', () => {
  it('不展开时只见根行', () => {
    expect(outlines([])).toEqual([['system', '1'], ['log', '2']])
  })

  it('展开一层：子行按定义序编号', () => {
    expect(outlines(['system'])).toEqual([
      ['system', '1'],
      ['user', '1.1'],
      ['role', '1.2'],
      ['log', '2'],
    ])
  })

  it('展开两层：编号继续往下拼', () => {
    expect(outlines(['system', 'user'])).toEqual([
      ['system', '1'],
      ['user', '1.1'],
      ['user:add', '1.1.1'],
      ['user:del', '1.1.2'],
      ['role', '1.2'],
      ['log', '2'],
    ])
  })

  it('收起某一枝，仍在场的行编号一个都不变', () => {
    const before = new Map(outlines(['system', 'user', 'role']))
    const after = new Map(outlines(['system', 'role']))

    // user 那一枝收起来了，它的子行不在场；其余每一行的编号逐一对上
    expect(after.has('user:add')).toBe(false)
    for (const [id, num] of after)
      expect(num).toBe(before.get(id))
    // 尤其是排在收起那一枝后面的：可见序变了，编号没变
    expect(after.get('role')).toBe('1.2')
    expect(after.get('log')).toBe('2')
  })

  it('层级三件套按真实层级给，不是写死的 1', () => {
    const rows = flattenTableRows(tree, ['system', 'user'])
    const byId = new Map(rows.filter(r => r.kind === 'data').map(r => [r.id, r]))

    expect(byId.get('system')).toMatchObject({ level: 1, posInSet: 1, setSize: 2 })
    expect(byId.get('user')).toMatchObject({ level: 2, posInSet: 1, setSize: 2 })
    expect(byId.get('user:add')).toMatchObject({ level: 3, posInSet: 1, setSize: 2 })
    expect(byId.get('log')).toMatchObject({ level: 1, posInSet: 2, setSize: 2 })
  })

  it('有子行的行不再产出详情行：两种展开互斥', () => {
    const rows = flattenTableRows(
      [{ id: 'a', expandable: true }, { id: 'a-1', parentId: 'a' }],
      ['a'],
    )
    expect(rows.map(r => [r.id, r.kind])).toEqual([['a', 'data'], ['a-1', 'data']])
  })

  it('没有子行的行照旧展开出详情行', () => {
    const rows = flattenTableRows([{ id: 'a', expandable: true }], ['a'])
    expect(rows.map(r => [r.id, r.kind])).toEqual([['a', 'data'], ['a', 'expanded']])
  })

  it('父行不存在时按根行处理，不吞掉这一行', () => {
    const rows = flattenTableRows([{ id: 'orphan', parentId: 'nobody' }], [])
    expect(rows.map(r => [r.id, r.outline])).toEqual([['orphan', '1']])
  })

  it('平表一行不改：没有 parentId 时与升级前一致', () => {
    const rows = flattenTableRows([{ id: 'a' }, { id: 'b' }, { id: 'c' }], [])
    expect(rows.map(r => r.id)).toEqual(['a', 'b', 'c'])
    expect(rows.every(r => r.level === 1)).toBe(true)
  })
})
