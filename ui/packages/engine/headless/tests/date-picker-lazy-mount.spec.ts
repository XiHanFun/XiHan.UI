// @vitest-environment jsdom
// 日期选择器的 lazyMount / unmountOnExit：content 里的面板第一次展开时才挂、退场播完按 unmountOnExit 卸；标准结构按判定铺不铺面板。
import type { DatePickerSchema, DatePickerServices } from '../src/date-picker'
import type { StructureChild, StructureNode } from '../src/shared/structure'
import { createCounterIdGenerator, createScope, createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it } from 'vitest'
import { calendarPickerMachine } from '../src/calendar-picker'
import { dateFieldMachine } from '../src/date-field'
import { connectDatePicker, datePickerCalendarProps, datePickerFieldProps, datePickerMachine, datePickerStructure } from '../src/date-picker'

function makeServices(props: DatePickerSchema['props'] = {}): DatePickerServices {
  const runtime = createVanillaRuntime()
  const scope = createScope(null, createCounterIdGenerator())
  // 内嵌机器的 props 都从编排机现读，编排机必须先立起来
  const root = createService(datePickerMachine, { props: () => ({ locale: 'zh-CN', ...props }), runtime, scope })
  const calendar = createService(calendarPickerMachine, { props: () => datePickerCalendarProps(root), runtime, scope })
  const field = createService(dateFieldMachine, { props: () => datePickerFieldProps(root), runtime, scope })
  runtime.start()
  return { root, calendar, field }
}

const api = (services: DatePickerServices) => connectDatePicker(services, normalizeProps)

function contentChildren(nodes: StructureChild[]): number {
  const positioner = nodes.find((node): node is StructureNode => 'part' in node && node.part === 'positioner')
  const content = positioner?.children?.find((node): node is StructureNode => 'part' in node && node.part === 'content')
  return content?.children?.length ?? -1
}

describe('date-picker lazyMount / unmountOnExit', () => {
  it('缺省恒挂载', () => {
    expect(api(makeServices()).isContentMounted(false)).toBe(true)
  })

  it('lazyMount：没展开过不挂，第一次展开起一直挂着', () => {
    const s = makeServices({ lazyMount: true })
    expect(api(s).isContentMounted(false)).toBe(false)
    s.root.send({ type: 'OPEN' })
    expect(api(s).isContentMounted(true)).toBe(true)
    s.root.send({ type: 'CLOSE' })
    expect(api(s).isContentMounted(false)).toBe(true)
  })

  it('首帧即展开就算展开过', () => {
    expect(api(makeServices({ lazyMount: true, defaultOpen: true })).isContentMounted(true)).toBe(true)
  })

  it('unmountOnExit：退场闸门还开着照样挂着，闸门落下即卸', () => {
    const s = makeServices({ unmountOnExit: true })
    s.root.send({ type: 'OPEN' })
    s.root.send({ type: 'CLOSE' })
    expect(api(s).isContentMounted(true)).toBe(true)
    expect(api(s).isContentMounted(false)).toBe(false)
  })

  it('标准结构：判为不挂时 content 节点照旧铺，面板不铺', () => {
    const s = makeServices({ lazyMount: true })
    expect(contentChildren(datePickerStructure(api(s), { contentMounted: false }))).toBe(0)
    expect(contentChildren(datePickerStructure(api(s)))).toBeGreaterThan(0)
  })
})
