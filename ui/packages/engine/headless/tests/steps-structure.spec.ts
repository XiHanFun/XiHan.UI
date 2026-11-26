// @vitest-environment jsdom
// 步骤条的标准结构：按 collection 一步一个条目，次序、标签、身份与序号圆点里的字都照手写全套部件。
import type { StructureChild } from '../src/shared/structure'
import type { StepsSchema } from '../src/steps'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it } from 'vitest'
import { connectSteps, stepsMachine, stepsStructure } from '../src/steps'

type Props = StepsSchema['props']

const COLLECTION: Props['collection'] = [
  { title: '填写地址', description: '收货人与联系方式' },
  { title: '选择支付' },
  { title: '确认订单', description: '核对金额' },
]

function api(props: Partial<Props>) {
  const runtime = createVanillaRuntime()
  const service = createService(stepsMachine, { runtime, props: () => ({ collection: COLLECTION, ...props }) as Props })
  runtime.start()
  return connectSteps(service, normalizeProps)
}

/** 结构摊成「标签|部件|文字」，按文档序；子节点缩进一格。 */
function outline(nodes: readonly StructureChild[], depth = 0): string[] {
  return nodes.flatMap((node) => {
    if (!('part' in node))
      return [`${'  '.repeat(depth)}other`]
    const attrs = node.attrs ? ` ${JSON.stringify(node.attrs)}` : ''
    return [`${'  '.repeat(depth)}${node.tag}|${node.part}|${node.text ?? ''}${attrs}`, ...outline(node.children ?? [], depth + 1)]
  })
}

describe('stepsStructure', () => {
  it('一个列表，每步一个条目：触发器里是圆点、标题与说明（有说明才铺），触发器之后是连接线', () => {
    expect(outline(stepsStructure(api({ defaultValue: 1 })))).toEqual([
      'div|list|',
      '  div|item| {"value":"0"}',
      '    button|trigger|',
      '      span|indicator|',
      '      span|title|填写地址',
      '      span|description|收货人与联系方式',
      '    div|separator|',
      '  div|item| {"value":"1"}',
      '    button|trigger|',
      '      span|indicator|2',
      '      span|title|选择支付',
      '    div|separator|',
      '  div|item| {"value":"2"}',
      '    button|trigger|',
      '      span|indicator|3',
      '      span|title|确认订单',
      '      span|description|核对金额',
      '    div|separator|',
    ])
  })

  it('走过的步圆点留空交给皮肤画对号，statuses 改成走过的同样留空；点状形态一律留空', () => {
    const indicators = (props: Partial<Props>): (string | undefined)[] => {
      const list = stepsStructure(api(props))[0]!
      return (list.children ?? []).map((item) => {
        const trigger = ('children' in item ? item.children : [])?.[0]
        const indicator = trigger && 'children' in trigger ? trigger.children?.[0] : undefined
        return indicator && 'text' in indicator ? indicator.text : undefined
      })
    }
    expect(indicators({ defaultValue: 2 })).toEqual(['', '', '3'])
    expect(indicators({ defaultValue: 0, statuses: { 2: 'completed' } })).toEqual(['1', '2', ''])
    expect(indicators({ defaultValue: 1, variant: 'dot' })).toEqual(['', '', ''])
  })

  it('只读展示的触发器生成为 div：只排版，不是按钮', () => {
    const list = stepsStructure(api({ readOnly: true }))[0]!
    const triggers = (list.children ?? []).map(item => ('children' in item ? item.children?.[0] : undefined))
    expect(triggers.map(node => (node && 'tag' in node ? node.tag : undefined))).toEqual(['div', 'div', 'div'])
  })

  it('只给 collection、不写 count 时步序的上界取它的长度：跳步与逐步前进都不被夹回 0', () => {
    const runtime = createVanillaRuntime()
    const service = createService(stepsMachine, { runtime, props: () => ({ collection: COLLECTION }) as Props })
    runtime.start()
    connectSteps(service, normalizeProps).setValue(2)
    expect(connectSteps(service, normalizeProps).value).toBe(2)
    connectSteps(service, normalizeProps).goToNextStep()
    expect(connectSteps(service, normalizeProps).complete).toBe(true)
  })

  it('没有 collection 时什么都不铺；结构节点只写身份，不写 connect 的属性', () => {
    expect(stepsStructure(api({ collection: undefined, count: 3 }))).toEqual([])
    const attrs = outline(stepsStructure(api({}))).filter(line => line.includes('{'))
    expect(attrs.every(line => line.endsWith('{"value":"0"}') || line.endsWith('{"value":"1"}') || line.endsWith('{"value":"2"}'))).toBe(true)
  })
})
