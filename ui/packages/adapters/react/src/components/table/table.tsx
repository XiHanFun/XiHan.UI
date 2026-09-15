/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 table 相关实现。

import type { Direction, Service, Size } from '@xihan-ui/core'
import type {
  TableApi,
  TableColumnDef,
  TableColumnKind,
  TableColumnPreference,
  TableRowDef,
  TableSchema,
  TableSelection,
  TableSelectionMode,
  TableSortDescriptor,
} from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode, RefObject } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import type { TableSection } from './context'
import { useEffect, useMemo, useRef, useState } from 'react'
import { withXhConfig } from '../../config/config'
import { useIsomorphicLayoutEffect } from '../../runtime/layout-effect'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { renderSlot } from '../../runtime/slot-content'
import {
  TableColumnProvider,
  TableProvider,
  TableRowProvider,
  TableSectionProvider,
  useOptionalTableColumnContext,
  useOptionalTableRowContext,
  useTableColumnContext,
  useTableContext,
  useTableRowContext,
  useTableSection,
} from './context'
import { useTable } from './use-table'

type TableProps = TableSchema['props']

/** 服务端没有提交这一步，layout effect 替换为永不执行的 useEffect，避开 React 的警告。 */

/** 本行持有焦点时，value 变更重新报告焦点行，卸载时上报表体失焦。 */
function useRowFocusReport(
  service: Service<TableSchema>,
  el: RefObject<HTMLElement | null>,
  value: string,
): void {
  const previous = useRef(value)
  useEffect(() => {
    const prev = previous.current
    previous.current = value
    if (prev === value)
      return
    if (service.getStatus() !== 'Started')
      return
    if (el.current && service.scope.getActiveElement() === el.current)
      service.send({ type: 'ROW.FOCUS', value })
  }, [service, el, value])

  // 按「本行当下正持有焦点」判定，不按 value 比对。
  // 用 layout effect：节点从文档里摘掉之前它的清理就跑完了，此刻焦点还在它身上；
  // 排到 passive 那一档就晚了，那时节点已经离场、焦点早掉回 body
  useIsomorphicLayoutEffect(() => () => {
    // 整张表一起卸载时根部件先停机，此刻送事件会在 dev 下抛
    if (service.getStatus() !== 'Started')
      return
    if (el.current && service.scope.getActiveElement() === el.current)
      service.send({ type: 'TABLE.BLUR' })
  }, [service, el])
}

/** 函数式 children 的载荷：可见行与排序、选中、展开三态，以及逐行查询与改写它们的句柄。 */
export type TableRootSlotProps = Pick<
  TableApi,
  | 'columns'
  | 'columnPreference'
  | 'columnSettings'
  | 'setColumnSticky'
  | 'setColumnHidden'
  | 'moveColumn'
  | 'setColumnWidth'
  | 'setColumnPreference'
  | 'rowNumber'
  | 'visibleRows'
  | 'sort'
  | 'selection'
  | 'selectionState'
  | 'expandedValue'
  | 'focusedRow'
  | 'empty'
  | 'loading'
  | 'isSelected'
  | 'isExpanded'
  | 'sortDirection'
  | 'sortPriority'
  | 'toggleSort'
  | 'selectRow'
  | 'toggleSelectAll'
  | 'toggleExpandRow'
  | 'rowReorderDisabledReason'
>

/**
 * 工具条插槽的载荷：作用于整张表的项：列设置、排序链与整表状态。
 * 逐行的内容（可见行、行号、逐行查询）不在其中：工具条放在表外，无法触及某一行。
 */
export type TableToolbarSlotProps = Pick<
  TableApi,
  | 'columns'
  | 'columnSettings'
  | 'columnPreference'
  | 'setColumnHidden'
  | 'setColumnSticky'
  | 'setColumnWidth'
  | 'moveColumn'
  | 'setColumnPreference'
  | 'sort'
  | 'toggleSort'
  | 'selection'
  | 'selectionState'
  | 'empty'
  | 'loading'
>

/** 根上自有的取值；dir 与原生的同名属性含义不同，由这里接管。 */
type RootElementProps = Omit<ComponentPropsWithRef<'div'>, 'children' | 'dir'>

export interface XhTableRootProps extends RootElementProps {
  columns?: TableColumnDef[]
  rows?: TableRowDef[]
  sort?: TableSortDescriptor[]
  defaultSort?: TableSortDescriptor[]
  selection?: TableSelection
  defaultSelection?: TableSelection
  selectionMode?: TableSelectionMode
  /** 需要哪几列前缀列（序号 / 多选 / 展开），按给定顺序插入最前面并占用列号。 */
  prefixColumns?: TableColumnKind[]
  /** 列偏好：给定即受控。持久化归使用者，库只负责把它算进生效列。 */
  columnPreference?: TableColumnPreference
  defaultColumnPreference?: TableColumnPreference
  /** 当前页码与每页条数：只用于计算序号，不参与切片。 */
  page?: number
  pageSize?: number
  expandedValue?: string[]
  defaultExpandedValue?: string[]
  loading?: boolean
  empty?: boolean
  stickyHeader?: boolean
  striped?: boolean
  borderless?: boolean
  ruled?: boolean
  footer?: boolean
  /** 行可以拖动换位。整行都是拖动源，不另设把手。 */
  rowReorderable?: boolean
  /** 本次移动是否允许。收到的是折算后的落点（移动到哪个父节点下的第几位）。未提供时全部允许。 */
  allowRowDrop?: TableProps['allowRowDrop']
  loop?: boolean
  dir?: Direction
  size?: Size
  translations?: TableProps['translations']
  onColumnPreferenceChange?: TableProps['onColumnPreferenceChange']
  onSortChange?: TableProps['onSortChange']
  onSelectionChange?: TableProps['onSelectionChange']
  onExpandedValueChange?: TableProps['onExpandedValueChange']
  /** 行换位是通知，行序与父子归属的真源在使用者的数据中。 */
  onRowMove?: TableProps['onRowMove']
  /**
   * 工具条槽：搜索、筛选、密度与列设置等作用于整张表的控件写在这里。
   * 它渲染为 root 的兄弟排在表前：root 是 grid 系角色，子节点只能是 row 与 rowgroup。
   */
  toolbar?: SlotChildren<TableToolbarSlotProps>
  children?: SlotChildren<TableRootSlotProps>
}

export function XhTableRoot({
  columns,
  rows,
  sort,
  defaultSort,
  selection,
  defaultSelection,
  selectionMode,
  prefixColumns,
  columnPreference,
  defaultColumnPreference,
  page,
  pageSize,
  expandedValue,
  defaultExpandedValue,
  loading,
  empty,
  stickyHeader,
  striped,
  borderless,
  ruled,
  footer,
  rowReorderable,
  allowRowDrop,
  loop,
  dir,
  size,
  translations,
  onColumnPreferenceChange,
  onSortChange,
  onSelectionChange,
  onExpandedValueChange,
  onRowMove,
  toolbar,
  children,
  ...rest
}: XhTableRootProps): ReactNode {
  const ctx = useTable(withXhConfig('table', {
    columns,
    rows,
    sort,
    defaultSort,
    selection,
    defaultSelection,
    selectionMode,
    prefixColumns,
    columnPreference,
    defaultColumnPreference,
    page,
    pageSize,
    expandedValue,
    defaultExpandedValue,
    loading,
    empty,
    stickyHeader,
    striped,
    borderless,
    ruled,
    footer,
    rowReorderable,
    allowRowDrop,
    loop,
    dir,
    size,
    translations,
    onColumnPreferenceChange,
    onSortChange,
    onSelectionChange,
    onExpandedValueChange,
    onRowMove,
  }) as TableProps)
  const api = ctx.api
  return (
    <TableProvider value={ctx}>
      {/* 工具条排在表前且在 root 之外：root 是 role=grid，子节点只能是 row 与 rowgroup。
          载荷只给对整张表下手的那几样，逐行的东西（visibleRows / rowNumber / 选中查询）不进来 */}
      {renderSlot(toolbar, {
        columns: api.columns,
        columnSettings: api.columnSettings,
        columnPreference: api.columnPreference,
        setColumnHidden: api.setColumnHidden,
        setColumnSticky: api.setColumnSticky,
        setColumnWidth: api.setColumnWidth,
        moveColumn: api.moveColumn,
        setColumnPreference: api.setColumnPreference,
        sort: api.sort,
        toggleSort: api.toggleSort,
        selection: api.selection,
        selectionState: api.selectionState,
        empty: api.empty,
        loading: api.loading,
      })}
      <div {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
        {renderSlot(children, {
          columns: api.columns,
          columnPreference: api.columnPreference,
          columnSettings: api.columnSettings,
          setColumnHidden: api.setColumnHidden,
          setColumnSticky: api.setColumnSticky,
          moveColumn: api.moveColumn,
          setColumnWidth: api.setColumnWidth,
          setColumnPreference: api.setColumnPreference,
          rowNumber: api.rowNumber,
          visibleRows: api.visibleRows,
          sort: api.sort,
          selection: api.selection,
          selectionState: api.selectionState,
          expandedValue: api.expandedValue,
          focusedRow: api.focusedRow,
          empty: api.empty,
          loading: api.loading,
          isSelected: api.isSelected,
          isExpanded: api.isExpanded,
          sortDirection: api.sortDirection,
          sortPriority: api.sortPriority,
          toggleSort: api.toggleSort,
          selectRow: api.selectRow,
          toggleSelectAll: api.toggleSelectAll,
          toggleExpandRow: api.toggleExpandRow,
          rowReorderDisabledReason: api.rowReorderDisabledReason,
        })}
      </div>
      {/* 播报区由根组件自己渲，作者插不进 root 的兄弟位。它不能进 root：
          root 是 role=grid，塞活动区域进去是 aria-required-children（critical） */}
      <div {...api.getLiveRegionProps() as Record<string, unknown>}>{api.announcement}</div>
    </TableProvider>
  )
}

XhTableRoot.xhEvents = [
  'column-preference-change',
  'sort-change',
  'selection-change',
  'expanded-value-change',
  'row-move',
] as const

export interface XhTableToolbarProps extends ComponentPropsWithRef<'div'> {}
/**
 * 工具条：搜索、筛选、密度与列设置等作用于整张表的控件放在这里。
 * 写在 XhTableRoot 的 toolbar 槽中：它渲染为 root 的兄弟，不进入 role=grid 的子节点。
 * 不带 role：需要方向键 roving 时在其中放置一个 XhToolbarRoot。
 */
export function XhTableToolbar({ children, ...rest }: XhTableToolbarProps): ReactNode {
  const ctx = useTableContext()
  return <div {...mergeReactProps(ctx.api.getToolbarProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhTableColumnListProps extends ComponentPropsWithRef<'div'> {}
/** 列设置区：一列一行，渲染内容按根槽载荷中的 columnSettings 决定。 */
export function XhTableColumnList({ children, ...rest }: XhTableColumnListProps): ReactNode {
  const ctx = useTableContext()
  return <div {...mergeReactProps(ctx.api.getColumnListProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhTableColumnVisibilityTriggerProps extends Omit<ComponentPropsWithRef<'span'>, 'value'> {
  /** 列 id。写在列设置区中时必须提供；写在列标题中时可省略，跟随该列。 */
  value?: string
}
/**
 * 一列的显隐控件（复选形态，勾选表示该列显示）。
 * 列身份优先取自己的 value；未提供时跟随所在的列标题（表头中的路径）。
 */
export function XhTableColumnVisibilityTrigger({ value, children, ...rest }: XhTableColumnVisibilityTriggerProps): ReactNode {
  const ctx = useTableContext()
  const inherited = useOptionalTableColumnContext()
  const column = useMemo(() => ({ value: value ?? inherited?.value ?? '' }), [value, inherited])
  return (
    <span {...mergeReactProps(ctx.api.getColumnVisibilityTriggerProps(column) as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </span>
  )
}

export interface XhTableCaptionProps extends ComponentPropsWithRef<'div'> {}
export function XhTableCaption({ children, ...rest }: XhTableCaptionProps): ReactNode {
  const ctx = useTableContext()
  return <div {...mergeReactProps(ctx.api.getCaptionProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhTableHeaderProps extends ComponentPropsWithRef<'div'> {}
export function XhTableHeader({ children, ...rest }: XhTableHeaderProps): ReactNode {
  const ctx = useTableContext()
  return (
    <TableSectionProvider value="header">
      <div {...mergeReactProps(ctx.api.getHeaderProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
    </TableSectionProvider>
  )
}

export interface XhTableBodyProps extends ComponentPropsWithRef<'div'> {}
export function XhTableBody({ children, ...rest }: XhTableBodyProps): ReactNode {
  const ctx = useTableContext()
  // 键盘与 roving 的兜底 Tab 位落在表体上，不在 root 上。
  // 容器的 onFocus 是 DOM 的 focus（不冒泡，只在容器自己得焦时接管）：React 的同名合成事件
  // 挂的是冒泡的 focusin，行得焦也会把它叫起来，那一下会把焦点从行抢回去
  const bind = useNativeEvents(ctx.api.getBodyProps() as Record<string, unknown>, ['onFocus'])
  return (
    <TableSectionProvider value="body">
      <div {...mergeReactProps(bind.attrs, rest as Record<string, unknown>, { ref: bind.ref })}>{children}</div>
    </TableSectionProvider>
  )
}

export interface XhTableFooterProps extends ComponentPropsWithRef<'div'> {}
export function XhTableFooter({ children, ...rest }: XhTableFooterProps): ReactNode {
  const ctx = useTableContext()
  return (
    <TableSectionProvider value="footer">
      <div {...mergeReactProps(ctx.api.getFooterProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
    </TableSectionProvider>
  )
}

export interface XhTableRowProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  /** 行 id：数据行必须提供，表头行与脚注行省略。 */
  value?: string
}

/**
 * 一行。表头行与脚注行不带身份、不进入导航，数据行要报告焦点与拖动，两条路径的 hook 数不同：
 * React 的 hook 不能按条件调用，因此拆为两个组件，由挂载时的区段固定选择。
 */
export function XhTableRow(props: XhTableRowProps): ReactNode {
  const section = useTableSection()
  const [frozen] = useState<TableSection>(section)
  return frozen === 'body' ? <TableDataRow {...props} /> : <TableSectionRow {...props} section={frozen} />
}

/** 表头行与脚注行：不认领 Tab 位、不报告行身份。 */
function TableSectionRow({ section, value: _value, children, ...rest }: XhTableRowProps & { section: TableSection }): ReactNode {
  const ctx = useTableContext()
  const attrs = (section === 'header' ? ctx.api.getHeaderRowProps() : ctx.api.getFooterRowProps()) as Record<string, unknown>
  return <div {...mergeReactProps(attrs, rest as Record<string, unknown>)}>{children}</div>
}

/** 数据行：行身份供行内的操作按钮与单元格读取，焦点落点如实上报给状态机。 */
function TableDataRow({ value, children, ...rest }: XhTableRowProps): ReactNode {
  const ctx = useTableContext()
  const row = useMemo(() => ({ value: value ?? '' }), [value])
  const el = useRef<HTMLElement | null>(null)
  // 行的聚焦上报不冒泡，改装成原生监听器
  const bind = useNativeEvents(ctx.api.getRowProps(row) as Record<string, unknown>, ['onFocus'])
  useRowFocusReport(ctx.service, el, row.value)
  return (
    <TableRowProvider value={row}>
      <div
        {...mergeReactProps(
          bind.attrs,
          rest as Record<string, unknown>,
          { ref: bind.ref },
          { ref: (n: HTMLDivElement | null) => { el.current = n } },
        )}
      >
        {children}
      </div>
    </TableRowProvider>
  )
}

export interface XhTableColumnHeaderProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  value: string
}
export function XhTableColumnHeader({ value, children, ...rest }: XhTableColumnHeaderProps): ReactNode {
  const ctx = useTableContext()
  const column = useMemo(() => ({ value }), [value])
  return (
    <TableColumnProvider value={column}>
      <div {...mergeReactProps(ctx.api.getColumnHeaderProps(column) as Record<string, unknown>, rest as Record<string, unknown>)}>
        {children}
      </div>
    </TableColumnProvider>
  )
}

export interface XhTableCellProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  /** 列 id。 */
  value: string
  /** 跨列数，从 value 所在列向后计算。 */
  colspan?: number | string
}
export function XhTableCell({ value, colspan, children, ...rest }: XhTableCellProps): ReactNode {
  const ctx = useTableContext()
  // 行上下文可选：脚注单元格不属于任何数据行
  const rowCtx = useOptionalTableRowContext()
  const attrs = ctx.api.getCellProps({
    value,
    row: rowCtx?.value,
    colSpan: colspan == null ? undefined : Number(colspan),
  }) as Record<string, unknown>
  return <div {...mergeReactProps(attrs, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhTableSelectAllTriggerProps extends ComponentPropsWithRef<'span'> {}
export function XhTableSelectAllTrigger({ children, ...rest }: XhTableSelectAllTriggerProps): ReactNode {
  const ctx = useTableContext()
  return <span {...mergeReactProps(ctx.api.getSelectAllTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhTableRowSelectTriggerProps extends ComponentPropsWithRef<'span'> {}
export function XhTableRowSelectTrigger({ children, ...rest }: XhTableRowSelectTriggerProps): ReactNode {
  const ctx = useTableContext()
  const row = useTableRowContext()
  return <span {...mergeReactProps(ctx.api.getRowSelectTriggerProps(row) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhTableSortTriggerProps extends ComponentPropsWithRef<'span'> {}
export function XhTableSortTrigger({ children, ...rest }: XhTableSortTriggerProps): ReactNode {
  const ctx = useTableContext()
  const column = useTableColumnContext()
  return <span {...mergeReactProps(ctx.api.getSortTriggerProps(column) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhTableColumnResizeTriggerProps extends ComponentPropsWithRef<'span'> {}
/** 列宽把手。放在表头格中，只有 resizable 的列渲染它。 */
export function XhTableColumnResizeTrigger({ children, ...rest }: XhTableColumnResizeTriggerProps): ReactNode {
  const ctx = useTableContext()
  const column = useTableColumnContext()
  return <span {...mergeReactProps(ctx.api.getColumnResizeTriggerProps(column) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhTableColumnDragTriggerProps extends ComponentPropsWithRef<'span'> {}
/** 列拖拽把手。放在表头格中，只有可拖动的列渲染它。 */
export function XhTableColumnDragTrigger({ children, ...rest }: XhTableColumnDragTriggerProps): ReactNode {
  const ctx = useTableContext()
  const column = useTableColumnContext()
  return <span {...mergeReactProps(ctx.api.getColumnDragTriggerProps(column) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhTableRowDragTriggerProps extends ComponentPropsWithRef<'span'> {}
/**
 * 行拖拽把手。放在数据行中，自带 touch-action: none，按下即拖动，不等待激活距离。
 * 对读屏隐藏、也不占 Tab 位；键盘换位由表体上的 Alt + 上下键承担，
 * 树形表下另有 Alt + 左右键改变缩进层级。
 * 整行拖动的路径照常可用，把手是叠加的第二个入口。
 */
export function XhTableRowDragTrigger({ children, ...rest }: XhTableRowDragTriggerProps): ReactNode {
  const ctx = useTableContext()
  const row = useTableRowContext()
  return <span {...mergeReactProps(ctx.api.getRowDragTriggerProps(row) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhTableExpandTriggerProps extends ComponentPropsWithRef<'span'> {}
export function XhTableExpandTrigger({ children, ...rest }: XhTableExpandTriggerProps): ReactNode {
  const ctx = useTableContext()
  const row = useTableRowContext()
  return <span {...mergeReactProps(ctx.api.getExpandTriggerProps(row) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhTableExpandedRowProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  /** 所属数据行的 id。 */
  value: string
}
/** 不 provide 行上下文；收起只加 hidden，不卸载内部节点。 */
export function XhTableExpandedRow({ value, children, ...rest }: XhTableExpandedRowProps): ReactNode {
  const ctx = useTableContext()
  const row = useMemo(() => ({ value }), [value])
  return (
    <div {...mergeReactProps(ctx.api.getExpandedRowProps(row) as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhTableEmptyProps extends ComponentPropsWithRef<'div'> {}
export function XhTableEmpty({ children, ...rest }: XhTableEmptyProps): ReactNode {
  const ctx = useTableContext()
  return <div {...mergeReactProps(ctx.api.getEmptyProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhTableLoadingProps extends ComponentPropsWithRef<'div'> {}
export function XhTableLoading({ children, ...rest }: XhTableLoadingProps): ReactNode {
  const ctx = useTableContext()
  return <div {...mergeReactProps(ctx.api.getLoadingProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhTableLoadMoreTriggerProps extends ComponentPropsWithRef<'button'> {}
/** 取下一页的入口：放在表尾，点击后的行为归作者。 */
export function XhTableLoadMoreTrigger({ children, ...rest }: XhTableLoadMoreTriggerProps): ReactNode {
  const ctx = useTableContext()
  return (
    <button {...mergeReactProps(ctx.api.getLoadMoreTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </button>
  )
}
