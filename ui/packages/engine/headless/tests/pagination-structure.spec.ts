import type { StructureChild, StructureNode } from '../src/shared/structure'
import { describe, expect, it } from 'vitest'
import { buildPageItems, paginationStructure } from '../src/pagination'

// 结构只取 pageItems：页码序列本身（哪几页该出、省略位落在哪）由 pagination.spec 按不变量守，
// 这里核的是「给定序列，铺出来的部件、key 与身份属性对不对」。
function nodesOf(page: number, totalPages: number): StructureNode[] {
  return paginationStructure({ pageItems: buildPageItems(page, totalPages, 1) }) as StructureNode[]
}
const parts = (nodes: readonly StructureChild[]): string[] => nodes.map(node => ('part' in node ? node.part : 'other'))

describe('paginationStructure', () => {
  it('上一页、折叠后的页码序列、下一页；页码写 value 与文字，省略位写所在的一侧', () => {
    const nodes = nodesOf(1, 10)
    expect(parts(nodes)).toEqual(['prev-trigger', 'item', 'item', 'item', 'item', 'item', 'ellipsis-trigger', 'item', 'next-trigger'])
    expect(nodes[1]).toEqual({ key: 'item:1', tag: 'button', part: 'item', attrs: { value: '1' }, text: '1' })
    expect(nodes[6]).toEqual({ key: 'ellipsis:end', tag: 'button', part: 'ellipsis-trigger', attrs: { side: 'end' } })
    expect(nodes[7]).toMatchObject({ key: 'item:10', attrs: { value: '10' }, text: '10' })
  })

  it('翻页钮与省略位不放内容：字形由皮肤在空按钮上画', () => {
    const nodes = nodesOf(5, 10)
    for (const node of nodes.filter(n => n.part !== 'item'))
      expect(node.text === undefined && node.children === undefined && node.slot === undefined, node.key).toBe(true)
  })

  it('两侧都折叠时两个省略位按所在的一侧区分 key，同一父节点下 key 不重复', () => {
    const nodes = nodesOf(5, 10)
    expect(nodes.filter(n => n.part === 'ellipsis-trigger').map(n => n.key)).toEqual(['ellipsis:start', 'ellipsis:end'])
    const keys = nodes.map(n => n.key)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('翻页后同一个页码沿用同一个 key，节点按值复用', () => {
    const before = new Set(nodesOf(4, 10).map(n => n.key))
    const after = nodesOf(5, 10).map(n => n.key)
    expect(after.filter(key => key.startsWith('item:') && before.has(key))).toEqual(['item:1', 'item:4', 'item:5', 'item:10'])
  })

  it('没有数据时只剩两颗翻页钮', () => {
    expect(parts(nodesOf(1, 0))).toEqual(['prev-trigger', 'next-trigger'])
  })
})
