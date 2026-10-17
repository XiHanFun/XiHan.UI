// @vitest-environment jsdom
import type { FilterCondition, FilterField, FilterGroup, FilterParameter } from '@xihan-ui/viz'
import type { FilterBuilderSchema, FilterBuilderValueChangeDetails } from '../src/filter-builder'
import type { StructureChild } from '../src/shared/structure'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it } from 'vitest'
import { connectFilterBuilder, filterBuilderMachine, filterBuilderStructure } from '../src/filter-builder'
import { FILTER_BUILDER_EN_US } from '../src/locale/en-US'

type Props = FilterBuilderSchema['props']

const fields: FilterField[] = [
  { name: 'region', type: 'string', label: 'Region' },
  { name: 'amount', type: 'number', label: 'Amount' },
  { name: 'date', type: 'date' },
  { name: 'paid', type: 'boolean' },
  { name: 'channel', type: 'string', options: [{ value: 'web', label: 'Web' }, { value: 'shop' }] },
]

const parameters: FilterParameter[] = [
  { name: 'minAmount', type: 'number', label: 'Min amount' },
  { name: 'regions', type: 'string', multiple: true },
]

function makeBuilder(initial: Props = {}) {
  const changes: FilterBuilderValueChangeDetails[] = []
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>({ fields, ...initial, onValueChange: d => changes.push(d) })
  const service = createService(filterBuilderMachine, { props: () => props.get(), runtime })
  runtime.start()
  return {
    changes,
    api: () => connectFilterBuilder(service, normalizeProps),
    last: () => changes.at(-1)!.value,
    setProps: (next: Props) => props.set({ ...props.get(), ...next }),
  }
}

/** 结构里的组合节点：部件路径与组件名。 */
function instances(nodes: readonly StructureChild[], path: string[] = []): string[] {
  return nodes.flatMap((node) => {
    if ('instance' in node)
      return [`${path.at(-1)}:${node.instance}`]
    return 'part' in node ? instances(node.children ?? [], [...path, node.part]) : []
  })
}

const tree: FilterGroup = {
  logic: 'and',
  conditions: [
    { field: 'region', operator: 'eq', value: 'East', id: 'c1' } as FilterCondition,
    { logic: 'or', conditions: [{ field: 'amount', operator: 'gt', value: 10 }], id: 'g1' } as FilterGroup,
  ],
}

describe('filterBuilderMachine', () => {
  it('缺省是空树：根是 group，有空态；加条件取第一个字段与它的第一个运算符，给了 createId 才带 id', () => {
    const b = makeBuilder({ createId: kind => `${kind}-1` })
    expect(b.api().value).toEqual({ logic: 'and', conditions: [] })
    expect(b.api().getRootProps()).toMatchObject({ 'role': 'group', 'data-empty': '' })
    expect(b.api().getEmptyProps().hidden).toBeUndefined()
    b.api().addCondition([])
    expect(b.last()).toEqual({ logic: 'and', conditions: [{ field: 'region', operator: 'eq', id: 'condition-1' }] })
    expect(b.api().announcement).toBe('Condition 1 added')
    expect(b.api().conditions[0]).toMatchObject({ key: 'id:condition-1', number: 1, issue: 'operand-empty' })
  })

  it('换字段、换运算符、改值都派发新树，不改原树，不认识的键保留', () => {
    const b = makeBuilder({ defaultValue: tree })
    b.api().setOperator([0], 'in')
    expect(b.last().conditions[0]).toEqual({ field: 'region', operator: 'in', value: ['East'], id: 'c1' })
    b.api().setField([0], 'amount')
    expect(b.last().conditions[0]).toEqual({ field: 'amount', operator: 'in', id: 'c1' })
    b.api().setOperand([1, 0], 20)
    expect((b.last().conditions[1] as FilterGroup).conditions[0]).toEqual({ field: 'amount', operator: 'gt', value: 20 })
    expect((b.last().conditions[1] as FilterGroup & { id: string }).id).toBe('g1')
    b.api().setLogic([1], 'and')
    expect((b.last().conditions[1] as FilterGroup).logic).toBe('and')
    b.api().setLogic([], 'or')
    expect(b.last().logic).toBe('or')
    expect(tree.conditions[0]).toEqual({ field: 'region', operator: 'eq', value: 'East', id: 'c1' })
  })

  it('删除与挪动：播报带条件序号；只在同组里挪', () => {
    const b = makeBuilder({ defaultValue: { logic: 'and', conditions: [{ field: 'region', operator: 'eq', value: 'a' }, { field: 'paid', operator: 'eq', value: true }] } })
    b.api().move([1], -1)
    expect(b.last().conditions.map(node => (node as FilterCondition).field)).toEqual(['paid', 'region'])
    expect(b.api().announcement).toBe('Condition 1 moved')
    b.api().remove([0])
    expect(b.last().conditions).toEqual([{ field: 'region', operator: 'eq', value: 'a' }])
    expect(b.api().announcement).toBe('Condition 1 removed')
  })

  it('子组最多嵌 maxDepth 层：新组里带一个条件；到上限时「加条件组」收起', () => {
    const b = makeBuilder({ maxDepth: 1 })
    b.api().addGroup([])
    expect(b.last()).toEqual({ logic: 'and', conditions: [{ logic: 'and', conditions: [{ field: 'region', operator: 'eq' }] }] })
    expect(b.api().getAddGroupTriggerProps([]).hidden).toBeUndefined()
    expect(b.api().getAddGroupTriggerProps([0]).hidden).toBe(true)
    b.api().addGroup([0])
    expect(b.changes).toHaveLength(1)
    expect(b.api().getGroupDeleteTriggerProps([]).hidden).toBe(true)
  })

  it('数字操作数另存原始文字：读不成数字时不改值，区间两端分别写', () => {
    const b = makeBuilder({ defaultValue: { logic: 'and', conditions: [{ field: 'amount', operator: 'between' }] } })
    const [from, to] = b.api().getOperandControls([0])
    expect([from!.instance, to!.instance]).toEqual(['number-field', 'number-field'])
    if (from!.instance !== 'number-field' || to!.instance !== 'number-field')
      throw new Error('number fields expected')
    from!.props.onValueChange!({ value: '5', valueAsNumber: 5 })
    expect(b.last().conditions[0]).toEqual({ field: 'amount', operator: 'between', value: [5, null] })
    to!.props.onValueChange!({ value: '-', valueAsNumber: Number.NaN })
    expect(b.changes).toHaveLength(1)
    const [, typed] = b.api().getOperandControls([0])
    expect(typed!.props).toMatchObject({ value: '-' })
    to!.props.onValueChange!({ value: '12', valueAsNumber: 12 })
    expect(b.last().conditions[0]).toMatchObject({ value: [5, 12] })
    expect(b.api().conditions[0]!.issue).toBeUndefined()
  })

  it('操作数控件随字段类型与运算符换：候选值下拉、布尔下拉、日期框、标签输入；不要值时为空', () => {
    const b = makeBuilder({
      defaultValue: {
        logic: 'and',
        conditions: [
          { field: 'channel', operator: 'eq', value: 'shop' },
          { field: 'paid', operator: 'eq' },
          { field: 'date', operator: 'gt' },
          { field: 'region', operator: 'in', value: ['a'] },
          { field: 'region', operator: 'isEmpty' },
        ],
      },
    })
    const controls = [0, 1, 2, 3, 4].map(index => b.api().getOperandControls([index]).map(control => control.instance))
    expect(controls).toEqual([['select'], ['select'], ['date-field'], ['tags-input'], []])
    const channel = b.api().getOperandControls([0])[0]!
    expect(channel.props).toMatchObject({ value: ['o1'] })
    if (channel.instance === 'select')
      channel.props.onValueChange!({ value: ['o0'] })
    expect(b.last().conditions[0]).toMatchObject({ value: 'web' })
  })

  it('有参数时可切到参数：只列相容的参数，值写成参数引用', () => {
    const b = makeBuilder({ parameters, defaultValue: { logic: 'and', conditions: [{ field: 'amount', operator: 'gt', value: 3 }] } })
    expect(b.api().getConditionSourceProps([0]).hidden).toBeUndefined()
    b.api().setSource([0], 'parameter')
    expect(b.last().conditions[0]).toEqual({ field: 'amount', operator: 'gt' })
    const [control] = b.api().getOperandControls([0])
    expect(control!.instance).toBe('select')
    if (control!.instance !== 'select')
      throw new Error('select expected')
    expect(control!.props.collection).toEqual([{ value: 'minAmount', label: 'Min amount' }])
    control!.props.onValueChange!({ value: ['minAmount'] })
    expect(b.last().conditions[0]).toEqual({ field: 'amount', operator: 'gt', value: { parameter: 'minAmount' } })
    expect(b.api().conditions[0]!.source).toBe('parameter')
    const none = makeBuilder({ defaultValue: tree })
    expect(none.api().getConditionSourceProps([0]).hidden).toBe(true)
  })

  it('忽略大小写只在字符串运算符上；受控时只发意图，宿主写回后才变', () => {
    const b = makeBuilder({ value: tree })
    expect(b.api().conditions.map(view => view.caseToggle)).toEqual([true, false])
    b.api().setIgnoreCase([0], true)
    expect(b.last().conditions[0]).toMatchObject({ ignoreCase: true })
    expect(b.api().value).toBe(tree)
    b.setProps({ value: b.last() })
    expect(b.api().conditions[0]!.condition.ignoreCase).toBe(true)
    const off = makeBuilder({ defaultValue: tree, ignoreCase: false })
    expect(off.api().conditions[0]!.caseToggle).toBe(false)
  })

  it('行里 Alt+Shift+方向键挪行、Ctrl+Delete 删行；禁用与只读时不改', () => {
    const b = makeBuilder({ defaultValue: { logic: 'and', conditions: [{ field: 'region', operator: 'eq', value: 'a' }, { field: 'paid', operator: 'eq', value: true }] } })
    const press = (key: string, extra: Partial<KeyboardEvent>): void => {
      const handler = b.api().getConditionProps([1]).onKeyDown as (event: unknown) => void
      handler({ key, altKey: false, shiftKey: false, ctrlKey: false, preventDefault: () => {}, ...extra })
    }
    press('ArrowUp', { altKey: true })
    expect(b.changes).toHaveLength(0)
    press('ArrowUp', { altKey: true, shiftKey: true })
    expect(b.last().conditions.map(node => (node as FilterCondition).field)).toEqual(['paid', 'region'])
    press('Delete', { ctrlKey: true })
    expect(b.last().conditions).toHaveLength(1)
    const locked = makeBuilder({ readOnly: true, defaultValue: tree })
    locked.api().addCondition([])
    locked.api().remove([0])
    expect(locked.changes).toEqual([])
  })

  it('行内控件都有名字：逻辑切换、字段、运算符、来源、操作数（区间两端分开）与忽略大小写；根收 ariaLabel', () => {
    const b = makeBuilder({ defaultValue: tree, parameters, ariaLabel: 'Sales filter' })
    expect(b.api().getRootProps()['aria-label']).toBe('Sales filter')
    expect([b.api().nodePath('id:c1'), b.api().nodePath('id:g1'), b.api().nodePath('missing')]).toEqual([[0], [1], undefined])
    expect(b.api().getLogicControlProps([]).ariaLabel).toBe('Match')
    expect([b.api().getFieldControlProps([0]).ariaLabel, b.api().getOperatorControlProps([0]).ariaLabel, b.api().getSourceControlProps([0]).ariaLabel])
      .toEqual(['Field of condition 1', 'Operator of condition 1', 'Value source of condition 1'])
    expect(b.api().getOperandControls([0]).map(control => control.props.ariaLabel)).toEqual(['Value of condition 1'])
    expect(b.api().getIgnoreCaseControlProps([0]).ariaLabel).toBe('Ignore case')
    b.api().setOperator([1, 0], 'between')
    expect(b.api().getOperandControls([1, 0]).map(control => control.props.ariaLabel)).toEqual(['Start value of condition 2', 'End value of condition 2'])
    b.api().setSource([1, 0], 'parameter')
    expect(b.api().getOperandControls([1, 0]).map(control => control.props.ariaLabel)).toEqual(['Start value of condition 2', 'End value of condition 2'])
    b.api().setOperator([0], 'in')
    expect(b.api().getOperandControls([0]).map(control => control.props.ariaLabel)).toEqual(['Value of condition 1'])
  })

  it('不完整的条件照常留在值里，行上带 aria-invalid 与说明，根标无效', () => {
    const b = makeBuilder({ defaultValue: { logic: 'and', conditions: [{ field: 'gone', operator: 'eq', value: 1 }] } })
    expect(b.api().conditions[0]!.issue).toBe('field-missing')
    expect(b.api().getConditionProps([0])).toMatchObject({ 'aria-invalid': 'true', 'aria-label': 'Condition 1' })
    expect(b.api().getConditionProps([0])['aria-describedby']).toBe(b.api().getConditionErrorProps([0]).id)
    expect(b.api().getRootProps()).toMatchObject({ 'aria-invalid': 'true' })
  })
})

describe('filterBuilderStructure', () => {
  it('根组：组头是逻辑切换，条目是条件与子组，组尾是加条件；子组带删除钮；空态与播报', () => {
    const b = makeBuilder({ defaultValue: tree })
    const nodes = filterBuilderStructure(b.api(), FILTER_BUILDER_EN_US)
    expect(nodes.map(node => node.part)).toEqual(['group', 'live-region'])
    expect(instances(nodes)).toEqual([
      'logic:toggle-group',
      'condition-field:select',
      'condition-operator:select',
      'condition-operand:text-field',
      'condition-ignore-case:switch',
      'logic:toggle-group',
      'condition-field:select',
      'condition-operator:select',
      'condition-operand:number-field',
    ])
    const sub = nodes[0]!.children![1]!
    expect('part' in sub && sub.children![1]).toMatchObject({ part: 'group', attrs: { value: 'id:g1' } })
    const empty = makeBuilder()
    expect(filterBuilderStructure(empty.api(), FILTER_BUILDER_EN_US).map(node => node.part)).toEqual(['group', 'empty', 'live-region'])
  })

  it('作者写了内容的带 id 条件行尾有扩展位，slot 写作 condition-extra:<条件 id>，参数是条件与路径；没写内容或没有 id 的不铺', () => {
    const b = makeBuilder({ defaultValue: tree })
    const asked: (string | undefined)[] = []
    const nodes = filterBuilderStructure(b.api(), FILTER_BUILDER_EN_US, {
      slotted: (name, key) => {
        asked.push(key)
        return name === 'condition-extra'
      },
    })
    expect(asked).toEqual(['c1'])
    const find = (list: readonly StructureChild[]): StructureChild[] => list.flatMap(node => ('part' in node ? [node, ...find(node.children ?? [])] : []))
    const extras = find(nodes).filter(node => 'part' in node && node.part === 'condition-extra')
    expect(extras).toHaveLength(1)
    expect(extras[0]).toMatchObject({ slot: { name: 'condition-extra', key: 'c1' }, data: { path: [0] } })
    expect(find(filterBuilderStructure(b.api(), FILTER_BUILDER_EN_US)).some(node => 'part' in node && node.part === 'condition-extra')).toBe(false)
  })

  it('区间两端夹着分隔文字；有参数时铺「值 / 参数」切换', () => {
    const b = makeBuilder({ parameters, defaultValue: { logic: 'and', conditions: [{ field: 'amount', operator: 'between', value: [1, 2] }] } })
    const nodes = filterBuilderStructure(b.api(), FILTER_BUILDER_EN_US)
    const all = (list: readonly StructureChild[]): StructureChild[] => list.flatMap(node => ('part' in node ? [node, ...all(node.children ?? [])] : [node]))
    const operand = all(nodes).find(node => 'part' in node && node.part === 'condition-operand')
    expect(operand && 'part' in operand ? operand.children!.map(node => ('part' in node ? node.part : node.key)) : []).toEqual(['from', 'range-separator', 'to'])
    expect(instances(nodes)).toContain('condition-source:toggle-group')
  })
})
