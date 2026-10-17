/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 filter builder 相关实现。

import type { Params as MachineParams, PropFn } from '@xihan-ui/core'
import type { FilterCondition, FilterGroup, FilterNode } from '@xihan-ui/viz'
import type { FilterBuilderField, FilterPath } from './filter-builder.model'
import type { FilterBuilderSchema, FilterBuilderTranslations } from './filter-builder.types'
import { focusFirst, getTabbables, setup } from '@xihan-ui/core'
import { FILTER_BUILDER_EN_US } from '../locale/en-US'
import { resolveTranslations } from '../shared/translations'
import {
  canAddFilterGroup,
  changeFilterField,
  changeFilterOperand,
  changeFilterOperator,
  createFilterCondition,
  createFilterGroup,
  emptyFilter,
  filterNodeAt,
  filterOperandShape,
  insertFilterNode,
  isFilterGroup,
  moveFilterNode,
  removeFilterNode,
  updateFilterNode,
} from './filter-builder.model'

const { createMachine } = setup<FilterBuilderSchema>()

/** 子组嵌套层数的缺省上限。 */
export const FILTER_BUILDER_MAX_DEPTH = 2

type Params = MachineParams<FilterBuilderSchema>

/** 解析后的文案。 */
export function filterBuilderTranslations(prop: PropFn<FilterBuilderSchema>): FilterBuilderTranslations {
  return resolveTranslations(FILTER_BUILDER_EN_US, prop('translations'))
}

/** 节点身份：有 id 用 id，没有时用路径。 */
export function filterNodeKey(node: FilterNode, path: FilterPath): string {
  const id = (node as { id?: unknown }).id
  return typeof id === 'string' ? `id:${id}` : `at:${path.join('.')}`
}

/** 条件节点的 DOM id：交焦点用。 */
export function filterConditionDomId(params: Pick<Params, 'scope'>, key: string): string {
  return params.scope.partId('filter-builder', `condition:${key}`)
}

/** 组的「加条件」钮的 DOM id。 */
export function filterAddTriggerDomId(params: Pick<Params, 'scope'>, key: string): string {
  return params.scope.partId('filter-builder', `add-condition:${key}`)
}

/** 按文档序给每个条件编号，1 起算；键是节点身份。 */
export function numberFilterConditions(tree: FilterGroup): Map<string, number> {
  const numbers = new Map<string, number>()
  const walk = (group: FilterGroup, path: FilterPath): void => {
    group.conditions.forEach((node, index) => {
      const at = [...path, index]
      if (isFilterGroup(node))
        walk(node, at)
      else
        numbers.set(filterNodeKey(node, at), numbers.size + 1)
    })
  }
  walk(tree, [])
  return numbers
}

function treeOf(params: Pick<Params, 'context'>): FilterGroup {
  return params.context.get('value') ?? emptyFilter()
}

function fieldsOf(prop: PropFn<FilterBuilderSchema>): readonly FilterBuilderField[] {
  return prop('fields') ?? []
}

/** 改一个条件：路径不指向条件时不动。 */
function editCondition(params: Params, path: FilterPath, edit: (condition: FilterCondition) => FilterCondition): void {
  const tree = treeOf(params)
  const next = updateFilterNode(tree, path, node => (isFilterGroup(node) ? node : edit(node)))
  if (next !== tree)
    params.context.set('value', next)
}

/** 去掉某个节点身份下记着的原始文字与来源切换。 */
function forget(params: Params, key: string): void {
  const inputs = params.context.get('inputs')
  const kept = Object.fromEntries(Object.entries(inputs).filter(([name]) => !name.startsWith(`${key}#`)))
  params.context.set('inputs', kept)
  const { [key]: _drop, ...sources } = params.context.get('sources')
  params.context.set('sources', sources)
}

/** 等这一轮渲染提交后把焦点交出去。 */
function focusLater(params: Params, focus: NonNullable<FilterBuilderSchema['context']['focus']>): void {
  params.context.set('focus', focus)
  params.flush(() => {
    const id = focus.target === 'condition' ? filterConditionDomId(params, focus.key) : filterAddTriggerDomId(params, focus.key)
    const element = params.scope.getById(id)
    if (element)
      focusFirst(focus.target === 'condition' ? getTabbables(element) : [element as HTMLElement])
    params.send({ type: 'FOCUS.DONE' })
  })
}

// 条件树住在 context 的 cell 里，受控 / 非受控在 cell 收口。每次增删改都产出一棵新树，不改原树。
// 增删与挪动后写一句播报，并在渲染提交后把焦点交给新行、相邻的行或「加条件」钮。
export const filterBuilderMachine = createMachine({
  name: 'filter-builder',
  context: ({ prop, cell }) => ({
    value: cell<FilterGroup>(() => ({
      value: prop('value'),
      defaultValue: prop('defaultValue') ?? emptyFilter(),
      onChange: value => prop('onValueChange')?.({ value }),
    })),
    inputs: cell<Readonly<Record<string, string>>>(() => ({ defaultValue: {} })),
    sources: cell<FilterBuilderSchema['context']['sources']>(() => ({ defaultValue: {} })),
    announcement: cell<string>(() => ({ defaultValue: '' })),
    focus: cell<FilterBuilderSchema['context']['focus']>(() => ({ defaultValue: null })),
  }),
  initialState: () => 'idle',
  on: {
    'LOGIC.SET': { guard: 'isEditable', actions: ['setLogic'] },
    'CONDITION.ADD': { guard: 'isEditable', actions: ['addCondition'] },
    'GROUP.ADD': { guard: 'isEditable', actions: ['addGroup'] },
    'NODE.REMOVE': { guard: 'isEditable', actions: ['removeNode'] },
    'NODE.MOVE': { guard: 'isEditable', actions: ['moveNode'] },
    'FIELD.SET': { guard: 'isEditable', actions: ['setField'] },
    'OPERATOR.SET': { guard: 'isEditable', actions: ['setOperator'] },
    'OPERAND.SET': { guard: 'isEditable', actions: ['setOperand'] },
    'NUMBER.INPUT': { guard: 'isEditable', actions: ['inputNumber'] },
    'SOURCE.SET': { guard: 'isEditable', actions: ['setSource'] },
    'IGNORE_CASE.SET': { guard: 'isEditable', actions: ['setIgnoreCase'] },
    'FOCUS.DONE': { actions: ['clearFocus'] },
  },
  states: {
    idle: {},
  },
  implementations: {
    guards: {
      isEditable: ({ prop }) => !prop('disabled') && !prop('readOnly'),
    },
    actions: {
      setLogic: (params) => {
        const event = params.event.current()
        if (event.type !== 'LOGIC.SET')
          return
        const tree = treeOf(params)
        const next = event.path.length === 0
          ? (tree.logic === event.logic ? tree : { ...tree, logic: event.logic })
          : updateFilterNode(tree, event.path, node => (isFilterGroup(node) && node.logic !== event.logic ? { ...node, logic: event.logic } : node))
        if (next !== tree)
          params.context.set('value', next)
      },
      addCondition: (params) => {
        const event = params.event.current()
        if (event.type !== 'CONDITION.ADD')
          return
        const tree = treeOf(params)
        const group = filterNodeAt(tree, event.path)
        if (!group || !isFilterGroup(group))
          return
        const condition = createFilterCondition(fieldsOf(params.prop), params.prop('createId'))
        const next = insertFilterNode(tree, event.path, condition)
        const key = filterNodeKey(condition, [...event.path, group.conditions.length])
        params.context.set('value', next)
        params.context.set('announcement', filterBuilderTranslations(params.prop).added(numberFilterConditions(next).get(key) ?? 0))
        focusLater(params, { key, target: 'condition' })
      },
      addGroup: (params) => {
        const event = params.event.current()
        if (event.type !== 'GROUP.ADD')
          return
        const tree = treeOf(params)
        const parent = filterNodeAt(tree, event.path)
        if (!parent || !isFilterGroup(parent) || !canAddFilterGroup(tree, event.path, params.prop('maxDepth') ?? FILTER_BUILDER_MAX_DEPTH))
          return
        const createId = params.prop('createId')
        const condition = createFilterCondition(fieldsOf(params.prop), createId)
        const group: FilterGroup = { ...createFilterGroup(createId), conditions: [condition] }
        const next = insertFilterNode(tree, event.path, group)
        const key = filterNodeKey(condition, [...event.path, parent.conditions.length, 0])
        params.context.set('value', next)
        params.context.set('announcement', filterBuilderTranslations(params.prop).added(numberFilterConditions(next).get(key) ?? 0))
        focusLater(params, { key, target: 'condition' })
      },
      removeNode: (params) => {
        const event = params.event.current()
        if (event.type !== 'NODE.REMOVE' || event.path.length === 0)
          return
        const tree = treeOf(params)
        const node = filterNodeAt(tree, event.path)
        if (!node)
          return
        const key = filterNodeKey(node, event.path)
        const number = isFilterGroup(node) ? undefined : numberFilterConditions(tree).get(key)
        const next = removeFilterNode(tree, event.path)
        forget(params, key)
        params.context.set('value', next)
        const t = filterBuilderTranslations(params.prop)
        params.context.set('announcement', number === undefined ? t.removeGroup : t.removed(number))
        // 焦点落到同组的下一项，没有时落到上一项，再没有落到这一组的「加条件」
        const parentPath = event.path.slice(0, -1)
        const index = event.path[event.path.length - 1]!
        const siblings = (filterNodeAt(next, parentPath) as FilterGroup).conditions
        const target = siblings[index] ?? siblings[index - 1]
        if (target) {
          const at = [...parentPath, siblings[index] ? index : index - 1]
          focusLater(params, { key: filterNodeKey(target, at), target: 'condition' })
        }
        else {
          const parent = filterNodeAt(next, parentPath)!
          focusLater(params, { key: filterNodeKey(parent, parentPath), target: 'add' })
        }
      },
      moveNode: (params) => {
        const event = params.event.current()
        if (event.type !== 'NODE.MOVE' || event.path.length === 0)
          return
        const tree = treeOf(params)
        const next = moveFilterNode(tree, event.path, event.delta)
        if (next === tree)
          return
        const at = [...event.path.slice(0, -1), event.path[event.path.length - 1]! + event.delta]
        const node = filterNodeAt(next, at)!
        const key = filterNodeKey(node, at)
        params.context.set('value', next)
        if (!isFilterGroup(node))
          params.context.set('announcement', filterBuilderTranslations(params.prop).moved(numberFilterConditions(next).get(key) ?? 0))
        focusLater(params, { key, target: 'condition' })
      },
      setField: (params) => {
        const event = params.event.current()
        if (event.type !== 'FIELD.SET')
          return
        const node = filterNodeAt(treeOf(params), event.path)
        if (node && !isFilterGroup(node))
          forget(params, filterNodeKey(node, event.path))
        editCondition(params, event.path, condition => changeFilterField(condition, event.field, fieldsOf(params.prop)))
      },
      setOperator: (params) => {
        const event = params.event.current()
        if (event.type !== 'OPERATOR.SET')
          return
        const fields = fieldsOf(params.prop)
        const node = filterNodeAt(treeOf(params), event.path)
        if (node && !isFilterGroup(node)) {
          const key = filterNodeKey(node, event.path)
          params.context.set('inputs', Object.fromEntries(Object.entries(params.context.get('inputs')).filter(([name]) => !name.startsWith(`${key}#`))))
        }
        editCondition(params, event.path, condition => changeFilterOperator(condition, event.operator, fields.find(field => field.name === condition.field)))
      },
      setOperand: (params) => {
        const event = params.event.current()
        if (event.type === 'OPERAND.SET')
          editCondition(params, event.path, condition => changeFilterOperand(condition, event.value))
      },
      // 数字框：原始文字另存，空串清掉这一端，读不成数字时只记文字、不改操作数
      inputNumber: (params) => {
        const event = params.event.current()
        if (event.type !== 'NUMBER.INPUT')
          return
        const node = filterNodeAt(treeOf(params), event.path)
        if (!node || isFilterGroup(node))
          return
        const key = filterNodeKey(node, event.path)
        params.context.set('inputs', { ...params.context.get('inputs'), [`${key}#${event.index}`]: event.text })
        const text = event.text.trim()
        const number = text === '' ? null : Number(text)
        if (number !== null && Number.isNaN(number))
          return
        editCondition(params, event.path, (condition) => {
          if (filterOperandShape(condition.operator) !== 'range')
            return changeFilterOperand(condition, number ?? undefined)
          const bounds = Array.isArray(condition.value) ? condition.value.slice(0, 2) : []
          bounds[event.index] = number
          const range = [bounds[0] ?? null, bounds[1] ?? null]
          return changeFilterOperand(condition, range.every(item => item === null) ? undefined : range)
        })
      },
      setSource: (params) => {
        const event = params.event.current()
        if (event.type !== 'SOURCE.SET')
          return
        const node = filterNodeAt(treeOf(params), event.path)
        if (!node || isFilterGroup(node))
          return
        const key = filterNodeKey(node, event.path)
        params.context.set('sources', { ...params.context.get('sources'), [key]: event.source })
        params.context.set('inputs', Object.fromEntries(Object.entries(params.context.get('inputs')).filter(([name]) => !name.startsWith(`${key}#`))))
        editCondition(params, event.path, condition => changeFilterOperand(condition, undefined))
      },
      setIgnoreCase: (params) => {
        const event = params.event.current()
        if (event.type !== 'IGNORE_CASE.SET')
          return
        editCondition(params, event.path, (condition) => {
          if (event.value)
            return condition.ignoreCase ? condition : { ...condition, ignoreCase: true }
          if (!('ignoreCase' in condition))
            return condition
          const { ignoreCase: _drop, ...rest } = condition
          return rest as FilterCondition
        })
      },
      clearFocus: ({ context }) => context.set('focus', null),
    },
  },
})
