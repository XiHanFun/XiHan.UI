import type {
  HeatmapApi,
  HeatmapAxisInput,
  HeatmapCellDetails,
  HeatmapCellMeta,
  HeatmapLegendBound,
  HeatmapMatrixCellMeta,
  HeatmapMatrixGrid,
  HeatmapMonthGrid,
  HeatmapPalette,
  HeatmapRowProps,
  HeatmapSchema,
  HeatmapTranslations,
  HeatmapValue,
  HeatmapVariant,
} from '@xihan-ui/headless'
import type { Direction, Size, Tone } from '@xihan-ui/kernel'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { heatmapMatrixKey } from '@xihan-ui/headless'
import { computed, defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import {
  provideHeatmap,
  provideHeatmapMonth,
  provideHeatmapRow,
  useHeatmapContext,
  useHeatmapMonth,
  useHeatmapRow,
} from './context'
import { useHeatmap } from './use-heatmap'

type HeatmapProps = HeatmapSchema['props']

/**
 * 默认插槽的载荷：三张网格模型与锚点、当前详情，外加挪锚点的动作。
 * 三形态通用的那一组（`focusedCell` / `anchorCell` / `setFocusedCell`）也在里面：
 * 矩阵形态下带 Date 的那一组恒为 null，自己铺矩阵时只有这一组读得出、挪得动锚点。
 */
export type HeatmapRootSlotProps = Pick<
  HeatmapApi,
  | 'variant'
  | 'grid'
  | 'monthGrid'
  | 'matrixGrid'
  | 'focusedCell'
  | 'focusedDate'
  | 'anchorCell'
  | 'anchorDate'
  | 'activeCell'
  | 'detailOpen'
  | 'cellAt'
  | 'setFocusedCell'
  | 'setFocusedDate'
>

/**
 * `cell` 插槽的载荷：日期形态给日历那一格，矩阵形态给矩阵那一格。
 * 两者的坐标不同，用 `'date' in cell` 分辨。
 */
export type HeatmapCellSlotProps = HeatmapCellMeta | HeatmapMatrixCellMeta

export const XhHeatmapRoot = defineComponent({
  name: 'XhHeatmapRoot',
  // 全部 default: undefined，缺省值由机器与 connect 决定
  props: {
    variant: { type: String as PropType<HeatmapVariant>, default: undefined },
    value: { type: Array as PropType<HeatmapValue[]>, default: undefined },
    rows: { type: Array as PropType<HeatmapAxisInput[]>, default: undefined },
    columns: { type: Array as PropType<HeatmapAxisInput[]>, default: undefined },
    startDate: { type: String, default: undefined },
    endDate: { type: String, default: undefined },
    levels: { type: Number, default: undefined },
    thresholds: { type: Array as PropType<number[]>, default: undefined },
    firstDayOfWeek: { type: Number, default: undefined },
    locale: { type: String, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
    tone: { type: String as PropType<Tone>, default: undefined },
    palette: { type: String as PropType<HeatmapPalette>, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
    translations: { type: Object as PropType<Partial<HeatmapTranslations>>, default: undefined },
  },
  // 只读事件，没有双向绑定：热力图不产生值，只报焦点与详情落在哪一格
  emits: {
    'cell-focus': (_details: PayloadOf<HeatmapProps, 'onCellFocus'>) => true,
    'cell-active': (_details: PayloadOf<HeatmapProps, 'onCellActive'>) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: HeatmapRootSlotProps) => VNode[]
    /** 铺开网格时每一格的内容插槽，缺省是空格子；三种形态都铺。 */
    cell?: (props: HeatmapCellSlotProps) => VNode[]
    /** 详情条的内容插槽；写了它才会铺出 tooltip 部件。 */
    tooltip?: (props: HeatmapCellDetails | null) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notifyFocus: HeatmapProps['onCellFocus'] = details => emit('cell-focus', details)
    const notifyActive: HeatmapProps['onCellActive'] = details => emit('cell-active', details)
    const ctx = useHeatmap(withXhConfig('heatmap', props) as HeatmapProps, notifyFocus, notifyActive)
    provideHeatmap(ctx)
    return () => {
      const api = ctx.api.value
      return h(
        'div',
        api.getRootProps() as Record<string, unknown>,
        slots.default
          ? slots.default({
              variant: api.variant,
              grid: api.grid,
              monthGrid: api.monthGrid,
              matrixGrid: api.matrixGrid,
              focusedCell: api.focusedCell,
              focusedDate: api.focusedDate,
              anchorCell: api.anchorCell,
              anchorDate: api.anchorDate,
              activeCell: api.activeCell,
              detailOpen: api.detailOpen,
              cellAt: api.cellAt,
              setFocusedCell: api.setFocusedCell,
              setFocusedDate: api.setFocusedDate,
            })
          : renderDefaultTree(api, slots.cell, slots.tooltip),
      )
    }
  },
})

/** role=grid 的容器：键盘在这里收口，可及名字也长在它身上。 */
export const XhHeatmapGrid = defineComponent({
  name: 'XhHeatmapGrid',
  setup(_, { slots }) {
    const ctx = useHeatmapContext()
    return () => h('div', ctx.api.value.getGridProps() as Record<string, unknown>, slots.default?.())
  },
})

/** 月历形态里的一个自然月块，块内的行从这里取月份身份。 */
export const XhHeatmapMonthBlock = defineComponent({
  name: 'XhHeatmapMonthBlock',
  props: {
    /** 月份身份 YYYY-MM。 */
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useHeatmapContext()
    provideHeatmapMonth(computed(() => props.value))
    return () => h('div', ctx.api.value.getMonthBlockProps({ value: props.value }) as Record<string, unknown>, slots.default?.())
  },
})

/**
 * 一行。身份写在 value 上，怎么解释由形态决定：
 * 日历形态是行序 0-6，月历形态是月内第几周，矩阵形态是行身份；不写即坐标轴那一行。
 */
export const XhHeatmapRow = defineComponent({
  name: 'XhHeatmapRow',
  props: {
    value: { type: [Number, String] as PropType<number | string>, default: undefined },
    /** 月历形态：所属月份 YYYY-MM；写在月块里就不必再写一遍。 */
    month: { type: String, default: undefined },
  },
  setup(props, { slots }) {
    const ctx = useHeatmapContext()
    const blockMonth = useHeatmapMonth()
    const row = computed<HeatmapRowProps>(() => {
      const variant = ctx.api.value.variant
      if (variant === 'matrix')
        return { row: stringOf(props.value) }
      if (variant === 'month')
        return { month: props.month ?? blockMonth?.value, week: numberOf(props.value) }
      return { weekDay: numberOf(props.value) }
    })
    provideHeatmapRow(computed(() => row.value.row))
    return () => h('div', ctx.api.value.getRowProps(row.value) as Record<string, unknown>, slots.default?.())
  },
})

/** 行首的星期名。不给行序即坐标轴那一行行首的占位，它只负责让月份与格子对齐。 */
export const XhHeatmapWeekDay = defineComponent({
  name: 'XhHeatmapWeekDay',
  props: {
    value: { type: [Number, String] as PropType<number | string>, default: undefined },
  },
  setup(props, { slots }) {
    const ctx = useHeatmapContext()
    const weekDay = computed(() => numberOf(props.value))
    return () => h('span', ctx.api.value.getWeekDayProps({ weekDay: weekDay.value }) as Record<string, unknown>, slots.default?.())
  },
})

/** 月份名。日历形态里横跨这个月占的那几列，月历形态里是一块的标题。 */
export const XhHeatmapMonthLabel = defineComponent({
  name: 'XhHeatmapMonthLabel',
  props: {
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useHeatmapContext()
    return () => h('span', ctx.api.value.getMonthLabelProps({ value: props.value }) as Record<string, unknown>, slots.default?.())
  },
})

/** 矩阵的行名。不写 value 即表头行行首那个角落占位。 */
export const XhHeatmapRowLabel = defineComponent({
  name: 'XhHeatmapRowLabel',
  props: {
    value: { type: String, default: undefined },
  },
  setup(props, { slots }) {
    const ctx = useHeatmapContext()
    return () => h('span', ctx.api.value.getRowLabelProps({ value: props.value }) as Record<string, unknown>, slots.default?.())
  },
})

/** 矩阵的列名。 */
export const XhHeatmapColumnLabel = defineComponent({
  name: 'XhHeatmapColumnLabel',
  props: {
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useHeatmapContext()
    return () => h('span', ctx.api.value.getColumnLabelProps({ value: props.value }) as Record<string, unknown>, slots.default?.())
  },
})

/**
 * 一格。日期形态里 value 是 ISO 日期，矩阵形态里 value 是列身份、
 * 行身份从所在的行取（也可以写在 row 上）。数值与档位由 connect 回网格里查。
 */
export const XhHeatmapCell = defineComponent({
  name: 'XhHeatmapCell',
  props: {
    value: { type: String, required: true },
    /** 矩阵形态：行身份；写在行里就不必再写一遍。 */
    row: { type: String, default: undefined },
  },
  setup(props, { slots }) {
    const ctx = useHeatmapContext()
    const parentRow = useHeatmapRow()
    const cell = computed(() => ctx.api.value.variant === 'matrix'
      ? { row: props.row ?? parentRow?.value, column: props.value }
      : { date: props.value })
    return () => h('div', ctx.api.value.getCellProps(cell.value) as Record<string, unknown>, slots.default?.())
  },
})

/** 详情条：悬停或聚焦到某一格时显示，位置由连接层量好写成内联样式。 */
export const XhHeatmapTooltip = defineComponent({
  name: 'XhHeatmapTooltip',
  setup(_, { slots }) {
    const ctx = useHeatmapContext()
    return () => h('div', ctx.api.value.getTooltipProps() as Record<string, unknown>, slots.default?.())
  },
})

/** 色阶对照条。 */
export const XhHeatmapLegend = defineComponent({
  name: 'XhHeatmapLegend',
  setup(_, { slots }) {
    const ctx = useHeatmapContext()
    return () => h('div', ctx.api.value.getLegendProps() as Record<string, unknown>, slots.default?.())
  },
})

/** 对照条一端的那个字：value 写 low 或 high，文字从 api.legendText 取。 */
export const XhHeatmapLegendLabel = defineComponent({
  name: 'XhHeatmapLegendLabel',
  props: {
    /** 挂在哪一端：low 是色阶起点，high 是终点。 */
    value: { type: String as PropType<HeatmapLegendBound>, required: true },
  },
  setup(props, { slots }) {
    const ctx = useHeatmapContext()
    return () => h('span', ctx.api.value.getLegendLabelProps({ bound: props.value }) as Record<string, unknown>, slots.default?.())
  },
})

/** 对照条里的一格，与网格里同档的格子同色。 */
export const XhHeatmapLegendItem = defineComponent({
  name: 'XhHeatmapLegendItem',
  props: {
    /** 档位，兼收字符串。 */
    value: { type: [Number, String] as PropType<number | string>, required: true },
  },
  setup(props, { slots }) {
    const ctx = useHeatmapContext()
    const level = computed(() => Number(props.value) || 0)
    return () => h('span', ctx.api.value.getLegendItemProps({ level: level.value }) as Record<string, unknown>, slots.default?.())
  },
})

/**
 * 没写默认插槽时按网格模型铺开的整套结构，作者只交数据。
 * 与手写部件产出的 DOM 完全一致，要改结构就写默认插槽，行为不变。
 * 详情条只有写了 tooltip 插槽才铺，不写时整棵树与从前逐字一致。
 */
function renderDefaultTree(
  api: HeatmapApi,
  cellSlot?: (node: HeatmapCellSlotProps) => VNode[],
  tooltipSlot?: (details: HeatmapCellDetails | null) => VNode[],
): VNode[] {
  // 两端各一个字：一排色块自己说不出哪头是多
  const legend = h(
    XhHeatmapLegend,
    null,
    () => [
      h(XhHeatmapLegendLabel, { value: 'low' }, () => api.legendText.low),
      ...Array.from(
        { length: api.monthGrid?.levels ?? api.matrixGrid?.levels ?? api.grid.levels },
        (_, level) => h(XhHeatmapLegendItem, { key: level, value: level }),
      ),
      h(XhHeatmapLegendLabel, { value: 'high' }, () => api.legendText.high),
    ],
  )
  const tooltip = tooltipSlot
    ? [h(XhHeatmapTooltip, null, () => tooltipSlot(api.activeCell))]
    : []

  if (api.matrixGrid)
    return [...renderMatrixTree(api.matrixGrid, cellSlot), ...tooltip, legend]
  if (api.monthGrid)
    return [...renderMonthTree(api.monthGrid, cellSlot), ...tooltip, legend]

  // 月份行排在网格之外：它只是一条对齐用的坐标轴，进了网格就得冒充表格行
  const monthRow = h(XhHeatmapRow, null, () => [
    // 行首占位：与下面各行的星期名同宽，月份才对得上列
    h(XhHeatmapWeekDay),
    ...api.grid.months.map(month => h(XhHeatmapMonthLabel, { key: month.value, value: month.value }, () => month.label)),
  ])
  const weekRows = api.grid.rows.map(row => h(XhHeatmapRow, { key: row.weekDay, value: row.weekDay }, () => [
    h(XhHeatmapWeekDay, { value: row.weekDay }, () => api.grid.weekDays[row.weekDay]?.label ?? ''),
    ...row.cells.map(cell => h(XhHeatmapCell, { key: cell.date, value: cell.date }, () => cellSlot?.(cell) ?? [])),
  ]))
  return [monthRow, h(XhHeatmapGrid, null, () => weekRows), ...tooltip, legend]
}

/** 月历形态：网格里一个自然月一块，块内先一条星期名坐标轴，再逐周一行。 */
function renderMonthTree(grid: HeatmapMonthGrid, cellSlot?: (node: HeatmapCellSlotProps) => VNode[]): VNode[] {
  const blocks = grid.blocks.map(block => h(XhHeatmapMonthBlock, { key: block.value, value: block.value }, () => [
    h(XhHeatmapMonthLabel, { value: block.value }, () => block.label),
    h(XhHeatmapRow, null, () => grid.weekDays.map(day =>
      h(XhHeatmapWeekDay, { key: day.weekDay, value: day.weekDay }, () => day.label))),
    ...block.weeks.map(row => h(XhHeatmapRow, { key: row.week, value: row.week }, () =>
      row.cells.map(cell => h(XhHeatmapCell, { key: cell.date, value: cell.date }, () => cellSlot?.(cell) ?? [])))),
  ]))
  return [h(XhHeatmapGrid, null, () => blocks)]
}

/** 矩阵形态：头一行是列名，其余每行行首一个行名、其后逐列一格。 */
function renderMatrixTree(grid: HeatmapMatrixGrid, cellSlot?: (node: HeatmapCellSlotProps) => VNode[]): VNode[] {
  const header = h(XhHeatmapRow, null, () => [
    // 角落占位：与下面各行的行名同宽，列名才对得上列
    h(XhHeatmapRowLabel),
    ...grid.columns.map(column => h(XhHeatmapColumnLabel, { key: column.value, value: column.value }, () => column.label)),
  ])
  const rows = grid.rows.map(row => h(XhHeatmapRow, { key: row.value, value: row.value }, () => [
    h(XhHeatmapRowLabel, { value: row.value }, () => row.label),
    ...grid.columns.map((column) => {
      const meta = grid.cells.get(heatmapMatrixKey(row.value, column.value))
      return h(
        XhHeatmapCell,
        { key: column.value, value: column.value },
        () => (meta == null ? [] : cellSlot?.(meta) ?? []),
      )
    }),
  ]))
  return [h(XhHeatmapGrid, null, () => [header, ...rows])]
}

/** 作者写的数字身份，兼收字符串；没写即 undefined。 */
function numberOf(value: number | string | undefined): number | undefined {
  if (value == null || value === '')
    return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

/** 作者写的串身份；没写即 undefined。 */
function stringOf(value: number | string | undefined): string | undefined {
  if (value == null || value === '')
    return undefined
  return String(value)
}
