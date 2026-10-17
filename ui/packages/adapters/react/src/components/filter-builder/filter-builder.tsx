/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 filter builder 相关实现。

import type { ControlVariant, Size } from '@xihan-ui/core'
import type { FilterBuilderApi, FilterBuilderCreateId, FilterBuilderSchema, FilterBuilderTranslations, FilterCondition, FilterField, FilterGroup, FilterParameter, FilterPath } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { filterBuilderStructure } from '@xihan-ui/headless'
import { useEffect } from 'react'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { renderSlot } from '../../runtime/slot-content'
import { renderStructure } from '../../runtime/structure'
import { XhDateFieldRoot } from '../date-field/date-field'
import { useFieldGroupWiring, useFieldLabelWiring } from '../field/use-field-control'
import { useFormControlProps } from '../form/use-form-control'
import { XhNumberFieldRoot } from '../number-field/number-field'
import { XhSelectRoot } from '../select/select'
import { XhSwitch } from '../switch/switch'
import { XhTagsInputRoot } from '../tags-input/tags-input'
import { XhTextFieldRoot } from '../text-field/text-field'
import { XhToggleGroupRoot } from '../toggle-group/toggle-group'
import {
  FilterBuilderConditionProvider,
  FilterBuilderGroupProvider,
  FilterBuilderProvider,
  useFilterBuilderConditionContext,
  useFilterBuilderContext,
  useFilterBuilderGroupContext,
} from './context'
import { useFilterBuilder } from './use-filter-builder'

type FilterBuilderProps = FilterBuilderSchema['props']

/** 函数式 children 的载荷：当前的树、视图与改树的方法。 */
export type FilterBuilderRootSlotProps = Pick<
  FilterBuilderApi,
  'value' | 'tree' | 'conditions' | 'hasIssues' | 'hasParameters' | 'announcement' | 'setLogic' | 'addCondition' | 'addGroup' | 'remove' | 'move' | 'setField' | 'setOperator' | 'setOperand' | 'setSource' | 'setIgnoreCase'
>

/** 条件行尾扩展位渲染函数的参数。 */
export interface FilterBuilderConditionExtraSlotProps {
  readonly condition: FilterCondition
  readonly path: FilterPath
}

export interface XhFilterBuilderRootProps extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'defaultValue'> {
  /** 不显示出来的名字，写成 aria-label 落在根上；放进字段或渲染了 label 部件时以它们为准。 */
  ariaLabel?: string
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
  variant?: ControlVariant
  size?: Size
  translations?: FilterBuilderProps['translations']
  onValueChange?: FilterBuilderProps['onValueChange']
  /** 带 id 的条件行尾扩展位的内容；不给时不铺扩展位。 */
  renderConditionExtra?: (props: FilterBuilderConditionExtraSlotProps) => ReactNode
  children?: SlotChildren<FilterBuilderRootSlotProps>
}

export function XhFilterBuilderRoot({
  ariaLabel,
  value,
  defaultValue,
  fields,
  parameters,
  createId,
  maxDepth,
  ignoreCase,
  disabled,
  readOnly,
  invalid,
  variant,
  size,
  translations,
  onValueChange,
  renderConditionExtra,
  children,
  ...rest
}: XhFilterBuilderRootProps): ReactNode {
  const ctx = useFilterBuilder(withXhConfig('filter-builder', useFormControlProps({
    ariaLabel,
    value,
    defaultValue,
    fields,
    parameters,
    createId,
    maxDepth,
    ignoreCase,
    disabled,
    readOnly,
    invalid,
    variant,
    size,
    translations,
    onValueChange,
  })) as FilterBuilderProps)
  // 放进表单字段时，字段的标题与说明接到根组上
  const fieldWiring = useFieldGroupWiring()
  const fieldLabel = useFieldLabelWiring()
  const api = ctx.api
  return (
    <FilterBuilderProvider value={ctx}>
      <div {...mergeReactProps(fieldLabel({ ...fieldWiring, ...api.getRootProps() as Record<string, unknown> }), rest as Record<string, unknown>)}>
        {children != null
          ? renderSlot(children, {
              value: api.value,
              tree: api.tree,
              conditions: api.conditions,
              hasIssues: api.hasIssues,
              hasParameters: api.hasParameters,
              announcement: api.announcement,
              setLogic: api.setLogic,
              addCondition: api.addCondition,
              addGroup: api.addGroup,
              remove: api.remove,
              move: api.move,
              setField: api.setField,
              setOperator: api.setOperator,
              setOperand: api.setOperand,
              setSource: api.setSource,
              setIgnoreCase: api.setIgnoreCase,
            })
          : renderDefaultStructure(api, ctx.translations, renderConditionExtra)}
      </div>
    </FilterBuilderProvider>
  )
}

XhFilterBuilderRoot.xhEvents = ['value-change'] as const

export interface XhFilterBuilderLabelProps extends ComponentPropsWithRef<'span'> {}
export function XhFilterBuilderLabel({ children, ...rest }: XhFilterBuilderLabelProps): ReactNode {
  const ctx = useFilterBuilderContext()
  // 渲出来了才登记：根的 aria-labelledby 只在这个节点真在场时才指过来
  const { registerLabel } = ctx
  useEffect(() => registerLabel(), [registerLabel])
  return <span {...mergeReactProps(ctx.api.getLabelProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

/** 组与条件部件上的 value 换成路径；树里没有这个节点是作者写错了。 */
function pathOf(api: FilterBuilderApi, value: string, part: string): FilterPath {
  const path = api.nodePath(value)
  if (!path)
    throw new Error(`[xh] ${part} 的 value「${value}」不是条件树里的节点`)
  return path
}

export interface XhFilterBuilderGroupProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  /** 组的节点身份：视图里的 key。 */
  value: string
}
export function XhFilterBuilderGroup({ value, children, ...rest }: XhFilterBuilderGroupProps): ReactNode {
  const ctx = useFilterBuilderContext()
  const path = pathOf(ctx.api, value, 'XhFilterBuilderGroup')
  return (
    <FilterBuilderGroupProvider value={path}>
      <div {...mergeReactProps(ctx.api.getGroupProps(path) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
    </FilterBuilderGroupProvider>
  )
}

export interface XhFilterBuilderGroupHeaderProps extends ComponentPropsWithRef<'div'> {}
export function XhFilterBuilderGroupHeader({ children, ...rest }: XhFilterBuilderGroupHeaderProps): ReactNode {
  const ctx = useFilterBuilderContext()
  const path = useFilterBuilderGroupContext()
  return <div {...mergeReactProps(ctx.api.getGroupHeaderProps(path) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhFilterBuilderLogicProps extends ComponentPropsWithRef<'div'> {}
export function XhFilterBuilderLogic({ children, ...rest }: XhFilterBuilderLogicProps): ReactNode {
  const ctx = useFilterBuilderContext()
  const path = useFilterBuilderGroupContext()
  return <div {...mergeReactProps(ctx.api.getLogicProps(path) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhFilterBuilderGroupDeleteTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhFilterBuilderGroupDeleteTrigger({ children, ...rest }: XhFilterBuilderGroupDeleteTriggerProps): ReactNode {
  const ctx = useFilterBuilderContext()
  const path = useFilterBuilderGroupContext()
  return <button {...mergeReactProps(ctx.api.getGroupDeleteTriggerProps(path) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhFilterBuilderGroupItemsProps extends ComponentPropsWithRef<'div'> {}
export function XhFilterBuilderGroupItems({ children, ...rest }: XhFilterBuilderGroupItemsProps): ReactNode {
  const ctx = useFilterBuilderContext()
  const path = useFilterBuilderGroupContext()
  return <div {...mergeReactProps(ctx.api.getGroupItemsProps(path) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhFilterBuilderGroupFooterProps extends ComponentPropsWithRef<'div'> {}
export function XhFilterBuilderGroupFooter({ children, ...rest }: XhFilterBuilderGroupFooterProps): ReactNode {
  const ctx = useFilterBuilderContext()
  const path = useFilterBuilderGroupContext()
  return <div {...mergeReactProps(ctx.api.getGroupFooterProps(path) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhFilterBuilderAddConditionTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhFilterBuilderAddConditionTrigger({ children, ...rest }: XhFilterBuilderAddConditionTriggerProps): ReactNode {
  const ctx = useFilterBuilderContext()
  const path = useFilterBuilderGroupContext()
  return <button {...mergeReactProps(ctx.api.getAddConditionTriggerProps(path) as Record<string, unknown>, rest as Record<string, unknown>)}>{children ?? ctx.translations.addCondition}</button>
}

export interface XhFilterBuilderAddGroupTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhFilterBuilderAddGroupTrigger({ children, ...rest }: XhFilterBuilderAddGroupTriggerProps): ReactNode {
  const ctx = useFilterBuilderContext()
  const path = useFilterBuilderGroupContext()
  return <button {...mergeReactProps(ctx.api.getAddGroupTriggerProps(path) as Record<string, unknown>, rest as Record<string, unknown>)}>{children ?? ctx.translations.addGroup}</button>
}

export interface XhFilterBuilderConditionProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  /** 条件的节点身份：视图里的 key。 */
  value: string
}
export function XhFilterBuilderCondition({ value, children, ...rest }: XhFilterBuilderConditionProps): ReactNode {
  const ctx = useFilterBuilderContext()
  const path = pathOf(ctx.api, value, 'XhFilterBuilderCondition')
  return (
    <FilterBuilderConditionProvider value={path}>
      <div {...mergeReactProps(ctx.api.getConditionProps(path) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
    </FilterBuilderConditionProvider>
  )
}

export interface XhFilterBuilderConditionFieldProps extends ComponentPropsWithRef<'div'> {}
export function XhFilterBuilderConditionField({ children, ...rest }: XhFilterBuilderConditionFieldProps): ReactNode {
  const ctx = useFilterBuilderContext()
  const path = useFilterBuilderConditionContext()
  return <div {...mergeReactProps(ctx.api.getConditionFieldProps(path) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhFilterBuilderConditionOperatorProps extends ComponentPropsWithRef<'div'> {}
export function XhFilterBuilderConditionOperator({ children, ...rest }: XhFilterBuilderConditionOperatorProps): ReactNode {
  const ctx = useFilterBuilderContext()
  const path = useFilterBuilderConditionContext()
  return <div {...mergeReactProps(ctx.api.getConditionOperatorProps(path) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhFilterBuilderConditionSourceProps extends ComponentPropsWithRef<'div'> {}
export function XhFilterBuilderConditionSource({ children, ...rest }: XhFilterBuilderConditionSourceProps): ReactNode {
  const ctx = useFilterBuilderContext()
  const path = useFilterBuilderConditionContext()
  return <div {...mergeReactProps(ctx.api.getConditionSourceProps(path) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhFilterBuilderConditionOperandProps extends ComponentPropsWithRef<'div'> {}
export function XhFilterBuilderConditionOperand({ children, ...rest }: XhFilterBuilderConditionOperandProps): ReactNode {
  const ctx = useFilterBuilderContext()
  const path = useFilterBuilderConditionContext()
  return <div {...mergeReactProps(ctx.api.getConditionOperandProps(path) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhFilterBuilderConditionIgnoreCaseProps extends ComponentPropsWithRef<'div'> {}
export function XhFilterBuilderConditionIgnoreCase({ children, ...rest }: XhFilterBuilderConditionIgnoreCaseProps): ReactNode {
  const ctx = useFilterBuilderContext()
  const path = useFilterBuilderConditionContext()
  return <div {...mergeReactProps(ctx.api.getConditionIgnoreCaseProps(path) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhFilterBuilderConditionExtraProps extends ComponentPropsWithRef<'div'> {}
export function XhFilterBuilderConditionExtra({ children, ...rest }: XhFilterBuilderConditionExtraProps): ReactNode {
  const ctx = useFilterBuilderContext()
  const path = useFilterBuilderConditionContext()
  return <div {...mergeReactProps(ctx.api.getConditionExtraProps(path) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhFilterBuilderConditionDeleteTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhFilterBuilderConditionDeleteTrigger({ children, ...rest }: XhFilterBuilderConditionDeleteTriggerProps): ReactNode {
  const ctx = useFilterBuilderContext()
  const path = useFilterBuilderConditionContext()
  return <button {...mergeReactProps(ctx.api.getConditionDeleteTriggerProps(path) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhFilterBuilderConditionErrorProps extends ComponentPropsWithRef<'p'> {}
export function XhFilterBuilderConditionError({ children, ...rest }: XhFilterBuilderConditionErrorProps): ReactNode {
  const ctx = useFilterBuilderContext()
  const path = useFilterBuilderConditionContext()
  return <p {...mergeReactProps(ctx.api.getConditionErrorProps(path) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</p>
}

export interface XhFilterBuilderRangeSeparatorProps extends ComponentPropsWithRef<'span'> {}
export function XhFilterBuilderRangeSeparator({ children, ...rest }: XhFilterBuilderRangeSeparatorProps): ReactNode {
  const ctx = useFilterBuilderContext()
  return <span {...mergeReactProps(ctx.api.getRangeSeparatorProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children ?? ctx.translations.rangeSeparator}</span>
}

export interface XhFilterBuilderEmptyProps extends ComponentPropsWithRef<'div'> {}
export function XhFilterBuilderEmpty({ children, ...rest }: XhFilterBuilderEmptyProps): ReactNode {
  const ctx = useFilterBuilderContext()
  return <div {...mergeReactProps(ctx.api.getEmptyProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children ?? ctx.translations.empty}</div>
}

export interface XhFilterBuilderLiveRegionProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {}
export function XhFilterBuilderLiveRegion(props: XhFilterBuilderLiveRegionProps): ReactNode {
  const ctx = useFilterBuilderContext()
  return <div {...mergeReactProps(ctx.api.getLiveRegionProps() as Record<string, unknown>, props as Record<string, unknown>)}>{ctx.api.announcement}</div>
}

/** 标准结构里各部件对应的组件。 */
const FILTER_BUILDER_PARTS = {
  'group': XhFilterBuilderGroup,
  'group-header': XhFilterBuilderGroupHeader,
  'logic': XhFilterBuilderLogic,
  'group-delete-trigger': XhFilterBuilderGroupDeleteTrigger,
  'group-items': XhFilterBuilderGroupItems,
  'group-footer': XhFilterBuilderGroupFooter,
  'add-condition-trigger': XhFilterBuilderAddConditionTrigger,
  'add-group-trigger': XhFilterBuilderAddGroupTrigger,
  'condition': XhFilterBuilderCondition,
  'condition-field': XhFilterBuilderConditionField,
  'condition-operator': XhFilterBuilderConditionOperator,
  'condition-source': XhFilterBuilderConditionSource,
  'condition-operand': XhFilterBuilderConditionOperand,
  'range-separator': XhFilterBuilderRangeSeparator,
  'condition-ignore-case': XhFilterBuilderConditionIgnoreCase,
  'condition-extra': XhFilterBuilderConditionExtra,
  'condition-delete-trigger': XhFilterBuilderConditionDeleteTrigger,
  'condition-error': XhFilterBuilderConditionError,
  'empty': XhFilterBuilderEmpty,
  'live-region': XhFilterBuilderLiveRegion,
}

/** 标准结构里组合进来的组件：与 Web Components 元素的 static dependencies 是同一份清单。 */
const FILTER_BUILDER_INSTANCES = {
  'date-field': XhDateFieldRoot,
  'number-field': XhNumberFieldRoot,
  'select': XhSelectRoot,
  'switch': XhSwitch,
  'tags-input': XhTagsInputRoot,
  'text-field': XhTextFieldRoot,
  'toggle-group': XhToggleGroupRoot,
}

/**
 * 未写 children 时铺开的整套结构：照 headless 的 filterBuilderStructure 渲，与 Web Components 不写部件时元素生成的节点出自同一份。
 * 给了 renderConditionExtra 时，带 id 的条件行尾铺扩展位，内容交给它。
 */
function renderDefaultStructure(api: FilterBuilderApi, translations: FilterBuilderTranslations, renderConditionExtra?: (props: FilterBuilderConditionExtraSlotProps) => ReactNode): ReactNode[] {
  const nodes = filterBuilderStructure(api, translations, { slotted: name => name === 'condition-extra' && renderConditionExtra != null })
  return renderStructure(nodes, FILTER_BUILDER_PARTS, node =>
    node.slot?.name === 'condition-extra' ? renderConditionExtra?.(node.data as FilterBuilderConditionExtraSlotProps) : undefined, FILTER_BUILDER_INSTANCES)
}
