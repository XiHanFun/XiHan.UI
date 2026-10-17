/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 条件树编辑器的编辑模型：按路径在条件树上增删改与移动节点、按字段类型取运算符、操作数随运算符换形、条件的问题码。
// 全部是纯函数，不改入参；组与条件上不认识的键原样保留。

import type { FilterCondition, FilterGroup, FilterNode, FilterOperator } from '@xihan-ui/viz'

/** 字段与参数的取值类型。 */
export type FilterBuilderValueType = 'string' | 'number' | 'boolean' | 'date' | 'datetime'

/** 可筛选的字段。 */
export interface FilterBuilderField {
  /** 写进条件的 field。 */
  readonly name: string
  readonly label?: string
  readonly type: FilterBuilderValueType
  /** 固定候选值：eq / neq / in / notIn 改用下拉选择。 */
  readonly options?: readonly { readonly value: string | number | boolean, readonly label?: string }[]
  /** 这个字段可用的运算符，缺省按类型取。 */
  readonly operators?: readonly FilterOperator[]
}

/** 可引用的参数。 */
export interface FilterBuilderParameter {
  readonly name: string
  readonly label?: string
  readonly type: FilterBuilderValueType
  /** 多值参数只能整个用作 in / notIn 的操作数。 */
  readonly multiple?: boolean
}

/** 操作数写成参数引用。 */
export interface FilterParameterRef {
  readonly parameter: string
}

/** 条件树上一个节点的位置：从根组起每一层在 conditions 里的下标；根组是空路径。 */
export type FilterPath = readonly number[]

/** 操作数的形状：不要操作数、单个值、[下界, 上界]、一组值。 */
export type FilterOperandShape = 'none' | 'single' | 'range' | 'list'

/** 条件的问题：字段已不存在、运算符与字段类型不合、该有操作数却没有、引用的参数已不存在或不相容。 */
export type FilterConditionIssue = 'field-missing' | 'operator-invalid' | 'operand-empty' | 'parameter-invalid'

/** 新节点的 id；不给时新建的条件与组不带 id。 */
export type FilterBuilderCreateId = (kind: 'condition' | 'group') => string

/** 各类型缺省可用的运算符，第一个是新条件的运算符。 */
export const FILTER_BUILDER_OPERATORS: Readonly<Record<FilterBuilderValueType, readonly FilterOperator[]>> = /* @__PURE__ */ Object.freeze({
  string: ['eq', 'neq', 'in', 'notIn', 'contains', 'notContains', 'startsWith', 'endsWith', 'isEmpty', 'isNotEmpty'],
  number: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between', 'in', 'notIn', 'isEmpty', 'isNotEmpty'],
  date: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between', 'isEmpty', 'isNotEmpty'],
  datetime: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between', 'isEmpty', 'isNotEmpty'],
  boolean: ['eq', 'neq', 'isEmpty', 'isNotEmpty'],
})

/** 空树：根组没有条件。 */
export function emptyFilter(): FilterGroup {
  return { logic: 'and', conditions: [] }
}

/** 节点是不是条件组。 */
export function isFilterGroup<C extends FilterCondition>(node: FilterNode<C>): node is FilterGroup<C> {
  return 'conditions' in node && Array.isArray(node.conditions)
}

/** 操作数是不是参数引用。 */
export function isParameterRef(value: unknown): value is FilterParameterRef {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && typeof (value as FilterParameterRef).parameter === 'string'
}

/** 这个字段可用的运算符。 */
export function filterOperatorsFor(field: FilterBuilderField): readonly FilterOperator[] {
  return field.operators ?? FILTER_BUILDER_OPERATORS[field.type]
}

/** 运算符要的操作数形状。 */
export function filterOperandShape(operator: FilterOperator): FilterOperandShape {
  switch (operator) {
    case 'isEmpty':
    case 'isNotEmpty':
      return 'none'
    case 'between':
      return 'range'
    case 'in':
    case 'notIn':
      return 'list'
    default:
      return 'single'
  }
}

/** 字符串字段上可以忽略大小写的运算符。 */
export function isCaseOperator(field: FilterBuilderField | undefined, operator: FilterOperator): boolean {
  return field?.type === 'string' && filterOperandShape(operator) !== 'none' && filterOperandShape(operator) !== 'range'
}

function isBlank(value: unknown): boolean {
  return value === undefined || value === null || value === ''
}

/** 操作数换成另一种形状：单值进数组作第一项，数组取第一项作单值，保留不了的清空（返回 undefined）。 */
export function reshapeOperand(value: unknown, to: FilterOperandShape): unknown {
  if (to === 'none' || value === undefined)
    return undefined
  const items = Array.isArray(value) ? value.filter(item => !isBlank(item)) : isBlank(value) ? [] : [value]
  if (to === 'single')
    return items[0]
  if (to === 'list') {
    if (isParameterRef(value))
      return undefined
    return items.length > 0 ? items : undefined
  }
  return items.length > 0 && !isParameterRef(value) ? [items[0], items[1] ?? null] : undefined
}

/** 写入一个条件的操作数：undefined 时去掉 value 键，其余键原样保留。 */
function withOperand<C extends FilterCondition>(condition: C, value: unknown): C {
  const { value: _drop, ...rest } = condition
  return (value === undefined ? rest : { ...rest, value }) as C
}

/** 新条件：字段取第一个，运算符取它可用的第一个，操作数为空。 */
export function createFilterCondition(fields: readonly FilterBuilderField[], createId?: FilterBuilderCreateId): FilterCondition {
  const field = fields[0]
  const condition: FilterCondition = { field: field?.name ?? '', operator: field ? filterOperatorsFor(field)[0] ?? 'eq' : 'eq' }
  return createId ? { ...condition, id: createId('condition') } as FilterCondition : condition
}

/** 新的空子组。 */
export function createFilterGroup(createId?: FilterBuilderCreateId): FilterGroup {
  const group: FilterGroup = { logic: 'and', conditions: [] }
  return createId ? { ...group, id: createId('group') } as FilterGroup : group
}

/** 换字段：运算符不在新字段可用的运算符里时换成第一个；字段类型变了时清空操作数；不能忽略大小写时去掉 ignoreCase。 */
export function changeFilterField<C extends FilterCondition>(condition: C, name: string, fields: readonly FilterBuilderField[]): C {
  const next = fields.find(field => field.name === name)
  if (!next || condition.field === name)
    return condition
  const previous = fields.find(field => field.name === condition.field)
  const operators = filterOperatorsFor(next)
  const operator = operators.includes(condition.operator) ? condition.operator : operators[0] ?? condition.operator
  let changed = { ...condition, field: name, operator } as C
  if (previous?.type !== next.type || operator !== condition.operator)
    changed = withOperand(changed, previous?.type === next.type ? reshapeOperand(condition.value, filterOperandShape(operator)) : undefined)
  if (!isCaseOperator(next, operator) && 'ignoreCase' in changed) {
    const { ignoreCase: _drop, ...rest } = changed
    changed = rest as C
  }
  return changed
}

/** 换运算符：操作数随之换形，不能忽略大小写时去掉 ignoreCase。 */
export function changeFilterOperator<C extends FilterCondition>(condition: C, operator: FilterOperator, field: FilterBuilderField | undefined): C {
  if (condition.operator === operator)
    return condition
  let changed = withOperand({ ...condition, operator } as C, reshapeOperand(condition.value, filterOperandShape(operator)))
  if (!isCaseOperator(field, operator) && 'ignoreCase' in changed) {
    const { ignoreCase: _drop, ...rest } = changed
    changed = rest as C
  }
  return changed
}

/** 改操作数。 */
export function changeFilterOperand<C extends FilterCondition>(condition: C, value: unknown): C {
  return withOperand(condition, value)
}

/** 这一处能引用的参数：类型与字段相同，多值参数只配一组值，单值参数配单值或区间的一端。 */
export function compatibleFilterParameters(parameters: readonly FilterBuilderParameter[], field: FilterBuilderField | undefined, operator: FilterOperator): FilterBuilderParameter[] {
  const shape = filterOperandShape(operator)
  if (!field || shape === 'none')
    return []
  return parameters.filter(parameter => parameter.type === field.type && (shape === 'list' ? parameter.multiple === true : parameter.multiple !== true))
}

/** 条件的问题；没有问题时为 undefined。 */
export function filterConditionIssue(condition: FilterCondition, fields: readonly FilterBuilderField[], parameters: readonly FilterBuilderParameter[] = []): FilterConditionIssue | undefined {
  const field = fields.find(item => item.name === condition.field)
  if (!field)
    return 'field-missing'
  if (!filterOperatorsFor(field).includes(condition.operator))
    return 'operator-invalid'
  const shape = filterOperandShape(condition.operator)
  if (shape === 'none')
    return undefined
  const value = condition.value
  const parameterOk = (ref: FilterParameterRef): boolean => compatibleFilterParameters(parameters, field, condition.operator).some(parameter => parameter.name === ref.parameter)
  if (isParameterRef(value))
    return shape === 'range' ? 'operand-empty' : parameterOk(value) ? undefined : 'parameter-invalid'
  if (shape === 'single')
    return isBlank(value) ? 'operand-empty' : undefined
  if (!Array.isArray(value))
    return 'operand-empty'
  if (shape === 'range') {
    if (value.length !== 2 || value.some(isBlank))
      return 'operand-empty'
    return value.some(item => isParameterRef(item) && !parameterOk(item)) ? 'parameter-invalid' : undefined
  }
  return value.length === 0 ? 'operand-empty' : undefined
}

/** 路径上的节点；路径越界时为 undefined。 */
export function filterNodeAt<C extends FilterCondition>(tree: FilterGroup<C>, path: FilterPath): FilterNode<C> | undefined {
  let node: FilterNode<C> = tree
  for (const index of path) {
    if (!isFilterGroup(node))
      return undefined
    const child: FilterNode<C> | undefined = node.conditions[index]
    if (!child)
      return undefined
    node = child
  }
  return node
}

/** 改写路径上那个组（空路径是根组）的 conditions；路径不指向组时原样返回。 */
function editGroup<C extends FilterCondition>(tree: FilterGroup<C>, path: FilterPath, edit: (conditions: readonly FilterNode<C>[]) => readonly FilterNode<C>[]): FilterGroup<C> {
  if (path.length === 0) {
    const conditions = edit(tree.conditions)
    return conditions === tree.conditions ? tree : { ...tree, conditions }
  }
  const [head, ...rest] = path
  const child = tree.conditions[head!]
  if (!child || !isFilterGroup(child))
    return tree
  const next = editGroup(child, rest, edit)
  if (next === child)
    return tree
  const conditions = tree.conditions.slice()
  conditions[head!] = next
  return { ...tree, conditions }
}

/** 替换路径上的节点；路径越界或是空路径时原样返回。 */
export function updateFilterNode<C extends FilterCondition>(tree: FilterGroup<C>, path: FilterPath, update: (node: FilterNode<C>) => FilterNode<C>): FilterGroup<C> {
  if (path.length === 0)
    return tree
  const index = path[path.length - 1]!
  return editGroup(tree, path.slice(0, -1), (conditions) => {
    const node = conditions[index]
    if (!node)
      return conditions
    const next = update(node)
    if (next === node)
      return conditions
    const copy = conditions.slice()
    copy[index] = next
    return copy
  })
}

/** 在路径指向的组里插入节点，缺省插在末尾。 */
export function insertFilterNode<C extends FilterCondition>(tree: FilterGroup<C>, groupPath: FilterPath, node: FilterNode<C>, index?: number): FilterGroup<C> {
  return editGroup(tree, groupPath, (conditions) => {
    const at = index === undefined ? conditions.length : Math.max(0, Math.min(index, conditions.length))
    return [...conditions.slice(0, at), node, ...conditions.slice(at)]
  })
}

/** 删除路径上的节点。 */
export function removeFilterNode<C extends FilterCondition>(tree: FilterGroup<C>, path: FilterPath): FilterGroup<C> {
  if (path.length === 0)
    return tree
  const index = path[path.length - 1]!
  return editGroup(tree, path.slice(0, -1), conditions => index < conditions.length ? conditions.filter((_, i) => i !== index) : conditions)
}

/** 在同一组里把节点前后挪 delta 位；挪不动时原样返回。 */
export function moveFilterNode<C extends FilterCondition>(tree: FilterGroup<C>, path: FilterPath, delta: number): FilterGroup<C> {
  if (path.length === 0)
    return tree
  const index = path[path.length - 1]!
  return editGroup(tree, path.slice(0, -1), (conditions) => {
    const target = index + delta
    if (index >= conditions.length || target < 0 || target >= conditions.length || delta === 0)
      return conditions
    const copy = conditions.slice()
    const [node] = copy.splice(index, 1)
    copy.splice(target, 0, node!)
    return copy
  })
}

/** 路径指向的组嵌在第几层：根组是 0；路径不指向组时为 -1。 */
export function filterGroupDepth(tree: FilterGroup, path: FilterPath): number {
  const node = filterNodeAt(tree, path)
  return node && isFilterGroup(node) ? path.length : -1
}

/** 能不能在路径指向的组里再加子组：子组最多嵌 maxDepth 层，0 表示不能加。 */
export function canAddFilterGroup(tree: FilterGroup, path: FilterPath, maxDepth: number): boolean {
  const depth = filterGroupDepth(tree, path)
  return depth >= 0 && depth < maxDepth
}
