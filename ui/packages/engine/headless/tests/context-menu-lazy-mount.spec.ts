// @vitest-environment jsdom
// 上下文菜单的 lazyMount / unmountOnExit：条目第一次展开时才挂、退场播完按 unmountOnExit 卸；标准结构按判定铺不铺条目。
import type { ContextMenuSchema, StructureChild, StructureNode } from '../src'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it } from 'vitest'
import { connectContextMenu, contextMenuMachine, contextMenuStructure } from '../src'

const COLLECTION = [
  { value: 'copy', label: '复制' },
  { value: 'paste', label: '粘贴' },
]

function makeService(props: ContextMenuSchema['props'] = {}) {
  const runtime = createVanillaRuntime()
  const service = createService(contextMenuMachine, { props: () => ({ collection: COLLECTION, ...props }), runtime })
  runtime.start()
  return service
}

const api = (service: ReturnType<typeof makeService>) => connectContextMenu(service, normalizeProps)

function contentItems(nodes: StructureChild[]): number {
  const positioner = nodes.find((node): node is StructureNode => 'part' in node && node.part === 'positioner')
  const content = positioner?.children?.find((node): node is StructureNode => 'part' in node && node.part === 'content')
  return content?.children?.length ?? -1
}

describe('context-menu lazyMount / unmountOnExit', () => {
  it('缺省恒挂载', () => {
    expect(api(makeService()).isContentMounted(false)).toBe(true)
  })

  it('lazyMount：没展开过不挂，第一次展开起一直挂着', () => {
    const s = makeService({ lazyMount: true })
    expect(api(s).isContentMounted(false)).toBe(false)
    s.send({ type: 'OPEN', x: 10, y: 10 })
    expect(api(s).isContentMounted(true)).toBe(true)
    s.send({ type: 'CLOSE' })
    expect(api(s).isContentMounted(false)).toBe(true)
  })

  it('unmountOnExit：退场闸门还开着照样挂着，闸门落下即卸', () => {
    const s = makeService({ unmountOnExit: true })
    s.send({ type: 'OPEN', x: 10, y: 10 })
    s.send({ type: 'CLOSE' })
    expect(api(s).isContentMounted(true)).toBe(true)
    expect(api(s).isContentMounted(false)).toBe(false)
  })

  it('标准结构：判为不挂时 content 节点照旧铺，里面不铺条目', () => {
    const s = makeService({ lazyMount: true })
    expect(contentItems(contextMenuStructure(api(s), { contentMounted: false }))).toBe(0)
    expect(contentItems(contextMenuStructure(api(s)))).toBe(2)
  })
})
