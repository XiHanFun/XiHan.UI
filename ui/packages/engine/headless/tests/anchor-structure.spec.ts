// @vitest-environment jsdom
// 锚点目录的标准结构：按 collection 一条一个链接，末尾是指示条；没写 label 的条目文字就是 id。
import type { AnchorSchema } from '../src/anchor'
import type { StructureChild } from '../src/shared/structure'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it } from 'vitest'
import { anchorMachine, anchorStructure, connectAnchor } from '../src/anchor'

type Props = AnchorSchema['props']

function api(props: Partial<Props>) {
  const runtime = createVanillaRuntime()
  const service = createService(anchorMachine, { runtime, props: () => props as Props })
  service.refs.set('getListEl', () => null)
  service.refs.set('getTargetEl', () => null)
  runtime.start()
  return connectAnchor(service, normalizeProps)
}

function outline(nodes: readonly StructureChild[], depth = 0): string[] {
  return nodes.flatMap((node) => {
    if (!('part' in node))
      return [`${'  '.repeat(depth)}other`]
    const attrs = node.attrs ? ` ${JSON.stringify(node.attrs)}` : ''
    return [`${'  '.repeat(depth)}${node.tag}|${node.part}|${node.text ?? ''}${attrs}`, ...outline(node.children ?? [], depth + 1)]
  })
}

describe('anchorStructure', () => {
  it('一个列表，每条一个 li 里一条链接（写着目标区块的 id），列表末尾是指示条', () => {
    expect(outline(anchorStructure(api({ collection: [{ value: 'intro', label: '概览' }, { value: 'install' }] })))).toEqual([
      'ul|list|',
      '  li|item|',
      '    a|link|概览 {"value":"intro"}',
      '  li|item|',
      '    a|link|install {"value":"install"}',
      '  li|indicator|',
    ])
  })

  it('元信息与观察器同一份目录：每条摊成 { value, label }，没写 label 的回退为 id', () => {
    expect(api({ collection: [{ value: 'a' }, { value: 'b', label: '乙' }, { value: 'c' }] }).collection).toEqual([
      { value: 'a', label: 'a' },
      { value: 'b', label: '乙' },
      { value: 'c', label: 'c' },
    ])
  })

  it('没有条目时什么都不铺', () => {
    expect(anchorStructure(api({}))).toEqual([])
  })
})
