import type { StructureChild } from '../src/shared/structure'
import { describe, expect, it } from 'vitest'
import { alertStructure } from '../src/alert'
import { isStructureInstance, isStructureLiteral, isStructureOutlet } from '../src/shared/structure'

/** 结构树摊平成「标签|部件|内容来源」，子节点缩进一层。 */
function outline(nodes: readonly StructureChild[], depth = 0): string[] {
  return nodes.flatMap((node) => {
    if (isStructureLiteral(node) || isStructureInstance(node) || isStructureOutlet(node))
      throw new Error('警告提示的结构里只有部件节点')
    const own = `${'  '.repeat(depth)}${node.tag}|${node.part}|${node.slot ? `slot:${node.slot.name}` : (node.text ?? '')}`
    return [own, ...outline(node.children ?? [], depth + 1)]
  })
}

describe('alertStructure', () => {
  it('什么都不给时只铺必备的文本列，不替作者添关闭钮', () => {
    expect(outline(alertStructure())).toEqual(['div|content|'])
  })

  it('次序与手写部件的文档序相同：图标、文本列（标题在前、说明在后）、操作、关闭钮', () => {
    const nodes = alertStructure({
      title: '部署已排队',
      description: '构建完成后会自动发布。',
      closable: true,
      slotted: name => name === 'indicator' || name === 'action',
    })
    expect(outline(nodes)).toEqual([
      'span|indicator|slot:indicator',
      'div|content|',
      '  div|title|部署已排队',
      '  div|description|构建完成后会自动发布。',
      'div|action|slot:action',
      'button|close-trigger|',
    ])
  })

  it('关闭钮只在作者写了 closable 为真时铺：没写、写 false 都不铺', () => {
    const parts = (closable: boolean | undefined): string[] => alertStructure({ closable }).map(node => ('part' in node ? node.part : ''))
    expect(parts(undefined)).toEqual(['content'])
    expect(parts(false)).toEqual(['content'])
    expect(parts(true)).toEqual(['content', 'close-trigger'])
  })

  it('同名插槽有内容时压过文字；空串当没给', () => {
    const nodes = alertStructure({ title: '不用这段', description: '', slotted: name => name === 'title' })
    expect(outline(nodes)).toEqual(['div|content|', '  div|title|slot:title'])
  })
})
