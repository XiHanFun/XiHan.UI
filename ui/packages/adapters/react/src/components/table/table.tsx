/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 table 相关实现。

import type { CascadeStrategy, ControlVariant, Direction, Service, Size } from '@xihan-ui/core'
import type {
  StructureVirtualItem,
  TableApi,
  TableCellSlotData,
  TableColumnDef,
  TableColumnKind,
  TableColumnPreference,
  TableFilterValue,
  TableNavigation,
  TableRecord,
  TableRowDef,
  TableSchema,
  TableSelection,
  TableSelectionMode,
  TableSortDescriptor,
} from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode, RefObject } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import type { StructureVirtualSlot, StructureVirtualWindow } from '../virtualizer/structure-slot'
import type { TableSection } from './context'
import { tablePaginationStructure, tableStructure, tableVisibleDataRowCount } from '@xihan-ui/headless'
import { useEffect, useMemo, useRef, useState } from 'react'
import { withXhConfig } from '../../config/config'
import { useIsomorphicLayoutEffect } from '../../runtime/layout-effect'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { renderSlot } from '../../runtime/slot-content'
import { renderStructure } from '../../runtime/structure'
import { StructureVirtualProvider, useStructureVirtualParts } from '../virtualizer/structure-slot'
import {
  TableColumnProvider,
  TableFooterLevelProvider,
  TableHeaderLevelProvider,
  TableProvider,
  TableRowProvider,
  TableSectionProvider,
  useOptionalTableColumnContext,
  useOptionalTableRowContext,
  useTableColumnContext,
  useTableContext,
  useTableFooterLevel,
  useTableHeaderLevel,
  useTableRowContext,
  useTableSection,
} from './context'
import { useTable } from './use-table'

type TableProps = TableSchema['props']

/** 服务端没有提交这一步，layout effect 替换为永不执行的 useEffect，避开 React 的警告。 */

/** 层号：作者写数字，标准结构经属性给字符串，两种都收。 */
function levelOf(raw: number | string | undefined): number | undefined {
  return raw == null || raw === '' ? undefined : Number(raw)
}

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
  | 'headerRows'
  | 'headerRowCount'
  | 'cellSpanOf'
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
  /**
   * 数据驱动模式：给了它，表格自己按排序链、筛选值与页码算出当前页的记录（rows 不再读）。
   * 不给 children 时按标准结构铺出表头、表体与空态，列 id 即字段名；格子内容用 renderCell 接管。
   */
  data?: TableRecord[]
  /** 记录的行 id：字段名或取值函数，缺省取 id 字段。 */
  rowKey?: TableProps['rowKey']
  /** 筛选值（列 id → 勾选的值）：给定即受控。列给了 filterOptions 时列头铺一颗筛选钮。 */
  filterValue?: TableFilterValue
  defaultFilterValue?: TableFilterValue
  onFilterValueChange?: TableProps['onFilterValueChange']
  /** 数据驱动模式下分页：按 page 与 pageSize 切片，表后铺一组分页；筛选一变回到第 1 页。 */
  pagination?: boolean
  defaultPage?: number
  onPageChange?: TableProps['onPageChange']
  /**
   * 标准结构的虚拟化开关：表体只铺滚到的那一屏行，滚的是表格根节点（吸顶表头、冻结列与行在同一个滚动面里）。
   * Virtualizer 那一块开了才加载；给了 children 时不用它，照旧自己套 Virtualizer。
   */
  virtual?: boolean
  /** 开了 virtual 时数据行的预估高度（px），缺省 40；还没量到的行按已量到的平均高度估。 */
  estimateSize?: number
  /** 标准结构里一格的内容：参数里有记录、字段值与本来要显示的文字，别的列交出 text 即可。 */
  renderCell?: (cell: TableCellSlotData) => ReactNode
  /** 标准结构里空态占位的内容。 */
  renderEmpty?: () => ReactNode
  sort?: TableSortDescriptor[]
  defaultSort?: TableSortDescriptor[]
  selection?: TableSelection
  defaultSelection?: TableSelection
  selectionMode?: TableSelectionMode
  /** 树形表在 multiple 下父子级联勾选，与 Tree 的 cascade 同义。 */
  cascade?: boolean
  /** 级联下对外选中值的收敛策略，默认 child。 */
  checkedStrategy?: CascadeStrategy
  /** 单元格合并：逐格询问合并区的大小，与 antd 的 spanMethod 同一种写法。 */
  cellSpan?: TableProps['cellSpan']
  /** 表尾单元格合并：与 cellSpan 同一种写法，逐格询问第几行表尾的哪一格。 */
  footerCellSpan?: TableProps['footerCellSpan']
  /** 与 Virtualizer 的正式接线口：传 Virtualizer 的 collectionVirtualizer，count 等于可见数据行的条数。 */
  virtualizer?: TableProps['virtualizer']
  /** 需要哪几列前缀列（序号 / 多选 / 展开），按给定顺序插入最前面并占用列号。 */
  prefixColumns?: TableColumnKind[]
  /** 列偏好：给定即受控。持久化归使用者，库只负责把它算进生效列。 */
  columnPreference?: TableColumnPreference
  defaultColumnPreference?: TableColumnPreference
  /** 当前页码与每页条数：手写结构时只用于计算序号；数据驱动模式开了 pagination 时按它们切片，page 给定即受控。 */
  page?: number
  pageSize?: number
  expandedValue?: string[]
  defaultExpandedValue?: string[]
  loading?: boolean
  empty?: boolean
  stickyHeader?: boolean
  striped?: boolean
  /** 形态：outline 画外框与圆角（默认），ghost 去掉外框只留行间横线，subtle 淡底。默认 outline。 */
  variant?: ControlVariant
  ruled?: boolean
  /** 表尾行数：行号空间的最后几行留给表尾，每一行表尾写明 level。 */
  footerRows?: number
  /** 表尾吸底，与 stickyHeader 对称。 */
  stickyFooter?: boolean
  /** 行可以拖动换位。整行都是拖动源，不另设把手。 */
  rowReorderable?: boolean
  /** 声明这是一棵树：一行 parentId 都没有时也报 treegrid、Alt + 左右键改层级、任何行都能接受「放进去」。 */
  tree?: boolean
  /** 本次移动是否允许。收到的是折算后的落点（移动到哪个父节点下的第几位）。未提供时全部允许。 */
  allowRowDrop?: TableProps['allowRowDrop']
  loop?: boolean
  /** 表体的键盘导航粒度：row（缺省）只落在行上；cell 时格子也是焦点落点（treegrid），Enter / F2 进格内编辑。 */
  navigation?: TableNavigation
  dir?: Direction
  size?: Size
  translations?: TableProps['translations']
  onColumnPreferenceChange?: TableProps['onColumnPreferenceChange']
  onSortChange?: TableProps['onSortChange']
  onSelectionChange?: TableProps['onSelectionChange']
  onExpandedValueChange?: TableProps['onExpandedValueChange']
  /** 行换位是通知，行序与父子归属的真源在使用者的数据中。 */
  onRowMove?: TableProps['onRowMove']
  /** 行主操作：点在数据行上（带列 id），或焦点在行上按 Enter（列为 null）。 */
  onAction?: TableProps['onAction']
  /**
   * 工具条槽：搜索、筛选、密度与列设置等作用于整张表的控件写在这里。
   * 它渲染为 root 的兄弟排在表前：root 是 grid 系角色，子节点只能是 row 与 rowgroup。
   */
  toolbar?: SlotChildren<TableToolbarSlotProps>
  children?: SlotChildren<TableRootSlotProps>
}

/** 标准结构开虚拟化时数据行的预估高度（px），与 md 档的行高相当；还没量到的行按已量到的平均高度估。 */
const TABLE_VIRTUAL_ESTIMATE = 40

export function XhTableRoot({
  columns,
  rows,
  data,
  rowKey,
  filterValue,
  defaultFilterValue,
  onFilterValueChange,
  pagination,
  defaultPage,
  onPageChange,
  virtual,
  estimateSize,
  renderCell,
  renderEmpty,
  sort,
  defaultSort,
  selection,
  defaultSelection,
  selectionMode,
  cascade,
  checkedStrategy,
  cellSpan,
  footerCellSpan,
  virtualizer,
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
  variant,
  ruled,
  footerRows,
  stickyFooter,
  rowReorderable,
  tree,
  allowRowDrop,
  loop,
  navigation,
  dir,
  size,
  translations,
  onColumnPreferenceChange,
  onSortChange,
  onSelectionChange,
  onExpandedValueChange,
  onRowMove,
  onAction,
  toolbar,
  children,
  ...rest
}: XhTableRootProps): ReactNode {
  // 标准结构的虚拟化：Virtualizer 由异步加载进来的视口自己跑，它把桥与窗口回报到这里。
  // 视口挂上来之前不带桥、表体里也没有行；挂上来之后桥交给机器、行按窗口铺
  const [virtualWindow, setVirtualWindow] = useState<StructureVirtualWindow | null>(null)
  const virtualParts = useStructureVirtualParts(virtual)
  const ctx = useTable(withXhConfig('table', {
    columns,
    rows,
    data,
    rowKey,
    filterValue,
    defaultFilterValue,
    onFilterValueChange,
    pagination,
    defaultPage,
    onPageChange,
    sort,
    defaultSort,
    selection,
    defaultSelection,
    selectionMode,
    cascade,
    checkedStrategy,
    cellSpan,
    footerCellSpan,
    virtualizer: virtual ? virtualWindow?.bridge : virtualizer,
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
    variant,
    ruled,
    footerRows,
    stickyFooter,
    rowReorderable,
    tree,
    allowRowDrop,
    loop,
    navigation,
    dir,
    size,
    translations,
    onColumnPreferenceChange,
    onSortChange,
    onSelectionChange,
    onExpandedValueChange,
    onRowMove,
    onAction,
  }) as TableProps)
  const api = ctx.api
  const structured = children == null
  const instances = useTableInstances(structured && api.dataDriven && (api.paginated || api.columns.some(column => column.filterOptions?.length)))
  // 条数经数据管线现算、不经表格的 api（见 StructureVirtualSlot.count）；滚的是表格根节点
  const virtualSlot: StructureVirtualSlot | null = virtual
    ? { count: tableVisibleDataRowCount(ctx.service), estimateSize: estimateSize ?? TABLE_VIRTUAL_ESTIMATE, scrollContainer: 'ancestor', estimateFromMeasured: true, publish: setVirtualWindow }
    : null
  const body = structured
    // 不给 children：照 headless 的 tableStructure 铺，与 Web Components 只写 root 时元素生成的节点出自同一份
    ? renderDefaultStructure(api, {
        virtualItems: virtual ? (virtualWindow?.items ?? []) : undefined,
        virtualParts: virtual ? virtualParts : undefined,
        instances,
        renderCell,
        renderEmpty,
      })
    : null
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
      <div
        {...mergeReactProps(
          api.getRootProps() as Record<string, unknown>,
          rest as Record<string, unknown>,
          { ref: (el: HTMLDivElement | null) => { ctx.rootRef.current = el } },
        )}
      >
        {structured
          ? <StructureVirtualProvider value={virtualSlot}>{body}</StructureVirtualProvider>
          : renderSlot(children, {
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
              headerRows: api.headerRows,
              headerRowCount: api.headerRowCount,
              cellSpanOf: api.cellSpanOf,
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
      {/* 数据驱动模式的分页排在 root 之后：root 是 grid 系角色，分页只能是它的兄弟 */}
      {structured && renderStructure(tablePaginationStructure(api), {}, undefined, instances)}
      {/* 播报区由根组件自己渲，作者插不进 root 的兄弟位。它不能进 root：
          root 是 role=grid，塞活动区域进去是 aria-required-children（critical） */}
      <div {...api.getLiveRegionProps() as Record<string, unknown>}>{api.announcement}</div>
    </TableProvider>
  )
}

XhTableRoot.xhEvents = [
  'column-preference-change',
  'sort-change',
  'filter-value-change',
  'page-change',
  'selection-change',
  'expanded-value-change',
  'row-move',
  'action',
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
  // 渲出来了才登记：根的 aria-labelledby 只在这个节点真在场时才指过来
  const { registerCaption } = ctx
  useEffect(() => registerCaption(), [registerCaption])
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
  /** 多级表头写明这是第几行表头、多行表尾写明这是第几行表尾（1 起算），行里的列头与表尾格子据此定位；只有一行时省略。 */
  level?: number | string
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
function TableSectionRow({ section, value: _value, level: rawLevel, children, ...rest }: XhTableRowProps & { section: TableSection }): ReactNode {
  const ctx = useTableContext()
  const level = levelOf(rawLevel)
  const attrs = (section === 'header' ? ctx.api.getHeaderRowProps({ level }) : ctx.api.getFooterRowProps({ level })) as Record<string, unknown>
  return (
    <TableHeaderLevelProvider value={section === 'header' ? level : undefined}>
      <TableFooterLevelProvider value={section === 'footer' ? level : undefined}>
        <div {...mergeReactProps(attrs, rest as Record<string, unknown>)}>{children}</div>
      </TableFooterLevelProvider>
    </TableHeaderLevelProvider>
  )
}

/** 数据行：行身份供行内的操作按钮与单元格读取，焦点落点如实上报给状态机。 */
function TableDataRow({ value, level: _level, children, ...rest }: XhTableRowProps): ReactNode {
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
  /** 多级表头里这一格所在的表头行；省略时取所在表头行写明的层号。 */
  level?: number | string
}
export function XhTableColumnHeader({ value, level, children, ...rest }: XhTableColumnHeaderProps): ReactNode {
  const ctx = useTableContext()
  const rowLevel = useTableHeaderLevel()
  const column = useMemo(() => ({ value, level: levelOf(level) ?? rowLevel }), [value, level, rowLevel])
  return (
    <TableColumnProvider value={column}>
      <div {...mergeReactProps(ctx.api.getColumnHeaderProps(column) as Record<string, unknown>, rest as Record<string, unknown>)}>
        {children}
      </div>
    </TableColumnProvider>
  )
}

export interface XhTableColumnLabelProps extends ComponentPropsWithRef<'span'> {}
/**
 * 列名。列头里唯一可收窄的一格：列名太长时由它出省略号，排序钮、列宽把手与列拖拽把手都写在它之外、
 * 作为它的兄弟。不可排序、不可改宽的列也用它：裸写在 XhTableColumnHeader 里的文本是匿名 flex item，
 * 缩不下去，窄列上会把定尺的把手挤出列头盒。
 */
export function XhTableColumnLabel({ children, ...rest }: XhTableColumnLabelProps): ReactNode {
  const ctx = useTableContext()
  return <span {...mergeReactProps(ctx.api.getColumnLabelProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhTableCellProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  /** 列 id。 */
  value: string
  /** 跨列数，从 value 所在列向后计算。 */
  colspan?: number | string
}
export function XhTableCell({ value, colspan, children, ...rest }: XhTableCellProps): ReactNode {
  const ctx = useTableContext()
  // 行上下文可选：脚注单元格不属于任何数据行，改按所在表尾行的层号定位
  const rowCtx = useOptionalTableRowContext()
  const section = useTableSection()
  const footerLevel = useTableFooterLevel()
  const attrs = ctx.api.getCellProps({
    value,
    row: rowCtx?.value,
    footer: section === 'footer' && !rowCtx ? (footerLevel ?? 1) : undefined,
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
/**
 * 排序钮。独立的定尺图标钮，不包列名：列名留在 XhTableColumnHeader 里、钮写在列名之后，
 * 可及名取 translations.sort(列名)。只有 sortable 的列渲染它。
 */
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

/** 与 renderStructure 的部件表同一种形状。 */
type StructurePart = (props: never) => ReactNode

/** 组合部件那一块到之前先空着：筛选钮与分页晚一拍出现。 */
function TableExtraPending(): ReactNode {
  return null
}

/** 标准结构里组合进来的组件：列头的筛选菜单、表后的分页。那一块到之前是空位。 */
const TABLE_INSTANCES: Readonly<Record<string, StructurePart>> = {
  menu: TableExtraPending,
  pagination: TableExtraPending,
}

type TableExtrasModule = typeof import('./table-extras')

/**
 * 数据驱动模式的组合部件单独成块：列头给了 filterOptions 或开了分页才加载，手写结构的表格不为菜单与分页付体积。
 * 不用 React.lazy：理由同 Virtualizer 那一块（见 structure-slot），这里手动加载，到了再换上真组件
 */
function useTableInstances(needed: boolean): Readonly<Record<string, StructurePart>> {
  const [module, setModule] = useState<TableExtrasModule | null>(null)
  useEffect(() => {
    if (!needed || module)
      return
    let alive = true
    void import('./table-extras').then((loaded) => {
      if (alive)
        setModule(loaded)
    })
    return () => {
      alive = false
    }
  }, [needed, module])
  return module ? { menu: module.XhMenuRoot, pagination: module.XhPaginationRoot } : TABLE_INSTANCES
}

/** 标准结构的部件名 → 部件组件：结构交给 renderStructure 渲成这套部件。 */
const TABLE_PARTS: Readonly<Record<string, StructurePart>> = {
  'header': XhTableHeader,
  'body': XhTableBody,
  'row': XhTableRow,
  'column-header': XhTableColumnHeader,
  'column-label': XhTableColumnLabel,
  'cell': XhTableCell,
  'select-all-trigger': XhTableSelectAllTrigger,
  'row-select-trigger': XhTableRowSelectTrigger,
  'sort-trigger': XhTableSortTrigger,
  'column-resize-trigger': XhTableColumnResizeTrigger,
  'column-drag-trigger': XhTableColumnDragTrigger,
  'empty': XhTableEmpty,
  'loading': XhTableLoading,
}

interface TableStructureContent {
  virtualItems?: readonly StructureVirtualItem[]
  /** 开了虚拟化时委派给 virtualizer 的三个部件：那一块到之前是空位，到了换上真部件。 */
  virtualParts?: Readonly<Record<string, StructurePart>>
  instances: Readonly<Record<string, StructurePart>>
  renderCell?: (cell: TableCellSlotData) => ReactNode
  renderEmpty?: () => ReactNode
}

/**
 * 未给 children 时铺开的整套结构，作者只提供列与数据：照 headless 的 tableStructure 渲，
 * 与 Web Components 只写 root 时元素生成的节点出自同一份。格子与空态的内容由 renderCell / renderEmpty 接管。
 */
function renderDefaultStructure(api: TableApi, content: TableStructureContent): ReactNode[] {
  const { renderCell, renderEmpty } = content
  const nodes = tableStructure(api, {
    virtualItems: content.virtualItems,
    slotted: name => (name === 'cell' && renderCell != null) || (name === 'empty' && renderEmpty != null),
  })
  const parts = content.virtualParts ? { ...TABLE_PARTS, ...content.virtualParts } : TABLE_PARTS
  return renderStructure(nodes, parts, (node) => {
    switch (node.slot?.name) {
      case 'cell':
        return renderCell?.(node.data as TableCellSlotData)
      case 'empty':
        return renderEmpty?.()
      default:
        return undefined
    }
  }, content.instances)
}
