// @vitest-environment jsdom
// 时间选择器的 lazyMount / unmountOnExit：content 里的面板第一次展开时才挂、退场播完按 unmountOnExit 卸；标准结构按判定铺不铺面板。
import type { StructureChild, StructureNode, TimePickerSchema } from '../src'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it } from 'vitest'
import { connectTimePicker, timePickerMachine, timePickerStructure } from '../src'

function makeService(props: TimePickerSchema['props'] = {}) {
  const runtime = createVanillaRuntime()
  const service = createService(timePickerMachine, { props: () => ({ locale: 'zh-CN', ...props }), runtime })
  runtime.start()
  return service
}

const api = (service: ReturnType<typeof makeService>) => connectTimePicker(service, normalizeProps)

/** content 节点里铺了几块面板。 */
function contentItems(nodes: StructureChild[]): number {
  const positioner = nodes.find((node): node is StructureNode => 'part' in node && node.part === 'positioner')
  const content = positioner?.children?.find((node): node is StructureNode => 'part' in node && node.part === 'content')
  return content?.children?.length ?? -1
}

describe('time-picker lazyMount / unmountOnExit', () => {
  it('缺省恒挂载', () => {
    const s = makeService()
    expect(api(s).isContentMounted(false)).toBe(true)
  })

  it('lazyMount：没展开过不挂，第一次展开起一直挂着', () => {
    const s = makeService({ lazyMount: true })
    expect(api(s).isContentMounted(false)).toBe(false)
    s.send({ type: 'OPEN' })
    expect(api(s).isContentMounted(true)).toBe(true)
    s.send({ type: 'CLOSE' })
    expect(api(s).isContentMounted(false)).toBe(true)
  })

  it('首帧即展开就算展开过', () => {
    expect(api(makeService({ lazyMount: true, defaultOpen: true })).isContentMounted(true)).toBe(true)
  })

  it('unmountOnExit：退场闸门还开着照样挂着，闸门落下即卸', () => {
    const s = makeService({ unmountOnExit: true })
    s.send({ type: 'OPEN' })
    s.send({ type: 'CLOSE' })
    expect(api(s).isContentMounted(true)).toBe(true)
    expect(api(s).isContentMounted(false)).toBe(false)
  })

  it('标准结构：判为不挂时 content 节点照旧铺，面板不铺', () => {
    const s = makeService({ lazyMount: true })
    expect(contentItems(timePickerStructure(api(s), { contentMounted: false }))).toBe(0)
    expect(contentItems(timePickerStructure(api(s), {}))).toBeGreaterThan(0)
  })
})
