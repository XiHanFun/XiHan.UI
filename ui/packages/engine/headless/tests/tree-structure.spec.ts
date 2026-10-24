import type { StructureChild, StructureNode } from '../src/shared/structure'
import type { TreeNode } from '../src/tree'
import { describe, expect, it } from 'vitest'
import { resolveLazyCollection } from '../src/shared/lazy-branch'
import { treeStructure } from '../src/tree'

// 结构只取有效树（collection 补上懒分支已取回的子项）：这里核铺出来的部件、次序、key 与身份属性。
function parts(nodes: readonly StructureChild[]): string[] {
  return nodes.map(node => ('part' in node ? node.part : 'other'))
}

const COLLECTION: TreeNode[] = [
  {
    value: 'src',
    label: 'src',
    description: '源码',
    children: [
      { value: 'main', label: 'main.ts' },
      { value: 'util', children: [] },
    ],
  },
  { value: 'readme', label: 'README.md', description: '说明' },
]

describe('treeStructure', () => {
  it('标题在前、整棵树在后；没给标题时不铺 label', () => {
    expect(parts(treeStructure({ collection: COLLECTION }, { label: '项目文件' }))).toEqual(['label', 'tree'])
    expect(treeStructure({ collection: COLLECTION }, { label: '项目文件' })[0]).toMatchObject({ tag: 'span', text: '项目文件' })
    expect(parts(treeStructure({ collection: COLLECTION }))).toEqual(['tree'])
    expect(treeStructure({ collection: COLLECTION }, { slotted: name => name === 'label' })[0]).toMatchObject({ part: 'label', slot: { name: 'label' } })
  })

  it('分支是控制行（箭头、文字、副文本、对号）加子层；叶子是文字、副文本与对号；身份写在 value 上', () => {
    const tree = treeStructure({ collection: COLLECTION })[0]!.children as StructureNode[]
    expect(parts(tree)).toEqual(['branch', 'item'])
    const [branch, leaf] = tree
    expect(branch).toMatchObject({ key: 'branch:src', attrs: { value: 'src' } })
    const [control, content] = branch!.children as StructureNode[]
    expect(parts(control!.children!)).toEqual(['branch-trigger', 'branch-text', 'branch-description', 'item-indicator'])
    expect((control!.children as StructureNode[]).map(node => node.text)).toEqual([undefined, 'src', '源码', undefined])
    expect(parts(content!.children!)).toEqual(['item', 'branch'])
    expect(leaf).toMatchObject({ key: 'item:readme', attrs: { value: 'readme' } })
    expect(parts(leaf!.children!)).toEqual(['item-text', 'item-description', 'item-indicator'])
  })

  it('没写 label 的节点文字取 value；空子层的分支照样铺出控制行与空的子层', () => {
    const content = (treeStructure({ collection: COLLECTION })[0]!.children as StructureNode[])[0]!.children![1] as StructureNode
    const util = content.children![1] as StructureNode
    expect(util.part).toBe('branch')
    expect(((util.children![0] as StructureNode).children![1] as StructureNode).text).toBe('util')
    expect((util.children![1] as StructureNode).children).toEqual([])
  })

  it('懒分支在有效树里先是空子层，取回后按值铺出子项', () => {
    const collection: TreeNode[] = [{ value: 'dept', label: '研发', hasChildren: true }]
    const before = treeStructure({ collection: resolveLazyCollection(collection, {}) })[0]!.children as StructureNode[]
    expect(parts(before)).toEqual(['branch'])
    expect((before[0]!.children![1] as StructureNode).children).toEqual([])
    const after = treeStructure({ collection: resolveLazyCollection(collection, { dept: [{ value: 'dept-1', label: '赵一' }] }) })[0]!.children as StructureNode[]
    expect(((after[0]!.children![1] as StructureNode).children as StructureNode[]).map(node => node.key)).toEqual(['item:dept-1'])
  })
})
