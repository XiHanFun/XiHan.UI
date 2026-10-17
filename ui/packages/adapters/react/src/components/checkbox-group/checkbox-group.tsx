/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 checkbox group 相关实现。

import type { Orientation, Size, Tone } from '@xihan-ui/core'
import type { CheckboxGroupApi, CheckboxGroupNode, CheckboxGroupNodeMeta, CheckboxGroupSchema, CheckboxGroupVariant, StructureChild } from '@xihan-ui/headless'
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

/** 函数式 children 的载荷：整组的选中集合与全选态，以及整体替换与切换单值的方法。 */
export type CheckboxGroupRootSlotProps = Pick<
  CheckboxGroupApi,
  'value' | 'checkedState' | 'atMax' | 'atMin' | 'isChecked' | 'setValue' | 'toggleValue'
>

export interface XhCheckboxGroupRootProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  collection?: CheckboxGroupNode[]
  /** 标题文字。提供后不必再写 label 部件。 */
  label?: ReactNode
  value?: string[]
  defaultValue?: string[]
  /** 组内全部条目的值；未提供时全选格只在 unchecked 与 indeterminate 两态之间切换。 */
  itemValues?: string[]
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
  onValueChange?: CheckboxGroupProps['onValueChange']
  /** 每个条目的自定义内容；未提供时使用 collection 中的 label。 */
  renderItem?: (node: CheckboxGroupNodeMeta) => ReactNode
  children?: SlotChildren<CheckboxGroupRootSlotProps>
}

export function XhCheckboxGroupRoot({
  collection,
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
}: XhCheckboxGroupRootProps): ReactNode {
  const ctx = useCheckboxGroup(useFormControlProps({
    collection,
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
      })
    : renderDefaultStructure(api, label, renderItem)

  return (
    <CheckboxGroupProvider value={ctx}>
      <div
        {...mergeReactProps(
          fieldLabel({ ...fieldWiring, ...api.getRootProps() as Record<string, unknown> }),
          rest as Record<string, unknown>,
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
  return <span {...mergeReactProps(ctx.api.getLabelProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhCheckboxGroupItemProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  value: string
  /** 默认交给 connect 查询 collection，写死 false 会覆盖数据中的禁用。 */
  disabled?: boolean
}
/** 表单影子由条目自行装配，不暴露为独立部件：作者只写方框与文本。 */
export function XhCheckboxGroupItem({ value, disabled, children, ...rest }: XhCheckboxGroupItemProps): ReactNode {
  const ctx = useCheckboxGroupContext()
  const item = useMemo(() => ({ value, disabled }), [value, disabled])
  return (
    <CheckboxGroupItemProvider value={item}>
      <div {...mergeReactProps(ctx.api.getItemProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>
        <input
          {...ctx.api.getHiddenInputProps(item) as Record<string, unknown>}
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
  return <span {...mergeReactProps(ctx.api.getIndicatorProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhCheckboxGroupItemTextProps extends ComponentPropsWithRef<'span'> {}
export function XhCheckboxGroupItemText({ children, ...rest }: XhCheckboxGroupItemTextProps): ReactNode {
  const ctx = useCheckboxGroupContext()
  const item = useCheckboxGroupItemContext()
  return <span {...mergeReactProps(ctx.api.getItemTextProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhCheckboxGroupItemDescriptionProps extends ComponentPropsWithRef<'span'> {}
/** 条目文案下方的说明行，常用在 card 形态里。 */
export function XhCheckboxGroupItemDescription({ children, ...rest }: XhCheckboxGroupItemDescriptionProps): ReactNode {
  const ctx = useCheckboxGroupContext()
  const item = useCheckboxGroupItemContext()
  return <span {...mergeReactProps(ctx.api.getItemDescriptionProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhCheckboxGroupSelectAllTriggerProps extends ComponentPropsWithRef<'div'> {}
/** 与条目同形的 role=checkbox 节点，渲染为 div，Space 由 connect 接管。 */
export function XhCheckboxGroupSelectAllTrigger({ children, ...rest }: XhCheckboxGroupSelectAllTriggerProps): ReactNode {
  const ctx = useCheckboxGroupContext()
  return <div {...mergeReactProps(ctx.api.getSelectAllTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
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
function renderDefaultStructure(api: CheckboxGroupApi, label: ReactNode, renderItem?: (node: CheckboxGroupNodeMeta) => ReactNode): ReactNode[] {
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
        return renderItem?.(node.data as CheckboxGroupNodeMeta) ?? (node.data as CheckboxGroupNodeMeta).label
      default:
        return undefined
    }
  })
}
