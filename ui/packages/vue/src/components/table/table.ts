import type { Direction } from '@xihan-ui/core'
import type {
  TableColumnDef,
  TableColumnProps,
  TableRowDef,
  TableRowProps,
  TableSchema,
  TableSelection,
  TableSelectionMode,
  TableSortDescriptor,
} from '@xihan-ui/headless'
import type { PropType, Ref } from 'vue'
import type { TableContext } from './use-table'
import { computed, defineComponent, h, onBeforeUnmount, ref, watch } from 'vue'
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

/**
 * 承载焦点的行被移出 DOM 时浏览器不派 focusout，焦点锚点会停在一个已消失的值上：
 * body 判自己"焦点在表体里"退出 Tab 序列，又没有行认领得了这个锚点，
 * 整张表零个 Tab 停靠点，键盘用户再也进不来。卸载前把焦点离场如实上报，
 * 且只有自己正持有焦点时才报——否则删掉任一无关行都会把光标一并清掉。
 *
 * v-for 不带 key 时 Vue 会就地复用节点：被删的是"最后一个组件实例"，
 * 而持有焦点的那个 DOM 节点还在、value 却被改成了别的行。此时锚点仍指着旧值、
 * 已无人认领，键盘就此失灵。自己正持有焦点且 value 变了，就按新值重报一次。
 */
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
    // 整张表一起卸载时根部件先停机，此刻无焦点可言（送事件还会在 dev 下抛）
    if (service.getStatus() !== 'Started')
      return
    // 判据是「本行当下正持有焦点」，不是「值对得上」：v-for 就地复用时
    // 被卸载的是末位实例、它的 value 可能恰好等于刚纠正过的锚点，按值判会把好端端的锚点清掉
    if (el.value && service.scope.getActiveElement() === el.value)
      service.send({ type: 'TABLE.BLUR' })
  })
}

export const XhTableRoot = defineComponent({
  name: 'XhTableRoot',
  // 缺省值的唯一事实源在 connect 与机器 —— 凡是它们有兜底的一律 default: undefined
  // （empty 与 loop 尤其：裸 Boolean 声明会把缺省压成 false，
  // 「按行数推导空态」与「将来想开回绕」就都表达不了）
  props: {
    columns: { type: Array as PropType<TableColumnDef[]>, default: undefined },
    rows: { type: Array as PropType<TableRowDef[]>, default: undefined },
    sort: { type: Array as PropType<TableSortDescriptor[]>, default: undefined },
    defaultSort: { type: Array as PropType<TableSortDescriptor[]>, default: undefined },
    selection: { type: [Array, String] as PropType<TableSelection>, default: undefined },
    defaultSelection: { type: [Array, String] as PropType<TableSelection>, default: undefined },
    selectionMode: { type: String as PropType<TableSelectionMode>, default: undefined },
    expanded: { type: Array as PropType<string[]>, default: undefined },
    defaultExpanded: { type: Array as PropType<string[]>, default: undefined },
    loading: Boolean,
    empty: { type: Boolean, default: undefined },
    stickyHeader: Boolean,
    footer: Boolean,
    loop: { type: Boolean, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
  },
  // sort-change / selection-change / expanded-change 携带 { value }；
  // update:* 携带裸值，支持 v-model
  emits: [
    'sort-change',
    'update:sort',
    'selection-change',
    'update:selection',
    'expanded-change',
    'update:expanded',
  ],
  setup(props, { slots, emit }) {
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
    const ctx = useTable(props as TableProps, onSortChange, onSelectionChange, onExpandedChange)
    provideTable(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
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
    }))
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
    // 键盘与 roving 的兜底 Tab 位都在这儿收口，不在 root 上：
    // root 若占着兜底位，Tab 一进来就被转投到某一行，表头里的排序把手全被跳过
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
    /** 数据行必给；表头行与脚注行没有行身份，省略即可。 */
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
    // 行内的把手与单元格认这一份声明，作者不必在每个格子上再抄一遍行 id
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
    /** 列 id：列号由它算出。 */
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useTableContext()
    // 行是可选的：脚注里的格子不属于任何数据行，也就没有选中/禁用可言
    const rowCtx = useOptionalTableRowContext()
    return () => h(
      'div',
      ctx.api.value.getCellProps({
        value: props.value,
        row: rowCtx?.row.value.value,
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
    /** 它所属数据行的 id：两者共用同一个身份。 */
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useTableContext()
    const row = computed<TableRowProps>(() => ({ value: props.value }))
    // 刻意不 provide 行上下文：详情里的单元格不属于那条数据行，跟着它画选中底色
    // 只会让整段详情跟着高亮；WC 侧靠祖先链现查也查不到 row 部件，两边就此对齐
    // 收起只加 hidden，不卸载作者节点：详情里的业务 DOM 与滚动位置都得留着
    return () => h(
      'div',
      ctx.api.value.getExpandedRowProps(row.value) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

export const XhTableEmptyState = defineComponent({
  name: 'XhTableEmptyState',
  setup(_, { slots }) {
    const ctx = useTableContext()
    return () => h('div', ctx.api.value.getEmptyStateProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTableLoadingState = defineComponent({
  name: 'XhTableLoadingState',
  setup(_, { slots }) {
    const ctx = useTableContext()
    return () => h('div', ctx.api.value.getLoadingStateProps() as Record<string, unknown>, slots.default?.())
  },
})
