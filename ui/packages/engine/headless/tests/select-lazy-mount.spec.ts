// @vitest-environment jsdom
// lazyMount / unmountOnExit：列表内容第一次展开时才挂、退场播完按 unmountOnExit 卸；列表内容不在 DOM 里时收起态连打按 collection 算。
import type { SelectSchema, StructureChild, StructureNode } from '../src'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it } from 'vitest'
import { connectSelect, selectMachine, selectStructure } from '../src'

const COLLECTION = [
  { value: 'apple', label: '苹果' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry', disabled: true },
]

function makeService(props: SelectSchema['props'] = {}) {
  const runtime = createVanillaRuntime()
  const service = createService(selectMachine, { props: () => props, runtime })
  runtime.start()
  return service
}

const api = (service: ReturnType<typeof makeService>) => connectSelect(service, normalizeProps)

function typeOnTrigger(service: ReturnType<typeof makeService>, key: string): void {
  const trigger = api(service).getTriggerProps() as { onKeydown: (e: KeyboardEvent) => void }
  trigger.onKeydown(new KeyboardEvent('keydown', { key, cancelable: true }))
}

function find(nodes: readonly StructureChild[], part: string): StructureNode | undefined {
  for (const node of nodes) {
    if (!('part' in node))
      continue
    if (node.part === part)
      return node
    const hit = find(node.children ?? [], part)
    if (hit)
      return hit
  }
  return undefined
}

describe('select lazyMount', () => {
  it('缺省恒挂载', () => {
    expect(api(makeService({ collection: COLLECTION })).isContentMounted(false)).toBe(true)
  })

  it('没展开过不挂，第一次展开起一直挂着', () => {
    const s = makeService({ collection: COLLECTION, lazyMount: true })
    expect(api(s).isContentMounted(false)).toBe(false)
    s.send({ type: 'OPEN' })
    expect(api(s).isContentMounted(true)).toBe(true)
    s.send({ type: 'CLOSE' })
    expect(api(s).isContentMounted(false)).toBe(true)
  })

  it('首帧即展开就算展开过', () => {
    expect(api(makeService({ collection: COLLECTION, lazyMount: true, defaultOpen: true })).isContentMounted(true)).toBe(true)
  })

  it('列表还没挂上时收起态连打按 collection 匹配，禁用条目跳过', () => {
    const s = makeService({ collection: COLLECTION, lazyMount: true })
    typeOnTrigger(s, 'b')
    expect(s.context.get('value')).toEqual(['banana'])
    // cherry 禁用：打 c 不落上去
    typeOnTrigger(s, 'c')
    expect(s.context.get('value')).toEqual(['banana'])
  })

  it('打开前选中文字取自 collection', () => {
    const s = makeService({ collection: COLLECTION, lazyMount: true, defaultValue: 'apple' })
    expect(api(s).valueText).toEqual(['苹果'])
  })
})

describe('select unmountOnExit', () => {
  it('退场闸门还开着照样挂着，闸门落下即卸，再展开重新挂', () => {
    const s = makeService({ collection: COLLECTION, unmountOnExit: true })
    expect(api(s).isContentMounted(false)).toBe(false)
    s.send({ type: 'OPEN' })
    expect(api(s).isContentMounted(true)).toBe(true)
    s.send({ type: 'CLOSE' })
    expect(api(s).isContentMounted(true)).toBe(true)
    expect(api(s).isContentMounted(false)).toBe(false)
    s.send({ type: 'OPEN' })
    expect(api(s).isContentMounted(true)).toBe(true)
  })

  it('收起之后的连打按 collection 匹配：列表里的条目这时已经撤走', () => {
    const s = makeService({ collection: COLLECTION, unmountOnExit: true })
    s.send({ type: 'OPEN' })
    s.send({ type: 'CLOSE' })
    typeOnTrigger(s, 'b')
    expect(s.context.get('value')).toEqual(['banana'])
  })

  it('标准结构：判为不挂时 list 照旧铺，里面不铺条目', () => {
    const s = makeService({ collection: COLLECTION, unmountOnExit: true })
    expect(find(selectStructure(api(s), { contentMounted: false }), 'list')?.children).toEqual([])
    expect(find(selectStructure(api(s)), 'list')?.children).toHaveLength(3)
    // 空态与在途占位不归它管
    expect(find(selectStructure(api(s), { contentMounted: false }), 'empty')).toBeDefined()
  })
})
