import type { StructureNode } from '../src/shared/structure'
import { describe, expect, it } from 'vitest'
import { statisticStructure } from '../src/statistic'

/** 结构里的部件与各自的内容来源：文字、插槽或空。 */
function outline(nodes: readonly StructureNode[]): string[] {
  return nodes.map(node => `${node.tag}|${node.part}|${node.slot ? `slot:${node.slot.name}` : (node.text ?? '')}`)
}

describe('statisticStructure', () => {
  it('什么都不给时不铺任何一段：root 里是空的', () => {
    expect(statisticStructure()).toEqual([])
  })

  it('次序与手写部件的文档序相同：标签、前缀、数值、后缀、涨跌', () => {
    const nodes = statisticStructure({
      label: '营收',
      valueText: '1,280',
      trend: 'up',
      trendText: '同比 12%',
      slotted: name => name === 'prefix' || name === 'suffix',
    })
    expect(outline(nodes)).toEqual([
      'span|label|营收',
      'span|prefix|slot:prefix',
      'span|value|1,280',
      'span|suffix|slot:suffix',
      'span|trend|同比 12%',
    ])
  })

  it('label 插槽有内容时压过 label 文字；空串标签不铺，免得白占一整行', () => {
    expect(outline(statisticStructure({ label: '不用这段', slotted: name => name === 'label' }))).toEqual(['span|label|slot:label'])
    expect(statisticStructure({ label: '' })).toEqual([])
  })

  it('只给方向时铺一个空的涨跌段，箭头归皮肤；只给比数文字时有字没方向', () => {
    expect(outline(statisticStructure({ trend: 'flat' }))).toEqual(['span|trend|'])
    expect(outline(statisticStructure({ trendText: '与上周持平' }))).toEqual(['span|trend|与上周持平'])
  })

  it('结构节点不写 connect 的属性：身份、方向与语气都由 connect 落', () => {
    for (const node of statisticStructure({ label: '营收', valueText: '1', trend: 'down' }))
      expect(node.attrs).toBeUndefined()
  })
})
