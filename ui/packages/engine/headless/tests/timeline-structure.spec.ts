// 时间线的标准结构：按 collection 一条一个 li，给了哪一项才铺哪一块，次序照手写全套部件。
import type { StructureChild } from '../src/shared/structure'
import { normalizeProps } from '@xihan-ui/core'
import { describe, expect, it } from 'vitest'
import { connectTimeline, timelineStructure } from '../src/timeline'

function outline(nodes: readonly StructureChild[], depth = 0): string[] {
  return nodes.flatMap((node) => {
    if (!('part' in node))
      return [`${'  '.repeat(depth)}other`]
    const attrs = node.attrs ? ` ${JSON.stringify(node.attrs)}` : ''
    return [`${'  '.repeat(depth)}${node.tag}|${node.part}|${node.text ?? ''}${attrs}`, ...outline(node.children ?? [], depth + 1)]
  })
}

describe('timelineStructure', () => {
  it('每条依次是坐标列、圆点、连线与内容，内容里是时刻、标题、说明；语气写在条目上', () => {
    const api = connectTimeline({
      collection: [
        { value: 'created', label: '07-01', time: '09:12', datetime: '2026-07-01T09:12', title: '订单已创建', description: '下单来源：网页端' },
        { value: 'failed', time: '14:05', title: '派送失败', tone: 'danger' },
      ],
    }, normalizeProps)
    expect(outline(timelineStructure(api))).toEqual([
      'li|item|',
      '  div|label|07-01',
      '  span|indicator|',
      '  span|connector|',
      '  div|content|',
      '    time|time|09:12 {"datetime":"2026-07-01T09:12"}',
      '    div|title|订单已创建',
      '    div|description|下单来源：网页端',
      'li|item| {"tone":"danger"}',
      '  span|indicator|',
      '  span|connector|',
      '  div|content|',
      '    time|time|14:05',
      '    div|title|派送失败',
    ])
  })

  it('条目身份取 key，没写时取下标；没有 collection 时什么都不铺', () => {
    const api = connectTimeline({ collection: [{ value: 'a', title: '甲' }, { title: '乙' }] }, normalizeProps)
    expect(api.collection.map(meta => meta.value)).toEqual(['a', '1'])
    expect(timelineStructure(api).map(node => node.key)).toEqual(['item:a', 'item:1'])
    expect(timelineStructure(connectTimeline({}, normalizeProps))).toEqual([])
  })

  it('只给了 datetime、没给 time 时不铺时刻：机读时间离了可见文字没有意义', () => {
    const api = connectTimeline({ collection: [{ datetime: '2026-07-01', title: '甲' }] }, normalizeProps)
    expect(outline(timelineStructure(api)).some(line => line.includes('|time|'))).toBe(false)
  })
})
