/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 field array 相关实现。

import type { FieldArrayApi, FieldArrayCellSlotData, FieldArrayColumn, FieldArrayItem, FieldArrayLayout, FieldArraySchema, FieldArrayTranslations, FormPath } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { fieldArrayStructure } from '@xihan-ui/headless'
import { useMemo } from 'react'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { renderSlot, slotPaints } from '../../runtime/slot-content'
import { renderStructure } from '../../runtime/structure'
import { useFieldGroupWiring, useFieldLabelWiring } from '../field/use-field-control'
import { useOptionalFormContext } from '../form/context'
import { useFormControlProps } from '../form/use-form-control'
import { FieldArrayItemProvider, FieldArrayProvider, useFieldArrayContext, useFieldArrayItemContext } from './context'
import { useFieldArray } from './use-field-array'

type FieldArrayProps = FieldArraySchema['props']

/** 函数式 children 的载荷：逐行投影与整份值、行数与上下限状态，以及整份替换、增删、移动的动作。 */
export type FieldArrayRootSlotProps = Pick<
  FieldArrayApi,
  | 'items'
  | 'value'
  | 'count'
  | 'empty'
  | 'atMin'
  | 'atMax'
  | 'canAdd'
  | 'setValue'
  | 'add'
  | 'insert'
  | 'remove'
  | 'move'
  | 'moveUp'
  | 'moveDown'
>

export interface XhFieldArrayRootProps extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'defaultValue'> {
  /** 不显示出来的名字，写成 aria-label 落在与字段标签同一个部件上；放进字段或渲染了 label 部件时以它们为准。 */
  ariaLabel?: string
  value?: unknown[]
  defaultValue?: unknown[]
  min?: number
  max?: number
  /** 新增一行时构造一个空项；未提供时插入一个 null。 */
  createItem?: () => unknown
  movable?: boolean
  /** 表格排布下行尾把手钉在末端侧，缺省 true；关掉时把手随行一起横向滚动。 */
  stickyActions?: boolean
  disabled?: boolean
  readOnly?: boolean
  invalid?: boolean
  /** 排布：list（缺省）一行一条纵向堆叠；table 是 role=table 的表格，表头与各行共用一套列宽。 */
  layout?: FieldArrayLayout
  /** 表格排布的各列，只在 table 排布下生效；顺序即列序。 */
  columns?: FieldArrayColumn[]
  name?: FormPath
  translations?: Partial<FieldArrayTranslations>
  onValueChange?: FieldArrayProps['onValueChange']
  /** 不给 children 时每一行的作者内容（列表排布）。 */
  renderItemContent?: (item: FieldArrayItem) => ReactNode
  /** 不给 children 时每一格的作者内容（表格排布）。 */
  renderItemCell?: (item: FieldArrayItem, column: FieldArrayColumn) => ReactNode
  /** 不给时照标准结构铺整套部件。 */
  children?: SlotChildren<FieldArrayRootSlotProps>
}

export function XhFieldArrayRoot({
  ariaLabel,
  value,
  defaultValue,
  min,
  max,
  createItem,
  movable,
  stickyActions,
  disabled,
  readOnly,
  invalid,
  layout,
  columns,
  name,
  translations,
  onValueChange,
  renderItemContent,
  renderItemCell,
  children,
  ...rest
}: XhFieldArrayRootProps): ReactNode {
  const form = useOptionalFormContext()
  const ctx = useFieldArray(withXhConfig('field-array', useFormControlProps({
    ariaLabel,
    value,
    defaultValue,
    min,
    max,
    createItem,
    movable,
    stickyActions,
    disabled,
    readOnly,
    invalid,
    layout,
    columns,
    name,
    translations,
    onValueChange,
  })) as FieldArrayProps, form?.service)
  const api = ctx.api

  return (
    <FieldArrayProvider value={ctx}>
      <div
        {...mergeReactProps(
          api.getRootProps() as Record<string, unknown>,
          rest as Record<string, unknown>,
          { ref: (el: HTMLDivElement | null) => { ctx.rootRef.current = el } },
        )}
      >
        {/* 给了 children 时 items 里每一项都带 key，作者铺行时直接用 row.key；没给时照 fieldArrayStructure 铺整套结构 */}
        {children == null
          ? renderDefaultStructure(api, renderItemContent, renderItemCell)
          : renderSlot(children, {
              items: api.items,
              value: api.value,
              count: api.count,
              empty: api.empty,
              atMin: api.atMin,
              atMax: api.atMax,
              canAdd: api.canAdd,
              setValue: api.setValue,
              add: api.add,
              insert: api.insert,
              remove: api.remove,
              move: api.move,
              moveUp: api.moveUp,
              moveDown: api.moveDown,
            })}
      </div>
    </FieldArrayProvider>
  )
}

XhFieldArrayRoot.xhEvents = ['value-change'] as const

export interface XhFieldArrayTableProps extends ComponentPropsWithRef<'div'> {}
/**
 * 表格排布的表格本体：role=table，表头与各行放在它里面；放进字段时字段的标签与说明接到它上面。
 * 列表排布下不带角色，也不接字段的线。
 */
export function XhFieldArrayTable({ children, ...rest }: XhFieldArrayTableProps): ReactNode {
  const fieldWiring = useFieldGroupWiring()
  const fieldLabel = useFieldLabelWiring()
  const ctx = useFieldArrayContext()
  const props = ctx.api.getTableProps() as Record<string, unknown>
  const own = ctx.api.layout === 'table' ? fieldLabel({ ...fieldWiring, ...props }) : props
  return <div {...mergeReactProps(own, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhFieldArrayHeaderProps extends ComponentPropsWithRef<'div'> {}
/** 表头行：role=row。 */
export function XhFieldArrayHeader({ children, ...rest }: XhFieldArrayHeaderProps): ReactNode {
  const ctx = useFieldArrayContext()
  return <div {...mergeReactProps(ctx.api.getHeaderProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhFieldArrayColumnHeaderProps extends ComponentPropsWithRef<'div'> {
  /** 列 id，与 columns 里的 id 对应。 */
  value: string
}
/** 列头：role=columnheader；没写内容时显示这一列的 label。 */
export function XhFieldArrayColumnHeader({ value, children, ...rest }: XhFieldArrayColumnHeaderProps): ReactNode {
  const ctx = useFieldArrayContext()
  return (
    <div {...mergeReactProps(ctx.api.getColumnHeaderProps({ value }) as Record<string, unknown>, rest as Record<string, unknown>)}>
      {slotPaints(children) ? children : ctx.api.columns.find(column => column.id === value)?.label}
    </div>
  )
}

export interface XhFieldArrayItemCellProps extends ComponentPropsWithRef<'div'> {
  /** 列 id，与 columns 里的 id 对应。 */
  value: string
}
/** 行里的一格：role=cell，落在这一列的轨道上。 */
export function XhFieldArrayItemCell({ value, children, ...rest }: XhFieldArrayItemCellProps): ReactNode {
  const ctx = useFieldArrayContext()
  const item = useFieldArrayItemContext()
  return <div {...mergeReactProps(ctx.api.getItemCellProps({ index: item.index, value }) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhFieldArrayItemProps extends ComponentPropsWithRef<'div'> {
  /** 下标由作者声明；兼收字符串，与另外两个适配器的属性口径对齐。 */
  index: number | string
}
export function XhFieldArrayItem({ index, children, ...rest }: XhFieldArrayItemProps): ReactNode {
  const ctx = useFieldArrayContext()
  const item = useMemo(() => ({ index: Math.trunc(Number(index)) }), [index])
  return (
    <FieldArrayItemProvider value={item}>
      <div {...mergeReactProps(ctx.api.getItemProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>
        {children}
      </div>
    </FieldArrayItemProvider>
  )
}

export interface XhFieldArrayItemLabelProps extends ComponentPropsWithRef<'span'> {}
/** 行前的行号或名目；纯标注，不与行内的控件建立 for 关联。 */
export function XhFieldArrayItemLabel({ children, ...rest }: XhFieldArrayItemLabelProps): ReactNode {
  const ctx = useFieldArrayContext()
  const item = useFieldArrayItemContext()
  return <span {...mergeReactProps(ctx.api.getItemLabelProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhFieldArrayItemContentProps extends ComponentPropsWithRef<'div'> {}
export function XhFieldArrayItemContent({ children, ...rest }: XhFieldArrayItemContentProps): ReactNode {
  const ctx = useFieldArrayContext()
  const item = useFieldArrayItemContext()
  return <div {...mergeReactProps(ctx.api.getItemContentProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhFieldArrayItemActionProps extends ComponentPropsWithRef<'div'> {}
export function XhFieldArrayItemAction({ children, ...rest }: XhFieldArrayItemActionProps): ReactNode {
  const ctx = useFieldArrayContext()
  const item = useFieldArrayItemContext()
  return <div {...mergeReactProps(ctx.api.getItemActionProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhFieldArrayAddTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhFieldArrayAddTrigger({ children, ...rest }: XhFieldArrayAddTriggerProps): ReactNode {
  const ctx = useFieldArrayContext()
  return <button {...mergeReactProps(ctx.api.getAddTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhFieldArrayItemDeleteTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhFieldArrayItemDeleteTrigger({ children, ...rest }: XhFieldArrayItemDeleteTriggerProps): ReactNode {
  const ctx = useFieldArrayContext()
  const item = useFieldArrayItemContext()
  return <button {...mergeReactProps(ctx.api.getItemDeleteTriggerProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

/** 拖动把手：按住拖这一行换位，只接指针、不占 Tab 位（键盘用上移、下移）。不换序时收起。 */
export interface XhFieldArrayItemDragTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhFieldArrayItemDragTrigger({ children, ...rest }: XhFieldArrayItemDragTriggerProps): ReactNode {
  const ctx = useFieldArrayContext()
  const item = useFieldArrayItemContext()
  return <button {...mergeReactProps(ctx.api.getItemDragTriggerProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhFieldArrayMoveUpTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhFieldArrayMoveUpTrigger({ children, ...rest }: XhFieldArrayMoveUpTriggerProps): ReactNode {
  const ctx = useFieldArrayContext()
  const item = useFieldArrayItemContext()
  return <button {...mergeReactProps(ctx.api.getMoveUpTriggerProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhFieldArrayMoveDownTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhFieldArrayMoveDownTrigger({ children, ...rest }: XhFieldArrayMoveDownTriggerProps): ReactNode {
  const ctx = useFieldArrayContext()
  const item = useFieldArrayItemContext()
  return <button {...mergeReactProps(ctx.api.getMoveDownTriggerProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

/** 结构里的部件 → 部件组件。 */
const FIELD_ARRAY_PARTS = {
  'table': XhFieldArrayTable,
  'header': XhFieldArrayHeader,
  'column-header': XhFieldArrayColumnHeader,
  'item': XhFieldArrayItem,
  'item-label': XhFieldArrayItemLabel,
  'item-content': XhFieldArrayItemContent,
  'item-cell': XhFieldArrayItemCell,
  'item-action': XhFieldArrayItemAction,
  'add-trigger': XhFieldArrayAddTrigger,
  'item-delete-trigger': XhFieldArrayItemDeleteTrigger,
  'item-drag-trigger': XhFieldArrayItemDragTrigger,
  'move-up-trigger': XhFieldArrayMoveUpTrigger,
  'move-down-trigger': XhFieldArrayMoveDownTrigger,
}

/**
 * 不给 children 时照 fieldArrayStructure 铺开的整套结构，与 Web Components 不写部件时元素生成的节点出自同一份。
 * 每一行（表格排布下每一格）的内容由 renderItemContent / renderItemCell 给出，没给时那一格空着。
 */
function renderDefaultStructure(
  api: FieldArrayApi,
  renderItemContent?: (item: FieldArrayItem) => ReactNode,
  renderItemCell?: (item: FieldArrayItem, column: FieldArrayColumn) => ReactNode,
): ReactNode[] {
  return renderStructure(fieldArrayStructure(api), FIELD_ARRAY_PARTS, (node) => {
    if (node.slot?.name === 'item-content')
      return renderItemContent?.(node.data as FieldArrayItem)
    if (node.slot?.name === 'item-cell') {
      const cell = node.data as FieldArrayCellSlotData
      return renderItemCell?.(cell.item, cell.column)
    }
    return undefined
  })
}
