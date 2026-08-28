import type {
  TableApi,
  TableColumnDef,
  TableColumnKind,
  TableColumnPreference,
  TableColumnProps,
  TableRowDef,
  TableRowProps,
  TableSchema,
  TableSelection,
  TableSelectionMode,
  TableSortDescriptor,
} from '@xihan-ui/headless'
import type { Direction, Size } from '@xihan-ui/kernel'
import type { PropType, Ref, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import type { TableContext } from './use-table'
import { computed, defineComponent, Fragment, h, onBeforeUnmount, ref, watch } from 'vue'
import {
  provideTable,
  provideTableColumn,
  provideTableRow,
  provideTableSection,
  useOptionalTableRowContext,
  useTableColumnContext,
  useTableContext,
  useTableRowContext,
  useTableSection,
} from './context'
import { useTable } from './use-table'

type TableProps = TableSchema['props']

/** 本行持有焦点时，value 变更重报焦点行，卸载时上报表体失焦 */
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

export const XhTableRoot = defineComponent({
  name: 'XhTableRoot',
  // 有机器侧兜底的 prop 一律 default: undefined，缺省值由 connect 与机器决定
  props: {
    columns: { type: Array as PropType<TableColumnDef[]>, default: undefined },
    rows: { type: Array as PropType<TableRowDef[]>, default: undefined },
    sort: { type: Array as PropType<TableSortDescriptor[]>, default: undefined },
    defaultSort: { type: Array as PropType<TableSortDescriptor[]>, default: undefined },
    selection: { type: [Array, String] as PropType<TableSelection>, default: undefined },
    defaultSelection: { type: [Array, String] as PropType<TableSelection>, default: undefined },
    selectionMode: { type: String as PropType<TableSelectionMode>, default: undefined },
    /** 要哪几列前缀列（序号 / 多选 / 展开），按给定顺序插在最前面并占住列号。 */
    prefixColumns: { type: Array as PropType<TableColumnKind[]>, default: undefined },
    /** 当前页码与每页条数：只用来算序号，不参与切片。 */
    /** 列偏好：给定即受控。持久化归使用者，库只负责把它算进生效列。 */
    columnPreference: { type: Object as PropType<TableColumnPreference>, default: undefined },
    defaultColumnPreference: { type: Object as PropType<TableColumnPreference>, default: undefined },
    page: { type: Number, default: undefined },
    pageSize: { type: Number, default: undefined },
    expanded: { type: Array as PropType<string[]>, default: undefined },
    defaultExpanded: { type: Array as PropType<string[]>, default: undefined },
    loading: Boolean,
    empty: { type: Boolean, default: undefined },
    stickyHeader: Boolean,
    striped: Boolean,
    borderless: Boolean,
    ruled: Boolean,
    footer: Boolean,
    /** 行可以拖着换位。整行都是拖动源，不另出把手。 */
    rowReorderable: Boolean,
    loop: { type: Boolean, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
  },
  // *-change 携带 { value }，update:* 携带裸值以支持 v-model
  emits: {
    'column-preference-change': (_details: { value: TableColumnPreference }) => true,
    'update:columnPreference': (_value: TableColumnPreference) => true,
    'sort-change': (_details: PayloadOf<TableProps, 'onSortChange'>) => true,
    'update:sort': (_sort: PayloadOf<TableProps, 'onSortChange'>['value']) => true,
    'selection-change': (_details: PayloadOf<TableProps, 'onSelectionChange'>) => true,
    'update:selection': (_selection: PayloadOf<TableProps, 'onSelectionChange'>['value']) => true,
    'expanded-change': (_details: PayloadOf<TableProps, 'onExpandedChange'>) => true,
    'update:expanded': (_expanded: PayloadOf<TableProps, 'onExpandedChange'>['value']) => true,
    // 行换位是通知，行序的真源在使用者的数据里，故没有配对的 update:*
    'row-move': (_details: PayloadOf<TableProps, 'onRowMove'>) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: TableRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
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
    const onExpandedChange: TableProps['onExpandedChange'] = (details) => {
      emit('expanded-change', details)
      emit('update:expanded', details.value)
    }
    const onRowMove: TableProps['onRowMove'] = (details) => {
      emit('row-move', details)
    }
    const ctx = useTable(props as TableProps, onSortChange, onSelectionChange, onExpandedChange, onColumnPreferenceChange, onRowMove)
    provideTable(ctx)
    // 播报区由根组件自己渲，作者插不进 root 的兄弟位。它不能进 root：
    // root 是 role=grid，塞活动区域进去是 aria-required-children（critical）
    return () => h(Fragment, [
      h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
        columns: ctx.api.value.columns,
        columnPreference: ctx.api.value.columnPreference,
        setColumnHidden: ctx.api.value.setColumnHidden,
        moveColumn: ctx.api.value.moveColumn,
        setColumnWidth: ctx.api.value.setColumnWidth,
        setColumnPreference: ctx.api.value.setColumnPreference,
        rowNumber: ctx.api.value.rowNumber,
        visibleRows: ctx.api.value.visibleRows,
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
      h(
        'div',
        ctx.api.value.getLiveRegionProps() as Record<string, unknown>,
        ctx.service.context.get('announcement'),
      ),
    ])
  },
})

export const XhTableCaption = defineComponent({
  name: 'XhTableCaption',
  setup(_, { slots }) {
    const ctx = useTableContext()
    return () => h('div', ctx.api.value.getCaptionProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTableHeader = defineComponent({
  name: 'XhTableHeader',
  setup(_, { slots }) {
    const ctx = useTableContext()
    provideTableSection('header')
    return () => h('div', ctx.api.value.getHeaderProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTableBody = defineComponent({
  name: 'XhTableBody',
  setup(_, { slots }) {
    const ctx = useTableContext()
    provideTableSection('body')
    // 键盘与 roving 的兜底 Tab 位落在表体上，不在 root 上
    return () => h('div', ctx.api.value.getBodyProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTableFooter = defineComponent({
  name: 'XhTableFooter',
  setup(_, { slots }) {
    const ctx = useTableContext()
    provideTableSection('footer')
    return () => h('div', ctx.api.value.getFooterProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTableRow = defineComponent({
  name: 'XhTableRow',
  props: {
    /** 行 id：数据行必给，表头行与脚注行省略。 */
    value: { type: String, default: undefined },
  },
  setup(props, { slots }) {
    const ctx = useTableContext()
    const section = useTableSection()
    if (section !== 'body') {
      return () => h(
        'div',
        (section === 'header'
          ? ctx.api.value.getHeaderRowProps()
          : ctx.api.value.getFooterRowProps()) as Record<string, unknown>,
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

export const XhTableColumnHeader = defineComponent({
  name: 'XhTableColumnHeader',
  props: {
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useTableContext()
    const column = computed<TableColumnProps>(() => ({ value: props.value }))
    provideTableColumn({ column })
    return () => h(
      'div',
      ctx.api.value.getColumnHeaderProps(column.value) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

export const XhTableCell = defineComponent({
  name: 'XhTableCell',
  props: {
    /** 列 id。 */
    value: { type: String, required: true },
    /** 跨列数，从 value 那一列往后算。 */
    colspan: { type: [String, Number] as PropType<string | number>, default: undefined },
  },
  setup(props, { slots }) {
    const ctx = useTableContext()
    // 行上下文可选：脚注单元格不属于任何数据行
    const rowCtx = useOptionalTableRowContext()
    return () => h(
      'div',
      ctx.api.value.getCellProps({
        value: props.value,
        row: rowCtx?.row.value.value,
        colSpan: props.colspan == null ? undefined : Number(props.colspan),
      }) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

export const XhTableSelectAllTrigger = defineComponent({
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

export const XhTableRowSelectTrigger = defineComponent({
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

export const XhTableSortTrigger = defineComponent({
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

/** 列宽把手。放在表头格里，只有 resizable 的列渲它。 */
export const XhTableColumnResizeTrigger = defineComponent({
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

/** 列拖拽把手。放在表头格里，只有可拖的列渲它。 */
export const XhTableColumnDragTrigger = defineComponent({
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
 * 行拖拽把手。放在数据行里，自带 touch-action: none，按下即拖，不等激活距离。
 * 对读屏隐藏、也不占 Tab 位；键盘换位由表体上的 Alt + 上下键承担。
 * 整行起手那一路照旧可用，把手是叠加的第二个入口。
 */
export const XhTableRowDragTrigger = defineComponent({
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

export const XhTableExpandTrigger = defineComponent({
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

export const XhTableExpandedRow = defineComponent({
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

export const XhTableEmpty = defineComponent({
  name: 'XhTableEmpty',
  setup(_, { slots }) {
    const ctx = useTableContext()
    return () => h('div', ctx.api.value.getEmptyProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTableLoadingState = defineComponent({
  name: 'XhTableLoadingState',
  setup(_, { slots }) {
    const ctx = useTableContext()
    return () => h('div', ctx.api.value.getLoadingStateProps() as Record<string, unknown>, slots.default?.())
  },
})
