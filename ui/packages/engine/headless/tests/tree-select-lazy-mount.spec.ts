// @vitest-environment jsdom
// 树选择的 lazyMount / unmountOnExit：树与搜索框第一次展开时才挂、退场播完按 unmountOnExit 卸；
// 触发器里的选中文字按 collection 算、不受影响；标准结构按判定铺不铺树。
import type { StructureChild, StructureNode, TreeSelectSchema } from '../src'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it } from 'vitest'
import { connectTreeSelect, treeSelectMachine, treeSelectStructure } from '../src'

const COLLECTION = [
  { value: 'zj', label: '浙江', children: [{ value: 'hz', label: '杭州' }] },
  { value: 'js', label: '江苏', children: [{ value: 'nj', label: '南京' }] },
]

function makeService(props: TreeSelectSchema['props'] = {}) {
  const runtime = createVanillaRuntime()
  const service = createService(treeSelectMachine, { props: () => ({ collection: COLLECTION, ...props }), runtime })
  runtime.start()
  return service
}

const api = (service: ReturnType<typeof makeService>) => connectTreeSelect(service, normalizeProps)

function contentChildren(nodes: StructureChild[]): number {
  const positioner = nodes.find((node): node is StructureNode => 'part' in node && node.part === 'positioner')
  const content = positioner?.children?.find((node): node is StructureNode => 'part' in node && node.part === 'content')
  return content?.children?.length ?? -1
}

describe('tree-select lazyMount / unmountOnExit', () => {
  it('缺省恒挂载', () => {
    expect(api(makeService()).isContentMounted(false)).toBe(true)
  })

  it('lazyMount：没展开过不挂，第一次展开起一直挂着；选中文字照旧按 collection 算', () => {
    const s = makeService({ lazyMount: true, defaultValue: 'hz' })
    expect(api(s).isContentMounted(false)).toBe(false)
    expect(api(s).valueText).toBe('杭州')
    s.send({ type: 'OPEN' })
    expect(api(s).isContentMounted(true)).toBe(true)
    s.send({ type: 'CLOSE' })
    expect(api(s).isContentMounted(false)).toBe(true)
  })

  it('unmountOnExit：退场闸门还开着照样挂着，闸门落下即卸', () => {
    const s = makeService({ unmountOnExit: true })
    s.send({ type: 'OPEN' })
    s.send({ type: 'CLOSE' })
    expect(api(s).isContentMounted(true)).toBe(true)
    expect(api(s).isContentMounted(false)).toBe(false)
  })

  it('标准结构：判为不挂时 content 节点照旧铺，里面不铺树', () => {
    const s = makeService({ lazyMount: true })
    expect(contentChildren(treeSelectStructure(api(s), { contentMounted: false }))).toBe(0)
    expect(contentChildren(treeSelectStructure(api(s)))).toBe(1)
  })
})
