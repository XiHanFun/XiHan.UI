import type { FilterCondition, FilterGroup } from '@xihan-ui/viz'
import type { FilterBuilderField, FilterBuilderParameter } from '../src/filter-builder/filter-builder.model'
import { describe, expect, it } from 'vitest'
import {
  canAddFilterGroup,
  changeFilterField,
  changeFilterOperand,
  changeFilterOperator,
  compatibleFilterParameters,
  createFilterCondition,
  createFilterGroup,
  emptyFilter,
  filterConditionIssue,
  filterGroupDepth,
  filterNodeAt,
  filterOperandShape,
  filterOperatorsFor,
  insertFilterNode,
  isCaseOperator,
  moveFilterNode,
  removeFilterNode,
  reshapeOperand,
  updateFilterNode,
} from '../src/filter-builder/filter-builder.model'

const fields: FilterBuilderField[] = [
  { name: 'region', type: 'string', label: '区域' },
  { name: 'amount', type: 'number' },
  { name: 'date', type: 'date' },
  { name: 'paid', type: 'boolean' },
  { name: 'channel', type: 'string', operators: ['eq', 'in'] },
]

const parameters: FilterBuilderParameter[] = [
  { name: 'minAmount', type: 'number' },
  { name: 'regions', type: 'string', multiple: true },
  { name: 'region', type: 'string' },
]

const tree: FilterGroup = {
  logic: 'and',
  conditions: [
    { field: 'region', operator: 'eq', value: 'East', id: 'c1' } as FilterCondition,
    { logic: 'or', conditions: [{ field: 'amount', operator: 'gt', value: 10 }, { field: 'amount', operator: 'lt', value: 2 }], id: 'g1' } as FilterGroup,
    { field: 'paid', operator: 'eq', value: true },
  ],
}

describe('条件树编辑器的编辑模型', () => {
  it('运算符按字段类型取，字段可以自带运算符；操作数形状随运算符', () => {
    expect(filterOperatorsFor(fields[1]!)).toContain('between')
    expect(filterOperatorsFor(fields[3]!)).toEqual(['eq', 'neq', 'isEmpty', 'isNotEmpty'])
    expect(filterOperatorsFor(fields[4]!)).toEqual(['eq', 'in'])
    expect((['eq', 'between', 'in', 'notIn', 'isEmpty'] as const).map(filterOperandShape)).toEqual(['single', 'range', 'list', 'list', 'none'])
    expect([isCaseOperator(fields[0], 'contains'), isCaseOperator(fields[0], 'isEmpty'), isCaseOperator(fields[1], 'eq')]).toEqual([true, false, false])
  })

  it('操作数换形：单值进数组作第一项，数组取第一项作单值，参数引用只留给单值', () => {
    expect(reshapeOperand('a', 'list')).toEqual(['a'])
    expect(reshapeOperand(['a', 'b'], 'single')).toBe('a')
    expect(reshapeOperand(5, 'range')).toEqual([5, null])
    expect(reshapeOperand([1, 9, 4], 'range')).toEqual([1, 9])
    expect(reshapeOperand('a', 'none')).toBeUndefined()
    expect(reshapeOperand([], 'single')).toBeUndefined()
    expect(reshapeOperand({ parameter: 'p' }, 'single')).toEqual({ parameter: 'p' })
    expect(reshapeOperand({ parameter: 'p' }, 'list')).toBeUndefined()
    expect(reshapeOperand({ parameter: 'p' }, 'range')).toBeUndefined()
  })

  it('新条件取第一个字段与它的第一个运算符，操作数为空；给了 createId 才带 id', () => {
    expect(createFilterCondition(fields)).toEqual({ field: 'region', operator: 'eq' })
    expect(createFilterCondition(fields, kind => `${kind}-1`)).toEqual({ field: 'region', operator: 'eq', id: 'condition-1' })
    expect(createFilterGroup(kind => `${kind}-1`)).toEqual({ logic: 'and', conditions: [], id: 'group-1' })
    expect(emptyFilter()).toEqual({ logic: 'and', conditions: [] })
  })

  it('换字段：运算符不可用时换成第一个，类型变了清空操作数，不认识的键保留', () => {
    const condition = { field: 'region', operator: 'contains', value: 'Ea', ignoreCase: true, id: 'c1', bucket: 'x' } as FilterCondition
    expect(changeFilterField(condition, 'amount', fields)).toEqual({ field: 'amount', operator: 'eq', id: 'c1', bucket: 'x' })
    expect(changeFilterField(condition, 'channel', fields)).toEqual({ field: 'channel', operator: 'eq', value: 'Ea', ignoreCase: true, id: 'c1', bucket: 'x' })
    expect(changeFilterField(condition, 'region', fields)).toBe(condition)
    expect(changeFilterField(condition, 'missing', fields)).toBe(condition)
  })

  it('换运算符时操作数换形，去掉用不上的 ignoreCase', () => {
    const condition: FilterCondition = { field: 'region', operator: 'eq', value: 'East', ignoreCase: true }
    expect(changeFilterOperator(condition, 'in', fields[0])).toEqual({ field: 'region', operator: 'in', value: ['East'], ignoreCase: true })
    expect(changeFilterOperator(condition, 'isEmpty', fields[0])).toEqual({ field: 'region', operator: 'isEmpty' })
    expect(changeFilterOperator(condition, 'eq', fields[0])).toBe(condition)
    expect(changeFilterOperand(condition, undefined)).toEqual({ field: 'region', operator: 'eq', ignoreCase: true })
  })

  it('能引用的参数：类型相同，多值参数只配一组值', () => {
    expect(compatibleFilterParameters(parameters, fields[1], 'gt').map(item => item.name)).toEqual(['minAmount'])
    expect(compatibleFilterParameters(parameters, fields[0], 'in').map(item => item.name)).toEqual(['regions'])
    expect(compatibleFilterParameters(parameters, fields[0], 'eq').map(item => item.name)).toEqual(['region'])
    expect(compatibleFilterParameters(parameters, fields[0], 'isEmpty')).toEqual([])
  })

  it('条件的问题码：字段不存在、运算符不合、操作数为空、参数不相容', () => {
    expect(filterConditionIssue({ field: 'gone', operator: 'eq', value: 1 }, fields)).toBe('field-missing')
    expect(filterConditionIssue({ field: 'paid', operator: 'gt', value: true }, fields)).toBe('operator-invalid')
    expect(filterConditionIssue({ field: 'region', operator: 'eq' }, fields)).toBe('operand-empty')
    expect(filterConditionIssue({ field: 'region', operator: 'eq', value: '' }, fields)).toBe('operand-empty')
    expect(filterConditionIssue({ field: 'amount', operator: 'between', value: [1, null] }, fields)).toBe('operand-empty')
    expect(filterConditionIssue({ field: 'region', operator: 'in', value: [] }, fields)).toBe('operand-empty')
    expect(filterConditionIssue({ field: 'region', operator: 'isEmpty' }, fields)).toBeUndefined()
    expect(filterConditionIssue({ field: 'amount', operator: 'gt', value: { parameter: 'minAmount' } }, fields, parameters)).toBeUndefined()
    expect(filterConditionIssue({ field: 'region', operator: 'eq', value: { parameter: 'regions' } }, fields, parameters)).toBe('parameter-invalid')
    expect(filterConditionIssue({ field: 'amount', operator: 'between', value: [{ parameter: 'minAmount' }, 9] }, fields, parameters)).toBeUndefined()
    expect(filterConditionIssue({ field: 'amount', operator: 'between', value: [{ parameter: 'gone' }, 9] }, fields, parameters)).toBe('parameter-invalid')
  })

  it('按路径取节点、改节点、插入、删除与挪动，不改入参，组上不认识的键保留', () => {
    expect(filterNodeAt(tree, [1, 0])).toEqual({ field: 'amount', operator: 'gt', value: 10 })
    expect(filterNodeAt(tree, [0, 0])).toBeUndefined()
    expect(filterNodeAt(tree, [9])).toBeUndefined()
    const updated = updateFilterNode(tree, [1, 1], node => ({ ...node, value: 3 }) as FilterCondition)
    expect(filterNodeAt(updated, [1, 1])).toEqual({ field: 'amount', operator: 'lt', value: 3 })
    expect(updated.conditions[0]).toBe(tree.conditions[0])
    expect((updated.conditions[1] as FilterGroup & { id: string }).id).toBe('g1')
    expect(updateFilterNode(tree, [1, 1], node => node)).toBe(tree)
    const inserted = insertFilterNode(tree, [1], { field: 'date', operator: 'isEmpty' }, 0)
    expect((filterNodeAt(inserted, [1]) as FilterGroup).conditions).toHaveLength(3)
    expect(filterNodeAt(inserted, [1, 0])).toEqual({ field: 'date', operator: 'isEmpty' })
    expect(insertFilterNode(tree, [0], { field: 'date', operator: 'isEmpty' })).toBe(tree)
    const removed = removeFilterNode(tree, [1, 0])
    expect((filterNodeAt(removed, [1]) as FilterGroup).conditions).toEqual([{ field: 'amount', operator: 'lt', value: 2 }])
    expect(removeFilterNode(tree, [])).toBe(tree)
    const moved = moveFilterNode(tree, [2], -2)
    expect(moved.conditions.map(node => ('field' in node ? node.field : 'group'))).toEqual(['paid', 'region', 'group'])
    expect(moveFilterNode(tree, [0], -1)).toBe(tree)
    expect(tree.conditions).toHaveLength(3)
  })

  it('子组嵌套层数：根组是 0 层，到 maxDepth 时不能再加子组', () => {
    expect([filterGroupDepth(tree, []), filterGroupDepth(tree, [1]), filterGroupDepth(tree, [0])]).toEqual([0, 1, -1])
    expect([canAddFilterGroup(tree, [], 2), canAddFilterGroup(tree, [1], 2), canAddFilterGroup(tree, [1], 1), canAddFilterGroup(tree, [], 0)]).toEqual([true, true, false, false])
  })
})
