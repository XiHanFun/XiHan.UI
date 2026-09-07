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

/** 服务端没有提交这一步，layout effect 换成永不执行的 useEffect，避开 React 的警告。 */

/** 本行持有焦点时，value 变更重报焦点行，卸载时上报表体失焦。 */
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
 * 工具条插槽的载荷：对**整张表**下手的那几样——列设置、排序链与整表状态。
 * 逐行的东西（可见行、行号、逐行查询）不在其中：工具条摆在表外，够不着某一行。
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

export interface XhTableRootProps {
  columns?: TableColumnDef[]
  rows?: TableRowDef[]
  sort?: TableSortDescriptor[]
  defaultSort?: TableSortDescriptor[]
  selection?: TableSelection
  defaultSelection?: TableSelection
  selectionMode?: TableSelectionMode
  /** 要哪几列前缀列（序号 / 多选 / 展开），按给定顺序插在最前面并占住列号。 */
  prefixColumns?: TableColumnKind[]
  /** 列偏好：给定即受控。持久化归使用者，库只负责把它算进生效列。 */
  columnPreference?: TableColumnPreference
  defaultColumnPreference?: TableColumnPreference
  /** 当前页码与每页条数：只用来算序号，不参与切片。 */
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
  /** 行可以拖着换位。整行都是拖动源，不另出把手。 */
  rowReorderable?: boolean
  /** 这一次搬家许不许。收到的是折算好的落点（搬到哪个父下面的第几位）。不给即都许。 */
  allowRowDrop?: TableProps['allowRowDrop']
  loop?: boolean
  dir?: Direction
  size?: Size
  translations?: TableProps['translations']
  onColumnPreferenceChange?: TableProps['onColumnPreferenceChange']
  onSortChange?: TableProps['onSortChange']
  onSelectionChange?: TableProps['onSelectionChange']
  onExpandedValueChange?: TableProps['onExpandedValueChange']
  /** 行换位是通知，行序与父子归属的真源在使用者的数据里。 */
  onRowMove?: TableProps['onRowMove']
  /**
   * 工具条槽：搜索、筛选、密度与列设置这些对整张表下手的控件写在这儿。
   * 它渲成 root 的兄弟排在表前——root 是 grid 系角色，子节点只能是 row 与 rowgroup。
   */
  toolbar?: SlotChildren<TableToolbarSlotProps>
  children?: SlotChildren<TableRootSlotProps>
}

export function XhTableRoot({ children, toolbar, ...props }: XhTableRootProps): ReactNode {
  const ctx = useTable(withXhConfig('table', props) as TableProps)
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
      <div {...api.getRootProps() as Record<string, unknown>}>
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
 * 工具条：搜索、筛选、密度与列设置这些对整张表下手的控件摆在这儿。
 * 写在 XhTableRoot 的 toolbar 槽里——它渲成 root 的兄弟，不进 role=grid 的子节点。
 * 不带 role：要方向键 roving 就往里放一个 XhToolbarRoot。
 */
export function XhTableToolbar({ children, ...rest }: XhTableToolbarProps): ReactNode {
  const ctx = useTableContext()
  return <div {...mergeReactProps(ctx.api.getToolbarProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhTableColumnListProps extends ComponentPropsWithRef<'div'> {}
/** 列设置区：一列一行，渲什么照根槽载荷里的 columnSettings 走。 */
export function XhTableColumnList({ children, ...rest }: XhTableColumnListProps): ReactNode {
  const ctx = useTableContext()
  return <div {...mergeReactProps(ctx.api.getColumnListProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhTableColumnVisibilityTriggerProps extends Omit<ComponentPropsWithRef<'span'>, 'value'> {
  /** 列 id。写在列设置区里必给；写在列标题里可省，跟着那一列走。 */
  value?: string
}
/**
 * 一列的显隐把手（复选形态，勾着＝这一列显示着）。
 * 列身份优先取自己的 value；不给就跟着所在的列标题走（表头里的那一路）。
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
  /** 行 id：数据行必给，表头行与脚注行省略。 */
  value?: string
}

/**
 * 一行。表头行与脚注行不带身份、不进导航，数据行要报焦点与拖动，两条路的 hook 数不一样——
 * React 的 hook 不能按条件调，所以拆成两个组件，由挂载那一刻的区段冻住选择。
 */
export function XhTableRow(props: XhTableRowProps): ReactNode {
  const section = useTableSection()
  const [frozen] = useState<TableSection>(section)
  return frozen === 'body' ? <TableDataRow {...props} /> : <TableSectionRow {...props} section={frozen} />
}

/** 表头行与脚注行：不认领 Tab 位、不报行身份。 */
function TableSectionRow({ section, value: _value, children, ...rest }: XhTableRowProps & { section: TableSection }): ReactNode {
  const ctx = useTableContext()
  const attrs = (section === 'header' ? ctx.api.getHeaderRowProps() : ctx.api.getFooterRowProps()) as Record<string, unknown>
  return <div {...mergeReactProps(attrs, rest as Record<string, unknown>)}>{children}</div>
}

/** 数据行：行身份供行内的把手与单元格读取，焦点落点如实上报给机器。 */
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
  /** 跨列数，从 value 那一列往后算。 */
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
/** 列宽把手。放在表头格里，只有 resizable 的列渲它。 */
export function XhTableColumnResizeTrigger({ children, ...rest }: XhTableColumnResizeTriggerProps): ReactNode {
  const ctx = useTableContext()
  const column = useTableColumnContext()
  return <span {...mergeReactProps(ctx.api.getColumnResizeTriggerProps(column) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhTableColumnDragTriggerProps extends ComponentPropsWithRef<'span'> {}
/** 列拖拽把手。放在表头格里，只有可拖的列渲它。 */
export function XhTableColumnDragTrigger({ children, ...rest }: XhTableColumnDragTriggerProps): ReactNode {
  const ctx = useTableContext()
  const column = useTableColumnContext()
  return <span {...mergeReactProps(ctx.api.getColumnDragTriggerProps(column) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhTableRowDragTriggerProps extends ComponentPropsWithRef<'span'> {}
/**
 * 行拖拽把手。放在数据行里，自带 touch-action: none，按下即拖，不等激活距离。
 * 对读屏隐藏、也不占 Tab 位；键盘换位由表体上的 Alt + 上下键承担，
 * 树形表下另有 Alt + 左右键改缩进层级。
 * 整行起手那一路照旧可用，把手是叠加的第二个入口。
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
/** 取下一页的入口：摆在表尾，点了做什么归作者。 */
export function XhTableLoadMoreTrigger({ children, ...rest }: XhTableLoadMoreTriggerProps): ReactNode {
  const ctx = useTableContext()
  return (
    <button {...mergeReactProps(ctx.api.getLoadMoreTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </button>
  )
}
