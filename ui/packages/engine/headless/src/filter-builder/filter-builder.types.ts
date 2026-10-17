/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 filter builder 类型契约。

import type { ControlVariant, MachineSchema, PropTypes, Size } from '@xihan-ui/core'
import type { FilterCondition, FilterField, FilterGroup, FilterOperator, FilterParameter } from '@xihan-ui/viz'
import type { StructureInstanceProps } from '../shared/structure-instance'
import type { FilterBuilderCreateId, FilterConditionIssue, FilterOperandShape, FilterPath } from './filter-builder.model'

/** 条件树与字段、参数的类型：转出 @xihan-ui/viz 的。 */
export type { FilterCondition, FilterField, FilterGroup, FilterOperator, FilterParameter } from '@xihan-ui/viz'

export interface FilterBuilderValueChangeDetails {
  /** 新的条件树；每次增删改派发一棵新树，不改原树。 */
  value: FilterGroup
}

/** 操作数从哪来：字面值，或报表参数这类可引用的参数。 */
export type FilterOperandSource = 'value' | 'parameter'

/** 一个操作数位置上的控件：组件名与它的 props。区间是两个，其余是一个。 */
export type FilterOperandControl
  = | { readonly instance: 'select', readonly props: Partial<StructureInstanceProps['select']> }
    | { readonly instance: 'text-field', readonly props: Partial<StructureInstanceProps['text-field']> }
    | { readonly instance: 'number-field', readonly props: Partial<StructureInstanceProps['number-field']> }
    | { readonly instance: 'date-field', readonly props: Partial<StructureInstanceProps['date-field']> }
    | { readonly instance: 'tags-input', readonly props: Partial<StructureInstanceProps['tags-input']> }

/** 视图里的一个条件。 */
export interface FilterBuilderConditionView {
  readonly kind: 'condition'
  readonly path: FilterPath
  /** 节点身份：有 id 用 id，没有时用路径。 */
  readonly key: string
  /** 条件在整棵树里按文档序的序号，1 起算。 */
  readonly number: number
  /** 条件的 id；没有 id 的条件不提供扩展位。 */
  readonly id: string | undefined
  readonly condition: FilterCondition
  readonly field: FilterField | undefined
  readonly operators: readonly FilterOperator[]
  readonly shape: FilterOperandShape
  readonly source: FilterOperandSource
  /** 字符串运算符时给不给「忽略大小写」开关。 */
  readonly caseToggle: boolean
  readonly issue: FilterConditionIssue | undefined
}

/** 视图里的一个组。 */
export interface FilterBuilderGroupView {
  readonly kind: 'group'
  readonly path: FilterPath
  readonly key: string
  /** 嵌套层数，根组是 0。 */
  readonly depth: number
  readonly group: FilterGroup
  readonly items: readonly (FilterBuilderConditionView | FilterBuilderGroupView)[]
  /** 还能不能在这个组里加子组。 */
  readonly canAddGroup: boolean
}

export interface FilterBuilderSchema extends MachineSchema {
  props: {
    /** 受控的条件树；undefined 表示非受控。 */
    value?: FilterGroup
    defaultValue?: FilterGroup
    /** 可筛选的字段；条件的字段下拉按它的顺序。 */
    fields?: readonly FilterField[]
    /** 可引用的参数；不给或为空时不显示「值 / 参数」切换。 */
    parameters?: readonly FilterParameter[]
    /** 新节点的 id；不给时新建的条件与组不带 id，也就没有扩展位。 */
    createId?: FilterBuilderCreateId
    /** 子组最多嵌套几层，缺省 2；0 表示不能加子组。 */
    maxDepth?: number
    /** 字符串运算符旁给不给「忽略大小写」开关，缺省 true。 */
    ignoreCase?: boolean
    disabled?: boolean
    readOnly?: boolean
    invalid?: boolean
    /**
     * 不显示出来的名字，写成 aria-label 落在根上。
     * 放进字段（字段接线）或渲染了 label 部件时名字以它们为准，aria-labelledby 盖过它。
     */
    ariaLabel?: string
    /** 作者渲染了 label 部件：根以它为名。 */
    labelled?: boolean
    variant?: ControlVariant
    size?: Size
    translations?: Partial<FilterBuilderTranslations>
    onValueChange?: (details: FilterBuilderValueChangeDetails) => void
  }
  context: {
    value: FilterGroup
    /** 数字操作数输入框里的原始文字，键是节点身份加操作数位置。 */
    inputs: Readonly<Record<string, string>>
    /** 操作数来源的切换，键是节点身份；没切换过的按操作数本身判断。 */
    sources: Readonly<Record<string, FilterOperandSource>>
    /** 读屏播报：增删与挪动后的说明。 */
    announcement: string
    /** 改完结构后要把焦点交给谁：条件的节点身份，或某个组的「加条件」钮。 */
    focus: { readonly key: string, readonly target: 'condition' | 'add' } | null
  }
  computed: Record<string, never>
  refs: Record<string, never>
  state: 'idle'
  event:
    | { type: 'LOGIC.SET', path: FilterPath, logic: FilterGroup['logic'] }
    | { type: 'CONDITION.ADD', path: FilterPath }
    | { type: 'GROUP.ADD', path: FilterPath }
    | { type: 'NODE.REMOVE', path: FilterPath }
    | { type: 'NODE.MOVE', path: FilterPath, delta: number }
    | { type: 'FIELD.SET', path: FilterPath, field: string }
    | { type: 'OPERATOR.SET', path: FilterPath, operator: FilterOperator }
    | { type: 'OPERAND.SET', path: FilterPath, value: unknown }
    | { type: 'NUMBER.INPUT', path: FilterPath, index: number, text: string }
    | { type: 'SOURCE.SET', path: FilterPath, source: FilterOperandSource }
    | { type: 'IGNORE_CASE.SET', path: FilterPath, value: boolean }
    | { type: 'FOCUS.DONE' }
  tag: never
  guard: 'isEditable'
  action: 'setLogic' | 'addCondition' | 'addGroup' | 'removeNode' | 'moveNode' | 'setField' | 'setOperator' | 'setOperand' | 'inputNumber' | 'setSource' | 'setIgnoreCase' | 'clearFocus'
  effect: never
}

export interface FilterBuilderApi<T extends PropTypes = PropTypes> {
  value: FilterGroup
  /** 整棵树的视图，根组在最外层。 */
  tree: FilterBuilderGroupView
  /** 按文档序排的全部条件。 */
  conditions: readonly FilterBuilderConditionView[]
  /** 有没有不完整的条件。 */
  hasIssues: boolean
  /** 有没有可引用的参数：有时条件行才铺「值 / 参数」切换。 */
  hasParameters: boolean
  /** 读屏播报的说明。 */
  announcement: string
  /** 节点身份（组与条件部件上的 value）对应的路径；树里没有这个节点时为 undefined。 */
  nodePath: (key: string) => FilterPath | undefined
  setLogic: (path: FilterPath, logic: FilterGroup['logic']) => void
  addCondition: (groupPath: FilterPath) => void
  addGroup: (groupPath: FilterPath) => void
  remove: (path: FilterPath) => void
  move: (path: FilterPath, delta: number) => void
  setField: (path: FilterPath, field: string) => void
  setOperator: (path: FilterPath, operator: FilterOperator) => void
  setOperand: (path: FilterPath, value: unknown) => void
  setSource: (path: FilterPath, source: FilterOperandSource) => void
  setIgnoreCase: (path: FilterPath, value: boolean) => void

  getRootProps: () => T['element']
  getLabelProps: () => T['element']
  getGroupProps: (path: FilterPath) => T['element']
  getGroupHeaderProps: (path: FilterPath) => T['element']
  getLogicProps: (path: FilterPath) => T['element']
  getGroupDeleteTriggerProps: (path: FilterPath) => T['button']
  getGroupItemsProps: (path: FilterPath) => T['element']
  getGroupFooterProps: (path: FilterPath) => T['element']
  getAddConditionTriggerProps: (path: FilterPath) => T['button']
  getAddGroupTriggerProps: (path: FilterPath) => T['button']
  getConditionProps: (path: FilterPath) => T['element']
  getConditionFieldProps: (path: FilterPath) => T['element']
  getConditionOperatorProps: (path: FilterPath) => T['element']
  getConditionSourceProps: (path: FilterPath) => T['element']
  getConditionOperandProps: (path: FilterPath) => T['element']
  getRangeSeparatorProps: () => T['element']
  getConditionIgnoreCaseProps: (path: FilterPath) => T['element']
  getConditionExtraProps: (path: FilterPath) => T['element']
  getConditionDeleteTriggerProps: (path: FilterPath) => T['button']
  getConditionErrorProps: (path: FilterPath) => T['element']
  getEmptyProps: () => T['element']
  getLiveRegionProps: () => T['element']

  /** 组的「全部满足 / 任一满足」切换，交给组合节点。 */
  getLogicControlProps: (path: FilterPath) => Partial<StructureInstanceProps['toggle-group']>
  getFieldControlProps: (path: FilterPath) => Partial<StructureInstanceProps['select']>
  getOperatorControlProps: (path: FilterPath) => Partial<StructureInstanceProps['select']>
  getSourceControlProps: (path: FilterPath) => Partial<StructureInstanceProps['toggle-group']>
  /** 操作数位置上的控件：区间是两个，不要操作数时为空。 */
  getOperandControls: (path: FilterPath) => readonly FilterOperandControl[]
  getIgnoreCaseControlProps: (path: FilterPath) => Partial<StructureInstanceProps['switch']>
}

export interface FilterBuilderTranslations {
  /** 组的逻辑：全部满足 / 任一满足，也是组的可及名。 */
  logic: (logic: FilterGroup['logic']) => string
  /** 逻辑切换的可及名，如「满足方式」。 */
  match: string
  /** 组的可及名，如「全部满足以下条件」。 */
  group: (logic: FilterGroup['logic']) => string
  /** 条件的可及名，如「条件 2」。 */
  condition: (number: number) => string
  /** 行内控件的可及名，如「条件 2 的字段」。 */
  field: (number: number) => string
  operator: (number: number) => string
  /** 操作数的可及名；区间的两端分 from / to，如「条件 2 的起始值」。 */
  operand: (number: number, end?: 'from' | 'to') => string
  source: (number: number) => string
  sourceOption: (source: FilterOperandSource) => string
  operatorOption: (operator: FilterOperator) => string
  ignoreCase: string
  /** 区间两端之间的文字。 */
  rangeSeparator: string
  /** 布尔字段的候选：是 / 否。 */
  booleanOption: (value: boolean) => string
  addCondition: string
  addGroup: string
  removeCondition: (number: number) => string
  removeGroup: string
  empty: string
  /** 播报：已添加条件 n、已删除条件 n、已移动条件 n。 */
  added: (number: number) => string
  removed: (number: number) => string
  moved: (number: number) => string
  /** 条件问题的说明。 */
  issue: (code: FilterConditionIssue) => string
}
