/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 table 相关实现。

import type { CascadeStrategy, ControlVariant, Direction, Size } from '@xihan-ui/core'
import type {
  StructureVirtualItem,
  TableApi,
  TableCellSlotData,
  TableColumnDef,
  TableColumnKind,
  TableColumnPreference,
  TableColumnProps,
  TableFilterValue,
  TableNavigation,
  TableRecord,
  TableRowDef,
  TableRowProps,
  TableSchema,
  TableSelection,
  TableSelectionMode,
  TableSortDescriptor,
} from '@xihan-ui/headless'
import type { Component, PropType, Ref, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import type { StructureVirtualSlot } from '../virtualizer/structure-slot'
import type { VirtualizerContext } from '../virtualizer/use-virtualizer'
import type { TableContext } from './use-table'
import { forwardCollectionVirtualizer, tablePaginationStructure, tableStructure, tableVisibleDataRowCount } from '@xihan-ui/headless'
import { computed, defineAsyncComponent, defineComponent, Fragment, h, mergeProps, onBeforeUnmount, onUnmounted, ref, shallowRef, watch } from 'vue'
import { withXhConfig } from '../../config/config'
import { renderStructure } from '../../runtime/structure'
import { provideStructureVirtual, STRUCTURE_VIRTUAL_PARTS } from '../virtualizer/structure-slot'
import {
  provideTable,
  provideTableColumn,
  provideTableFooterLevel,
  provideTableHeaderLevel,
  provideTableRow,
  provideTableSection,
  useOptionalTableColumnContext,
  useOptionalTableFooterLevel,
  useOptionalTableHeaderLevel,
  useOptionalTableRowContext,
  useTableColumnContext,
  useTableContext,
  useTableRowContext,
  useTableSection,
} from './context'
import { useTable } from './use-table'

type TableProps = TableSchema['props']

/** 层号：作者写数字，标准结构经属性给字符串，两种都收。 */
function levelOf(raw: number | string | undefined): number | undefined {
  return raw == null || raw === '' ? undefined : Number(raw)
}

/** 本行持有焦点时，value 变更重新报告焦点行，卸载时上报表体失焦 */
function reportRowFocus(ctx: TableContext, el: Ref<HTMLElement | null>, value: () => string): void {
  watch(value, (next, prev) => {
    if (next === prev)
      return
    const { service } = ctx
    if (service.getStatus() !== 'Started')
      return
    if (el.value && service.scope.getActiveElement() === el.value)
      service.send({ type: 'ROW.FOCUS', value: next })
  })
  onBeforeUnmount(() => {
    const { service } = ctx
    // 整张表一起卸载时根部件先停机，此刻送事件会在 dev 下抛
    if (service.getStatus() !== 'Started')
      return
    // 按「本行当下正持有焦点」判定，不按 value 比对
    if (el.value && service.scope.getActiveElement() === el.value)
      service.send({ type: 'TABLE.BLUR' })
  })
}

/** 默认插槽的载荷：可见行与排序、选中、展开三态，以及逐行查询与改写它们的句柄。 */
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

/** 标准结构开虚拟化时数据行的预估高度（px），与 md 档的行高相当；还没量到的行按已量到的平均高度估。 */
const TABLE_VIRTUAL_ESTIMATE = 40

// 运行时的根组件按擦掉行类型的宽松记录写；对外导出的 XhTableRoot 在它上面套一层按行类型收窄的类型，见文件后面
const XhTableRootImpl = /* @__PURE__ */ defineComponent({
  name: 'XhTableRoot',
  // 有机器侧兜底的 prop：普通类型省略 default，Boolean 显式保留 undefined，缺省值由 connect 与机器决定
  props: {
    columns: { type: Array as PropType<TableColumnDef[]> },
    rows: { type: Array as PropType<TableRowDef[]> },
    /**
     * 数据驱动模式：给了它，表格自己按排序链、筛选值与页码算出当前页的记录（rows 不再读）。
     * 不写默认插槽时按标准结构铺出表头、表体与空态，列 id 即字段名；格子内容用 cell 插槽接管。
     */
    data: { type: Array as PropType<TableRecord[]> },
    /** 记录的行 id：字段名或取值函数，缺省取 id 字段。 */
    rowKey: { type: [String, Function] as PropType<TableProps['rowKey']> },
    /** 筛选值（列 id → 勾选的值）：给定即受控。列给了 filterOptions 时列头铺一颗筛选钮。 */
    filterValue: { type: Object as PropType<TableFilterValue> },
    defaultFilterValue: { type: Object as PropType<TableFilterValue> },
    /** 数据驱动模式下分页：按 page 与 pageSize 切片，表后铺一组分页；筛选一变回到第 1 页。 */
    pagination: Boolean,
    defaultPage: { type: Number },
    /**
     * 标准结构的虚拟化开关：表体只铺滚到的那一屏行，滚的是表格根节点（吸顶表头、冻结列与行在同一个滚动面里）。
     * Virtualizer 那一块开了才加载；写默认插槽时不用它，照旧自己套 Virtualizer。
     */
    virtual: Boolean,
    /** 开了 virtual 时数据行的预估高度（px），缺省 40；还没量到的行按已量到的平均高度估。 */
    estimateSize: { type: Number },
    sort: { type: Array as PropType<TableSortDescriptor[]> },
    defaultSort: { type: Array as PropType<TableSortDescriptor[]> },
    selection: { type: [Array, String] as PropType<TableSelection> },
    defaultSelection: { type: [Array, String] as PropType<TableSelection> },
    selectionMode: { type: String as PropType<TableSelectionMode> },
    /** 单元格合并：逐格询问合并区的大小，与 antd 的 spanMethod 同一种写法。 */
    cellSpan: { type: Function as PropType<TableProps['cellSpan']> },
    /** 表尾单元格合并：与 cellSpan 同一种写法，逐格询问第几行表尾的哪一格。 */
    footerCellSpan: { type: Function as PropType<TableProps['footerCellSpan']> },
    /** 与 Virtualizer 的正式接线口：传 Virtualizer 的 collectionVirtualizer，count 等于可见数据行的条数。 */
    virtualizer: { type: Object as PropType<TableProps['virtualizer']> },
    /** 树形表在 multiple 下父子级联勾选，与 Tree 的 cascade 同义。 */
    cascade: { type: Boolean, default: undefined },
    checkedStrategy: { type: String as PropType<CascadeStrategy> },
    /** 需要哪几列前缀列（序号 / 多选 / 展开），按给定顺序插入最前面并占用列号。 */
    prefixColumns: { type: Array as PropType<TableColumnKind[]> },
    /** 当前页码与每页条数：只用于计算序号，不参与切片。 */
    /** 列偏好：给定即受控。持久化归使用者，库只负责把它算进生效列。 */
    columnPreference: { type: Object as PropType<TableColumnPreference> },
    defaultColumnPreference: { type: Object as PropType<TableColumnPreference> },
    page: { type: Number },
    pageSize: { type: Number },
    expandedValue: { type: Array as PropType<string[]> },
    defaultExpandedValue: { type: Array as PropType<string[]> },
    loading: Boolean,
    empty: { type: Boolean, default: undefined },
    stickyHeader: Boolean,
    striped: Boolean,
    variant: { type: String as PropType<ControlVariant> },
    ruled: Boolean,
    /** 表尾行数：行号空间的最后几行留给表尾，每一行表尾写明 level。 */
    footerRows: { type: Number },
    /** 表尾吸底，与 stickyHeader 对称。 */
    stickyFooter: Boolean,
    /** 行可以拖动换位。整行都是拖动源，不另设把手。 */
    rowReorderable: Boolean,
    /** 声明这是一棵树：一行 parentId 都没有时也报 treegrid、Alt + 左右键改层级、任何行都能接受「放进去」。 */
    tree: Boolean,
    /** 本次移动是否允许。收到的是折算后的落点（移动到哪个父节点下的第几位）。未提供时全部允许。 */
    allowRowDrop: { type: Function as PropType<TableProps['allowRowDrop']> },
    loop: { type: Boolean, default: undefined },
    /** 表体的键盘导航粒度：row（缺省）只落在行上；cell 时格子也是焦点落点（treegrid），Enter / F2 进格内编辑。 */
    navigation: { type: String as PropType<TableNavigation> },
    dir: { type: String as PropType<Direction> },
    size: { type: String as PropType<Size> },
    translations: { type: Object as PropType<TableProps['translations']> },
  },
  // *-change 携带 { value }，update:* 携带裸值以支持 v-model
  emits: {
    'column-preference-change': (_details: { value: TableColumnPreference }) => true,
    'update:columnPreference': (_value: TableColumnPreference) => true,
    'sort-change': (_details: PayloadOf<TableProps, 'onSortChange'>) => true,
    'update:sort': (_sort: PayloadOf<TableProps, 'onSortChange'>['value']) => true,
    'filter-value-change': (_details: PayloadOf<TableProps, 'onFilterValueChange'>) => true,
    'update:filterValue': (_value: PayloadOf<TableProps, 'onFilterValueChange'>['value']) => true,
    'page-change': (_details: PayloadOf<TableProps, 'onPageChange'>) => true,
    'update:page': (_page: PayloadOf<TableProps, 'onPageChange'>['value']) => true,
    'selection-change': (_details: PayloadOf<TableProps, 'onSelectionChange'>) => true,
    'update:selection': (_selection: PayloadOf<TableProps, 'onSelectionChange'>['value']) => true,
    'expanded-value-change': (_details: PayloadOf<TableProps, 'onExpandedValueChange'>) => true,
    'update:expandedValue': (_value: PayloadOf<TableProps, 'onExpandedValueChange'>['value']) => true,
    // 行换位是通知，行序与父子归属的真源在使用者的数据里，故没有配对的 update:*
    'row-move': (_details: PayloadOf<TableProps, 'onRowMove'>) => true,
    // 行主操作是通知：点在数据行上或焦点在行上按 Enter
    'action': (_details: PayloadOf<TableProps, 'onAction'>) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: TableRootSlotProps) => VNode[]
    /**
     * 工具条槽：搜索、筛选、密度与列设置等作用于整张表的控件写在这里。
     * 它渲染为 root 的兄弟排在表前：root 是 grid 系角色，子节点只能是 row 与 rowgroup。
     */
    toolbar?: (props: TableToolbarSlotProps) => VNode[]
    /** 标准结构里一格的内容：参数里有记录、字段值与本来要显示的文字，别的列交出 text 即可。 */
    cell?: (props: TableCellSlotData) => VNode[]
    /** 标准结构里空态占位的内容。 */
    empty?: () => VNode[]
  }>,
  // Fragment 根接不住自动透传：Vue 只在单个元素根上做这件事。
  // 作者写在 XhTableRoot 上的 class / aria-* / 监听器都要自己合到 root 那个 div 上
  inheritAttrs: false,
  setup(props, { slots, emit, attrs }) {
    const onColumnPreferenceChange: TableProps['onColumnPreferenceChange'] = (details) => {
      emit('column-preference-change', details)
      emit('update:columnPreference', details.value)
    }
    const onSortChange: TableProps['onSortChange'] = (details) => {
      emit('sort-change', details)
      emit('update:sort', details.value)
    }
    const onSelectionChange: TableProps['onSelectionChange'] = (details) => {
      emit('selection-change', details)
      emit('update:selection', details.value)
    }
    const onExpandedValueChange: TableProps['onExpandedValueChange'] = (details) => {
      emit('expanded-value-change', details)
      emit('update:expandedValue', details.value)
    }
    const onFilterValueChange: TableProps['onFilterValueChange'] = (details) => {
      emit('filter-value-change', details)
      emit('update:filterValue', details.value)
    }
    const onPageChange: TableProps['onPageChange'] = (details) => {
      emit('page-change', details)
      emit('update:page', details.value)
    }
    const onRowMove: TableProps['onRowMove'] = (details) => {
      emit('row-move', details)
    }
    const onAction: TableProps['onAction'] = (details) => {
      emit('action', details)
    }
    // 标准结构的虚拟化：Virtualizer 由异步加载进来的视口自己跑，它登记在这一格里
    const virtualView = props.virtual ? shallowRef<VirtualizerContext | null>(null) : undefined
    const forwarded = forwardCollectionVirtualizer(() => virtualView?.value?.api.value.collectionVirtualizer)
    const ctx = useTable(withXhConfig('table', props) as TableProps, {
      onSortChange,
      onFilterValueChange,
      onPageChange,
      onSelectionChange,
      onExpandedValueChange,
      onColumnPreferenceChange,
      onRowMove,
      onAction,
      // 交给机器的是转交桥：求表格的 props 时只看视口登记了没有，不碰 Virtualizer 的 api——
      // 条数要经表格的数据管线算，表格的 props 又要带上桥，直接取真桥会在同一轮求值里绕回自己
      ...(virtualView ? { virtualizer: () => (virtualView.value ? forwarded : undefined) } : {}),
    })
    provideTable(ctx)
    // 空位等视口来登记：条数经数据管线现算、不经表格的 api（见 StructureVirtualSlot.count），滚的是表格根节点
    const virtual: StructureVirtualSlot | undefined = virtualView
      ? { count: () => tableVisibleDataRowCount(ctx.service), estimateSize: () => props.estimateSize ?? TABLE_VIRTUAL_ESTIMATE, scrollContainer: 'ancestor', estimateFromMeasured: true, view: virtualView }
      : undefined
    if (virtual)
      provideStructureVirtual(virtual)
    return () => h(Fragment, [
      // 工具条排在表前且在 root 之外：root 是 role=grid，子节点只能是 row 与 rowgroup。
      // 载荷只给对整张表下手的那几样，逐行的东西（visibleRows / rowNumber / 选中查询）不进来
      slots.toolbar?.({
        columns: ctx.api.value.columns,
        columnSettings: ctx.api.value.columnSettings,
        columnPreference: ctx.api.value.columnPreference,
        setColumnHidden: ctx.api.value.setColumnHidden,
        setColumnSticky: ctx.api.value.setColumnSticky,
        setColumnWidth: ctx.api.value.setColumnWidth,
        moveColumn: ctx.api.value.moveColumn,
        setColumnPreference: ctx.api.value.setColumnPreference,
        sort: ctx.api.value.sort,
        toggleSort: ctx.api.value.toggleSort,
        selection: ctx.api.value.selection,
        selectionState: ctx.api.value.selectionState,
        empty: ctx.api.value.empty,
        loading: ctx.api.value.loading,
      }) ?? null,
      h('div', mergeProps(ctx.api.value.getRootProps() as Record<string, unknown>, attrs, {
        ref: (el: unknown) => { ctx.rootRef.value = el as HTMLElement | null },
      }), !slots.default
        // 不写默认插槽：照 headless 的 tableStructure 铺，与 Web Components 只写 root 时元素生成的节点出自同一份
        ? renderDefaultStructure(ctx.api.value, virtual ? (virtual.view.value?.api.value.virtualItems ?? []) : undefined, slots)
        : slots.default({
            columns: ctx.api.value.columns,
            columnPreference: ctx.api.value.columnPreference,
            columnSettings: ctx.api.value.columnSettings,
            setColumnHidden: ctx.api.value.setColumnHidden,
            setColumnSticky: ctx.api.value.setColumnSticky,
            moveColumn: ctx.api.value.moveColumn,
            setColumnWidth: ctx.api.value.setColumnWidth,
            setColumnPreference: ctx.api.value.setColumnPreference,
            rowNumber: ctx.api.value.rowNumber,
            visibleRows: ctx.api.value.visibleRows,
            headerRows: ctx.api.value.headerRows,
            headerRowCount: ctx.api.value.headerRowCount,
            cellSpanOf: ctx.api.value.cellSpanOf,
            sort: ctx.api.value.sort,
            selection: ctx.api.value.selection,
            selectionState: ctx.api.value.selectionState,
            expandedValue: ctx.api.value.expandedValue,
            focusedRow: ctx.api.value.focusedRow,
            empty: ctx.api.value.empty,
            loading: ctx.api.value.loading,
            isSelected: ctx.api.value.isSelected,
            isExpanded: ctx.api.value.isExpanded,
            sortDirection: ctx.api.value.sortDirection,
            sortPriority: ctx.api.value.sortPriority,
            toggleSort: ctx.api.value.toggleSort,
            selectRow: ctx.api.value.selectRow,
            toggleSelectAll: ctx.api.value.toggleSelectAll,
            toggleExpandRow: ctx.api.value.toggleExpandRow,
            rowReorderDisabledReason: ctx.api.value.rowReorderDisabledReason,
          })),
      // 数据驱动模式的分页排在 root 之后：root 是 grid 系角色，分页只能是它的兄弟
      ...(slots.default ? [] : renderPagination(ctx.api.value)),
      // 播报区由根组件自己渲，作者插不进 root 的兄弟位。它不能进 root：
      // root 是 role=grid，塞活动区域进去是 aria-required-children（critical）
      h(
        'div',
        ctx.api.value.getLiveRegionProps() as Record<string, unknown>,
        ctx.service.context.get('announcement'),
      ),
    ])
  },
})

/** 根组件里随行类型收窄的那几项 prop：列定义、记录与行 id。 */
export interface XhTableRootRowProps<TRow extends object> {
  /** 列定义。行类型只从 data 推断，列定义照它检查，不反过来参与推断。 */
  columns?: NoInfer<TableColumnDef<TRow>>[]
  data?: readonly TRow[]
  rowKey?: NoInfer<TableSchema<TRow>['props']['rowKey']>
}

type XhTableRootInstance = InstanceType<typeof XhTableRootImpl>

/**
 * 按行类型收窄的根组件类型。模板里由 Volar 照 data 的元素类型推断 TRow：columns 的 id / field 写错即报错，
 * format、compare、filter 与 cell 插槽的参数跟着收窄。`h()` 推断不了泛型，那里按宽松的记录检查。
 */
export type XhTableRootComponent = Omit<typeof XhTableRootImpl, never> & {
  new<TRow extends object = TableRecord>(props?: Omit<XhTableRootInstance['$props'], keyof XhTableRootRowProps<TRow>> & XhTableRootRowProps<TRow>): Omit<XhTableRootInstance, '$props' | '$slots'> & {
    $props: Omit<XhTableRootInstance['$props'], keyof XhTableRootRowProps<TRow>> & XhTableRootRowProps<TRow>
    $slots: Omit<XhTableRootInstance['$slots'], 'cell'> & {
      cell?: (props: TableCellSlotData<TRow>) => VNode[]
    }
  }
}

export const XhTableRoot = XhTableRootImpl as unknown as XhTableRootComponent

/**
 * 工具条：搜索、筛选、密度与列设置等作用于整张表的控件放在这里。
 * 写在 XhTableRoot 的 toolbar 插槽中：它渲染为 root 的兄弟，不进入 role=grid 的子节点。
 * 不带 role：需要方向键 roving 时在其中放置一个 XhToolbarRoot。
 */
export const XhTableToolbar = /* @__PURE__ */ defineComponent({
  name: 'XhTableToolbar',
  setup(_, { slots }) {
    const ctx = useTableContext()
    return () => h('div', ctx.api.value.getToolbarProps() as Record<string, unknown>, slots.default?.())
  },
})

/** 列设置区：一列一行，渲染内容按 root 插槽载荷中的 columnSettings 决定。 */
export const XhTableColumnList = /* @__PURE__ */ defineComponent({
  name: 'XhTableColumnList',
  setup(_, { slots }) {
    const ctx = useTableContext()
    return () => h('div', ctx.api.value.getColumnListProps() as Record<string, unknown>, slots.default?.())
  },
})

/**
 * 一列的显隐控件（复选形态，勾选表示该列显示）。
 * 列身份优先取自己的 value；未提供时跟随所在的列标题（表头中的路径）。
 */
export const XhTableColumnVisibilityTrigger = /* @__PURE__ */ defineComponent({
  name: 'XhTableColumnVisibilityTrigger',
  props: {
    /** 列 id。写在列设置区中时必须提供；写在列标题中时可省略，跟随该列。 */
    value: { type: String },
  },
  setup(props, { slots }) {
    const ctx = useTableContext()
    const inherited = useOptionalTableColumnContext()
    const column = computed<TableColumnProps>(() => ({
      value: props.value ?? inherited?.column.value.value ?? '',
    }))
    return () => h(
      'span',
      ctx.api.value.getColumnVisibilityTriggerProps(column.value) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

export const XhTableCaption = /* @__PURE__ */ defineComponent({
  name: 'XhTableCaption',
  setup(_, { slots }) {
    const ctx = useTableContext()
    // 渲出来就登记，在 setup 里同步做；根是 caption 的祖先，服务端直出时根先渲染，挂载后补上引用
    ctx.captionCount.value++
    onUnmounted(() => {
      ctx.captionCount.value--
    })
    return () => h('div', ctx.api.value.getCaptionProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTableHeader = /* @__PURE__ */ defineComponent({
  name: 'XhTableHeader',
  setup(_, { slots }) {
    const ctx = useTableContext()
    provideTableSection('header')
    return () => h('div', ctx.api.value.getHeaderProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTableBody = /* @__PURE__ */ defineComponent({
  name: 'XhTableBody',
  setup(_, { slots }) {
    const ctx = useTableContext()
    provideTableSection('body')
    // 键盘与 roving 的兜底 Tab 位落在表体上，不在 root 上
    return () => h('div', ctx.api.value.getBodyProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTableFooter = /* @__PURE__ */ defineComponent({
  name: 'XhTableFooter',
  setup(_, { slots }) {
    const ctx = useTableContext()
    provideTableSection('footer')
    return () => h('div', ctx.api.value.getFooterProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTableRow = /* @__PURE__ */ defineComponent({
  name: 'XhTableRow',
  props: {
    /** 行 id：数据行必须提供，表头行与脚注行省略。 */
    value: { type: String },
    /** 多级表头写明这是第几行表头、多行表尾写明这是第几行表尾（1 起算）；只有一行时省略。 */
    level: { type: [Number, String] as PropType<number | string> },
  },
  setup(props, { slots }) {
    const ctx = useTableContext()
    const section = useTableSection()
    if (section !== 'body') {
      if (section === 'header')
        provideTableHeaderLevel(computed(() => levelOf(props.level)))
      else
        provideTableFooterLevel(computed(() => levelOf(props.level)))
      return () => h(
        'div',
        (section === 'header'
          ? ctx.api.value.getHeaderRowProps({ level: levelOf(props.level) })
          : ctx.api.value.getFooterRowProps({ level: levelOf(props.level) })) as Record<string, unknown>,
        slots.default?.(),
      )
    }
    const row = computed<TableRowProps>(() => ({ value: props.value ?? '' }))
    // 供行内的把手与单元格读取行 id
    provideTableRow({ row })
    const el = ref<HTMLElement | null>(null)
    reportRowFocus(ctx, el, () => row.value.value)
    return () => h(
      'div',
      { ...ctx.api.value.getRowProps(row.value) as Record<string, unknown>, ref: el },
      slots.default?.(),
    )
  },
})

export const XhTableColumnHeader = /* @__PURE__ */ defineComponent({
  name: 'XhTableColumnHeader',
  props: {
    value: { type: String, required: true },
    /** 多级表头里这一格所在的表头行；省略时取所在表头行写明的层号。 */
    level: { type: [Number, String] as PropType<number | string> },
  },
  setup(props, { slots }) {
    const ctx = useTableContext()
    const headerLevel = useOptionalTableHeaderLevel()
    const column = computed<TableColumnProps>(() => ({ value: props.value, level: levelOf(props.level) ?? headerLevel?.value }))
    provideTableColumn({ column })
    return () => h(
      'div',
      ctx.api.value.getColumnHeaderProps(column.value) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

/**
 * 列名。列头里唯一可收窄的一格：列名太长时由它出省略号，排序钮、列宽把手与列拖拽把手都写在它之外、
 * 作为它的兄弟。不可排序、不可改宽的列也用它：裸写在 XhTableColumnHeader 里的文本是匿名 flex item，
 * 缩不下去，窄列上会把定尺的把手挤出列头盒。
 */
export const XhTableColumnLabel = /* @__PURE__ */ defineComponent({
  name: 'XhTableColumnLabel',
  setup(_, { slots }) {
    const ctx = useTableContext()
    return () => h('span', ctx.api.value.getColumnLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTableCell = /* @__PURE__ */ defineComponent({
  name: 'XhTableCell',
  props: {
    /** 列 id。 */
    value: { type: String, required: true },
    /** 跨列数，从 value 所在列向后计算。 */
    colspan: { type: [String, Number] as PropType<string | number> },
  },
  setup(props, { slots }) {
    const ctx = useTableContext()
    // 行上下文可选：脚注单元格不属于任何数据行，改按所在表尾行的层号定位
    const rowCtx = useOptionalTableRowContext()
    const section = useTableSection()
    const footerLevel = useOptionalTableFooterLevel()
    return () => h(
      'div',
      ctx.api.value.getCellProps({
        value: props.value,
        row: rowCtx?.row.value.value,
        footer: section === 'footer' && !rowCtx ? (footerLevel?.value ?? 1) : undefined,
        colSpan: props.colspan == null ? undefined : Number(props.colspan),
      }) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

export const XhTableSelectAllTrigger = /* @__PURE__ */ defineComponent({
  name: 'XhTableSelectAllTrigger',
  setup(_, { slots }) {
    const ctx = useTableContext()
    return () => h(
      'span',
      ctx.api.value.getSelectAllTriggerProps() as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

export const XhTableRowSelectTrigger = /* @__PURE__ */ defineComponent({
  name: 'XhTableRowSelectTrigger',
  setup(_, { slots }) {
    const ctx = useTableContext()
    const { row } = useTableRowContext()
    return () => h(
      'span',
      ctx.api.value.getRowSelectTriggerProps(row.value) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

/**
 * 排序钮。独立的定尺图标钮，不包列名：列名留在 XhTableColumnHeader 里、钮写在列名之后，
 * 可及名取 translations.sort(列名)。只有 sortable 的列渲染它。
 */
export const XhTableSortTrigger = /* @__PURE__ */ defineComponent({
  name: 'XhTableSortTrigger',
  setup(_, { slots }) {
    const ctx = useTableContext()
    const { column } = useTableColumnContext()
    return () => h(
      'span',
      ctx.api.value.getSortTriggerProps(column.value) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

/** 列宽把手。放在表头格中，只有 resizable 的列渲染它。 */
export const XhTableColumnResizeTrigger = /* @__PURE__ */ defineComponent({
  name: 'XhTableColumnResizeTrigger',
  setup(_, { slots }) {
    const ctx = useTableContext()
    const { column } = useTableColumnContext()
    return () => h(
      'span',
      ctx.api.value.getColumnResizeTriggerProps(column.value) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

/** 列拖拽把手。放在表头格中，只有可拖动的列渲染它。 */
export const XhTableColumnDragTrigger = /* @__PURE__ */ defineComponent({
  name: 'XhTableColumnDragTrigger',
  setup(_, { slots }) {
    const ctx = useTableContext()
    const { column } = useTableColumnContext()
    return () => h(
      'span',
      ctx.api.value.getColumnDragTriggerProps(column.value) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

/**
 * 行拖拽把手。放在数据行中，自带 touch-action: none，按下即拖动，不等待激活距离。
 * 对读屏隐藏、也不占 Tab 位；键盘换位由表体上的 Alt + 上下键承担，
 * 树形表下另有 Alt + 左右键改变缩进层级。
 * 整行拖动的路径照常可用，把手是叠加的第二个入口。
 */
export const XhTableRowDragTrigger = /* @__PURE__ */ defineComponent({
  name: 'XhTableRowDragTrigger',
  setup(_, { slots }) {
    const ctx = useTableContext()
    const { row } = useTableRowContext()
    return () => h(
      'span',
      ctx.api.value.getRowDragTriggerProps(row.value) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

export const XhTableExpandTrigger = /* @__PURE__ */ defineComponent({
  name: 'XhTableExpandTrigger',
  setup(_, { slots }) {
    const ctx = useTableContext()
    const { row } = useTableRowContext()
    return () => h(
      'span',
      ctx.api.value.getExpandTriggerProps(row.value) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

export const XhTableExpandedRow = /* @__PURE__ */ defineComponent({
  name: 'XhTableExpandedRow',
  props: {
    /** 所属数据行的 id。 */
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useTableContext()
    const row = computed<TableRowProps>(() => ({ value: props.value }))
    // 不 provide 行上下文；收起只加 hidden，不卸载内部节点
    return () => h(
      'div',
      ctx.api.value.getExpandedRowProps(row.value) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

export const XhTableEmpty = /* @__PURE__ */ defineComponent({
  name: 'XhTableEmpty',
  setup(_, { slots }) {
    const ctx = useTableContext()
    return () => h('div', ctx.api.value.getEmptyProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTableLoading = /* @__PURE__ */ defineComponent({
  name: 'XhTableLoading',
  setup(_, { slots }) {
    const ctx = useTableContext()
    return () => h('div', ctx.api.value.getLoadingProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTableLoadMoreTrigger = /* @__PURE__ */ defineComponent({
  name: 'XhTableLoadMoreTrigger',
  setup(_, { slots }) {
    const ctx = useTableContext()
    // 取下一页的入口：摆在表尾，点了做什么归作者
    return () => h('button', ctx.api.value.getLoadMoreTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

/** 数据驱动模式的组合部件单独成块：列头给了 filterOptions 或开了分页才加载，手写结构的表格不为菜单与分页付体积。 */
const loadExtras = (): Promise<typeof import('./table-extras')> => import('./table-extras')

/** 标准结构里组合进来的组件：列头的筛选菜单、表后的分页。 */
const TABLE_INSTANCES: Readonly<Record<string, Component>> = {
  menu: /* @__PURE__ */ defineAsyncComponent(() => loadExtras().then(m => m.XhMenuRoot)),
  pagination: /* @__PURE__ */ defineAsyncComponent(() => loadExtras().then(m => m.XhPaginationRoot)),
}

/** 标准结构的部件名 → 部件组件：结构交给 renderStructure 渲成这套部件。 */
const TABLE_PARTS: Readonly<Record<string, Component>> = {
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
  ...STRUCTURE_VIRTUAL_PARTS,
}

/** 数据驱动模式开了分页时 root 之后的那一组分页，照 headless 的 tablePaginationStructure 渲。 */
function renderPagination(api: TableApi): VNode[] {
  return renderStructure(tablePaginationStructure(api), {}, undefined, TABLE_INSTANCES)
}

interface TableStructureSlots {
  cell?: (props: TableCellSlotData) => VNode[]
  empty?: () => VNode[]
}

/**
 * 未写默认插槽时铺开的整套结构，作者只提供列与数据：照 headless 的 tableStructure 渲，
 * 与 Web Components 只写 root 时元素生成的节点出自同一份。格子与空态的内容由 cell / empty 插槽接管。
 */
function renderDefaultStructure(api: TableApi, virtualItems: readonly StructureVirtualItem[] | undefined, slots: TableStructureSlots): VNode[] {
  const nodes = tableStructure(api, { virtualItems, slotted: name => (name === 'cell' || name === 'empty') && slots[name] != null })
  return renderStructure(nodes, TABLE_PARTS, (node) => {
    switch (node.slot?.name) {
      case 'cell':
        return slots.cell?.(node.data as TableCellSlotData)
      case 'empty':
        return slots.empty?.()
      default:
        return undefined
    }
  }, TABLE_INSTANCES)
}
