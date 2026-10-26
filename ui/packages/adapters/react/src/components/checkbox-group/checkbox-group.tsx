/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 checkbox group 相关实现。

import type { Orientation, PropTypes, Size, Tone } from '@xihan-ui/core'
import type { CheckboxGroupApi, CheckboxGroupNode, CheckboxGroupNodeMeta, CheckboxGroupSchema, CheckboxGroupValueChangeDetails, CheckboxGroupVariant, SelectionValueKey, StructureChild } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { checkboxGroupStructure } from '@xihan-ui/headless'
import { useEffect, useMemo } from 'react'
import { mergeReactProps } from '../../runtime/merge-props'
import { renderSlot } from '../../runtime/slot-content'
import { renderStructure } from '../../runtime/structure'
import { useFieldGroupWiring, useFieldLabelWiring } from '../field/use-field-control'
import { useFormControlProps } from '../form/use-form-control'
import {
  CheckboxGroupItemProvider,
  CheckboxGroupProvider,
  useCheckboxGroupContext,
  useCheckboxGroupItemContext,
} from './context'
import { useCheckboxGroup } from './use-checkbox-group'

type CheckboxGroupProps = CheckboxGroupSchema['props']

/** 函数式 children 的载荷：整组的选中集合与全选态，以及整体替换与切换单值的方法。V 是选中值的类型。 */
export type CheckboxGroupRootSlotProps<V = string> = Pick<
  CheckboxGroupApi<PropTypes, V>,
  'value' | 'checkedState' | 'atMax' | 'atMin' | 'isChecked' | 'setValue' | 'toggleValue'
>

/**
 * V 是选中值的类型，按 value / defaultValue / collection 推断，缺省 string：数字、对象都行，
 * 对象值给 valueKey。onValueChange、children 与 renderItem 拿到的都是 V。
 */
export interface XhCheckboxGroupRootProps<V = string> extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'defaultValue'> {
  /** 不显示出来的名字，写成 aria-label 落在与字段标签同一个部件上；放进字段或渲染了 label 部件时以它们为准。 */
  ariaLabel?: string
  collection?: CheckboxGroupNode<V>[]
  /** 对象值怎样取键：字段名或取值函数；同一个选项每次都是新对象时给它，不给按对象身份认。 */
  valueKey?: SelectionValueKey<V>
  /** 标题文字。提供后不必再写 label 部件。 */
  label?: ReactNode
  value?: V[]
  defaultValue?: V[]
  /** 组内全部条目的值；未提供时全选格只在 unchecked 与 indeterminate 两态之间切换。 */
  itemValues?: V[]
  /** 至少选几项；降到它时已选的条目改不动。 */
  min?: number
  /** 至多选几项；到了它时未选的条目改不动，全选只补到它为止。 */
  max?: number
  disabled?: boolean
  readOnly?: boolean
  invalid?: boolean
  /** 必填：至少选一项，一项都没选时每份表单影子带原生 required。 */
  required?: boolean
  name?: string
  orientation?: Orientation
  tone?: Tone
  size?: Size
  /** 结构形态，默认 list；card 把每个条目画成一张可点的卡。 */
  variant?: CheckboxGroupVariant
  onValueChange?: (details: CheckboxGroupValueChangeDetails<V>) => void
  /** 每个条目的自定义内容；未提供时使用 collection 中的 label。 */
  renderItem?: (node: CheckboxGroupNodeMeta<V>) => ReactNode
  children?: SlotChildren<CheckboxGroupRootSlotProps<V>>
}

export function XhCheckboxGroupRoot<V = string>({
  ariaLabel,
  collection,
  valueKey,
  label,
  value,
  defaultValue,
  itemValues,
  min,
  max,
  disabled,
  readOnly,
  invalid,
  required,
  name,
  orientation,
  tone,
  size,
  variant,
  onValueChange,
  renderItem,
  children,
  ...rest
}: XhCheckboxGroupRootProps<V>): ReactNode {
  const ctx = useCheckboxGroup(useFormControlProps({
    ariaLabel,
    collection,
    valueKey,
    value,
    defaultValue,
    itemValues,
    min,
    max,
    disabled,
    readOnly,
    invalid,
    required,
    name,
    orientation,
    tone,
    size,
    variant,
    onValueChange,
  } as CheckboxGroupProps))
  const api = ctx.api

  // 放进表单字段时，字段的标题与说明接到组上：读屏进组时念组名与说明
  const fieldWiring = useFieldGroupWiring()
  const fieldLabel = useFieldLabelWiring()
  // 标题文字不论手写选项还是数据驱动都由根铺出：手写选项时不必再写 label 部件
  const title = label != null ? <XhCheckboxGroupLabel>{label}</XhCheckboxGroupLabel> : null
  const body = children != null
    ? renderSlot(children, {
        value: api.value,
        checkedState: api.checkedState,
        atMax: api.atMax,
        atMin: api.atMin,
        isChecked: api.isChecked,
        setValue: api.setValue,
        toggleValue: api.toggleValue,
        // 值在 api 里已经解回原值，类型上按根组件推断出来的 V 交出去
      } as CheckboxGroupRootSlotProps<V>)
    : renderDefaultStructure(api, label, renderItem)

  return (
    <CheckboxGroupProvider value={ctx}>
      <div
        {...mergeReactProps(
          fieldLabel({ ...fieldWiring, ...api.getRootProps() }),
          rest,
          { ref: (el: HTMLDivElement | null) => { ctx.rootRef.current = el } },
        )}
      >
        {children != null ? title : null}
        {body}
      </div>
    </CheckboxGroupProvider>
  )
}

XhCheckboxGroupRoot.xhEvents = ['value-change'] as const

export interface XhCheckboxGroupLabelProps extends ComponentPropsWithRef<'span'> {}
export function XhCheckboxGroupLabel({ children, ...rest }: XhCheckboxGroupLabelProps): ReactNode {
  const ctx = useCheckboxGroupContext()
  // 渲出来了才登记：根的 aria-labelledby 只在这个节点真在场时才指过来
  const { registerLabel } = ctx
  useEffect(() => registerLabel(), [registerLabel])
  return <span {...mergeReactProps(ctx.api.getLabelProps(), rest)}>{children}</span>
}

export interface XhCheckboxGroupItemProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  /** 条目代表的值，与根上的值同类型：字符串、数字或对象。 */
  value: unknown
  /** 默认交给 connect 查询 collection，写死 false 会覆盖数据中的禁用。 */
  disabled?: boolean
}
/** 表单影子由条目自行装配，不暴露为独立部件：作者只写方框与文本。 */
export function XhCheckboxGroupItem({ value, disabled, children, ...rest }: XhCheckboxGroupItemProps): ReactNode {
  const ctx = useCheckboxGroupContext()
  const item = useMemo(() => ({ value, disabled }), [value, disabled])
  return (
    <CheckboxGroupItemProvider value={item}>
      <div {...mergeReactProps(ctx.api.getItemProps(item), rest)}>
        <input
          {...ctx.api.getHiddenInputProps(item)}
          // 选中态由机器持有，这份影子输入没有自己的变更出口。React 要求带 checked 的输入
          // 交出一个出口，否则在开发构建里逐帧告警；节点是 inert，这个出口不会被调用
          onChange={noop}
        />
        {children}
      </div>
    </CheckboxGroupItemProvider>
  )
}

export interface XhCheckboxGroupIndicatorProps extends ComponentPropsWithRef<'span'> {}
/** 方框本身对读屏隐藏，children 留给作者放置勾选图形。 */
export function XhCheckboxGroupIndicator({ children, ...rest }: XhCheckboxGroupIndicatorProps): ReactNode {
  const ctx = useCheckboxGroupContext()
  const item = useCheckboxGroupItemContext()
  return <span {...mergeReactProps(ctx.api.getIndicatorProps(item), rest)}>{children}</span>
}

export interface XhCheckboxGroupItemTextProps extends ComponentPropsWithRef<'span'> {}
export function XhCheckboxGroupItemText({ children, ...rest }: XhCheckboxGroupItemTextProps): ReactNode {
  const ctx = useCheckboxGroupContext()
  const item = useCheckboxGroupItemContext()
  return <span {...mergeReactProps(ctx.api.getItemTextProps(item), rest)}>{children}</span>
}

export interface XhCheckboxGroupItemDescriptionProps extends ComponentPropsWithRef<'span'> {}
/** 条目文案下方的说明行，常用在 card 形态里。 */
export function XhCheckboxGroupItemDescription({ children, ...rest }: XhCheckboxGroupItemDescriptionProps): ReactNode {
  const ctx = useCheckboxGroupContext()
  const item = useCheckboxGroupItemContext()
  return <span {...mergeReactProps(ctx.api.getItemDescriptionProps(item), rest)}>{children}</span>
}

export interface XhCheckboxGroupSelectAllTriggerProps extends ComponentPropsWithRef<'div'> {}
/** 与条目同形的 role=checkbox 节点，渲染为 div，Space 由 connect 接管。 */
export function XhCheckboxGroupSelectAllTrigger({ children, ...rest }: XhCheckboxGroupSelectAllTriggerProps): ReactNode {
  const ctx = useCheckboxGroupContext()
  return <div {...mergeReactProps(ctx.api.getSelectAllTriggerProps(), rest)}>{children}</div>
}

function noop(): void {}

/** 标准结构里各部件对应的组件；条目里的表单影子由 XhCheckboxGroupItem 自行装配，铺结构时去掉这一格。 */
const CHECKBOX_GROUP_PARTS = {
  'label': XhCheckboxGroupLabel,
  'item': XhCheckboxGroupItem,
  'indicator': XhCheckboxGroupIndicator,
  'item-text': XhCheckboxGroupItemText,
  'item-description': XhCheckboxGroupItemDescription,
}

function withoutSelfAssembled(nodes: readonly StructureChild[]): StructureChild[] {
  return nodes.flatMap((node): StructureChild[] => {
    if (!('part' in node))
      return [node]
    if (node.part === 'hidden-input')
      return []
    return [node.children ? { ...node, children: withoutSelfAssembled(node.children) } : node]
  })
}

/**
 * 未写 children 时铺开的整套结构：照 headless 的 checkboxGroupStructure 渲，
 * 与 Web Components 不写部件时元素生成的节点出自同一份。文字以外的标题内容交给 label 部件，条目文字交给 renderItem；
 * 全选控件要用时写 children。
 */
function renderDefaultStructure<V>(api: CheckboxGroupApi<PropTypes, unknown>, label: ReactNode, renderItem?: (node: CheckboxGroupNodeMeta<V>) => ReactNode): ReactNode[] {
  const slotted: Readonly<Record<string, boolean>> = {
    label: label != null && typeof label !== 'string',
    item: renderItem != null,
  }
  const nodes = checkboxGroupStructure(api, { label: typeof label === 'string' ? label : undefined, slotted: name => slotted[name] === true })
  return renderStructure(withoutSelfAssembled(nodes), CHECKBOX_GROUP_PARTS, (node) => {
    switch (node.slot?.name) {
      case 'label':
        return label
      case 'item':
        return renderItem?.(node.data as CheckboxGroupNodeMeta<V>) ?? (node.data as CheckboxGroupNodeMeta<V>).label
      default:
        return undefined
    }
  })
}
