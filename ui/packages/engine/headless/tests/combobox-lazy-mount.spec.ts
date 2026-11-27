// @vitest-environment jsdom
// 组合框的 lazyMount / unmountOnExit：候选第一次展开时才挂、退场播完按 unmountOnExit 卸；手写候选还没挂时选中文字退回值本身，
// 展开那一刻候选还没挂不判空；标准结构按判定铺不铺候选。
import type { ComboboxSchema, StructureChild, StructureNode } from '../src'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it } from 'vitest'
import { comboboxMachine, comboboxStructure, connectCombobox } from '../src'

const COLLECTION = [
  { value: 'apple', label: '苹果' },
  { value: 'banana', label: '香蕉' },
]

afterEach(() => {
  document.body.innerHTML = ''
})

function makeService(props: ComboboxSchema['props'] = {}, content: HTMLElement | null = null) {
  const runtime = createVanillaRuntime()
  const service = createService(comboboxMachine, { props: () => props, runtime })
  if (content)
    service.refs.set('getContentEl', () => content)
  runtime.start()
  return service
}

const api = (service: ReturnType<typeof makeService>) => connectCombobox(service, normalizeProps)

function contentItems(nodes: StructureChild[]): number {
  const positioner = nodes.find((node): node is StructureNode => 'part' in node && node.part === 'positioner')
  const content = positioner?.children?.find((node): node is StructureNode => 'part' in node && node.part === 'content')
  return content?.children?.length ?? -1
}

describe('combobox lazyMount / unmountOnExit', () => {
  it('缺省恒挂载', () => {
    expect(api(makeService({ collection: COLLECTION })).isContentMounted(false)).toBe(true)
  })

  it('lazyMount：没展开过不挂，第一次展开起一直挂着', () => {
    const s = makeService({ collection: COLLECTION, lazyMount: true })
    expect(api(s).isContentMounted(false)).toBe(false)
    s.send({ type: 'OPEN' })
    expect(api(s).isContentMounted(true)).toBe(true)
    s.send({ type: 'CLOSE' })
    expect(api(s).isContentMounted(false)).toBe(true)
  })

  it('unmountOnExit：退场闸门还开着照样挂着，闸门落下即卸', () => {
    const s = makeService({ collection: COLLECTION, unmountOnExit: true })
    s.send({ type: 'OPEN' })
    s.send({ type: 'CLOSE' })
    expect(api(s).isContentMounted(true)).toBe(true)
    expect(api(s).isContentMounted(false)).toBe(false)
  })

  it('打开前选中文字：给了 collection 按数据取；手写候选还没挂时退回值本身', () => {
    expect(api(makeService({ collection: COLLECTION, lazyMount: true, defaultValue: 'apple' })).valueText).toBe('苹果')
    const content = document.createElement('div')
    document.body.append(content)
    expect(api(makeService({ lazyMount: true, defaultValue: 'apple' }, content)).valueText).toBe('apple')
  })

  it('手写候选还没挂时展开不判空，提交完 DOM 的 ITEMS.SYNC 才结算', () => {
    const content = document.createElement('div')
    document.body.append(content)
    const s = makeService({ lazyMount: true }, content)
    s.send({ type: 'OPEN' })
    expect(api(s).empty).toBe(false)
    s.send({ type: 'ITEMS.SYNC' })
    expect(api(s).empty).toBe(true)
  })

  it('标准结构：判为不挂时 content 节点照旧铺，里面不铺候选', () => {
    const s = makeService({ collection: COLLECTION, lazyMount: true })
    expect(contentItems(comboboxStructure(api(s), { contentMounted: false }))).toBe(0)
    expect(contentItems(comboboxStructure(api(s)))).toBe(2)
  })
})
