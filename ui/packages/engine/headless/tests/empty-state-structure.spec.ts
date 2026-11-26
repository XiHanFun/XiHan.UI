import type { StructureNode } from '../src/shared/structure'
import { describe, expect, it } from 'vitest'
import { emptyStateStructure } from '../src/empty-state'

/** 结构里的部件与各自的内容来源：文字或插槽。 */
function outline(nodes: readonly StructureNode[]): string[] {
  return nodes.map(node => `${node.tag}|${node.part}|${node.slot ? `slot:${node.slot.name}` : (node.text ?? '')}`)
}

describe('emptyStateStructure', () => {
  it('什么都不给时不铺任何一段：root 里是空的', () => {
    expect(emptyStateStructure()).toEqual([])
  })

  it('次序与手写部件的文档序相同：插画、图标、标题、说明、操作；标题与说明是 p，不进文档大纲', () => {
    const nodes = emptyStateStructure({
      title: '还没有任何工单',
      description: '新建一条工单，或者换个筛选条件再看看。',
      slotted: name => name === 'media' || name === 'indicator' || name === 'action',
    })
    expect(outline(nodes)).toEqual([
      'div|media|slot:media',
      'span|indicator|slot:indicator',
      'p|title|还没有任何工单',
      'p|description|新建一条工单，或者换个筛选条件再看看。',
      'div|action|slot:action',
    ])
  })

  it('同名插槽有内容时压过文字；空串当没给，不铺空段', () => {
    const nodes = emptyStateStructure({ title: '不用这段', description: '', slotted: name => name === 'title' })
    expect(outline(nodes)).toEqual(['p|title|slot:title'])
  })
})
