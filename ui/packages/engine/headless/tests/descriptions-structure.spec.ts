// 描述列表的标准结构：按 collection 一组一格，dt / dd 成对，取值可由作者插槽接管。
import type { StructureChild } from '../src/shared/structure'
import { normalizeProps } from '@xihan-ui/core'
import { describe, expect, it } from 'vitest'
import { connectDescriptions, descriptionsStructure } from '../src/descriptions'

function outline(nodes: readonly StructureChild[], depth = 0): string[] {
  return nodes.flatMap((node) => {
    if (!('part' in node))
      return [`${'  '.repeat(depth)}other`]
    const content = node.slot ? `slot:${node.slot.name}:${node.slot.key}` : (node.text ?? '')
    const attrs = node.attrs ? ` ${JSON.stringify(node.attrs)}` : ''
    return [`${'  '.repeat(depth)}${node.tag}|${node.part}|${content}${attrs}`, ...outline(node.children ?? [], depth + 1)]
  })
}

describe('descriptionsStructure', () => {
  it('每组一格，格子里标签在前、取值在后；跨列数写在格子上，数字取值转成文字', () => {
    const api = connectDescriptions({
      columns: 2,
      collection: [
        { label: '订单号', content: 'XH-0042' },
        { label: '金额', content: 1280 },
        { label: '备注', span: 2 },
      ],
    }, normalizeProps)
    expect(outline(descriptionsStructure(api))).toEqual([
      'div|item|',
      '  dt|label|订单号',
      '  dd|value|XH-0042',
      'div|item|',
      '  dt|label|金额',
      '  dd|value|1280',
      'div|item| {"span":"2"}',
      '  dt|label|备注',
      '  dd|value|',
    ])
  })

  it('value 插槽有内容时取值归作者，按条目的 key 带 key、data 是这一组的元信息；没写 key 的组按下标', () => {
    const api = connectDescriptions({ collection: [{ value: 'status', label: '状态', content: '已支付' }, { label: '渠道', content: '网页' }] }, normalizeProps)
    const nodes = descriptionsStructure(api, { slotted: (name, key) => name === 'value' && key === 'status' })
    expect(outline(nodes)).toEqual([
      'div|item|',
      '  dt|label|状态',
      '  dd|value|slot:value:status',
      'div|item|',
      '  dt|label|渠道',
      '  dd|value|网页',
    ])
    const value = nodes[0]!.children?.[1]
    expect(value && 'data' in value ? value.data : undefined).toEqual({ value: 'status', index: 0, label: '状态', content: '已支付', span: undefined })
    expect(nodes.map(node => node.key)).toEqual(['item:status', 'item:1'])
  })

  it('没有 collection 时什么都不铺', () => {
    expect(descriptionsStructure(connectDescriptions({}, normalizeProps))).toEqual([])
  })
})
