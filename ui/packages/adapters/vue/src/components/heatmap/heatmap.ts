import type { HeatmapApi, HeatmapCellMeta, HeatmapDatum, HeatmapGrid, HeatmapSchema, HeatmapTranslations } from '@xihan-ui/headless'
import type { Direction, Size, Tone } from '@xihan-ui/kernel'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { computed, defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { provideHeatmap, useHeatmapContext } from './context'
import { useHeatmap } from './use-heatmap'

type HeatmapProps = HeatmapSchema['props']

/** 默认插槽的载荷：整张网格模型与锚点，外加挪锚点的动作。 */
export type HeatmapRootSlotProps = Pick<HeatmapApi, 'grid' | 'focusedDate' | 'anchorDate' | 'cellAt' | 'setFocusedDate'>

export const XhHeatmapRoot = defineComponent({
  name: 'XhHeatmapRoot',
  // 全部 default: undefined，缺省值由机器与 connect 决定
  props: {
    value: { type: Array as PropType<HeatmapDatum[]>, default: undefined },
    startDate: { type: String, default: undefined },
    endDate: { type: String, default: undefined },
    levels: { type: Number, default: undefined },
    thresholds: { type: Array as PropType<number[]>, default: undefined },
    firstDayOfWeek: { type: Number, default: undefined },
    locale: { type: String, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
    tone: { type: String as PropType<Tone>, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
    translations: { type: Object as PropType<Partial<HeatmapTranslations>>, default: undefined },
  },
  // 只读事件，没有双向绑定：热力图不产生值，只报焦点走到了哪一天
  emits: {
    'cell-focus': (_details: PayloadOf<HeatmapProps, 'onCellFocus'>) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: HeatmapRootSlotProps) => VNode[]
    /** 铺开网格时每一格的内容插槽，缺省是空格子。 */
    cell?: (props: HeatmapCellMeta) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notify: HeatmapProps['onCellFocus'] = details => emit('cell-focus', details)
    const ctx = useHeatmap(withXhConfig('heatmap', props) as HeatmapProps, notify)
    provideHeatmap(ctx)
    return () => {
      const api = ctx.api.value
      return h(
        'div',
        api.getRootProps() as Record<string, unknown>,
        slots.default
          ? slots.default({
              grid: api.grid,
              focusedDate: api.focusedDate,
              anchorDate: api.anchorDate,
              cellAt: api.cellAt,
              setFocusedDate: api.setFocusedDate,
            })
          : renderDefaultTree(api.grid, slots.cell),
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

/** 一行。给了行序就是网格里的星期行，不给即网格之外那条月份行。 */
export const XhHeatmapRow = defineComponent({
  name: 'XhHeatmapRow',
  props: {
    // 行序 0-6，兼收字符串
    value: { type: [Number, String] as PropType<number | string>, default: undefined },
  },
  setup(props, { slots }) {
    const ctx = useHeatmapContext()
    const weekDay = computed(() => weekDayOf(props.value))
    return () => h('div', ctx.api.value.getRowProps({ weekDay: weekDay.value }) as Record<string, unknown>, slots.default?.())
  },
})

/** 行首的星期名。不给行序即月份行行首那个占位，它只负责让月份与格子对齐。 */
export const XhHeatmapWeekDayLabel = defineComponent({
  name: 'XhHeatmapWeekDayLabel',
  props: {
    value: { type: [Number, String] as PropType<number | string>, default: undefined },
  },
  setup(props, { slots }) {
    const ctx = useHeatmapContext()
    const weekDay = computed(() => weekDayOf(props.value))
    return () => h('span', ctx.api.value.getWeekDayLabelProps({ weekDay: weekDay.value }) as Record<string, unknown>, slots.default?.())
  },
})

/** 月份名，宽度按它占的列数算。 */
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

/** 一天一格；计数与档位由日期回网格里查，格子自己只报日期。 */
export const XhHeatmapCell = defineComponent({
  name: 'XhHeatmapCell',
  props: {
    /** ISO 日期串 YYYY-MM-DD。 */
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useHeatmapContext()
    return () => h('div', ctx.api.value.getCellProps({ date: props.value }) as Record<string, unknown>, slots.default?.())
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
 * 月份行排在网格之外：它只是一条对齐用的坐标轴，进了网格就得冒充表格行。
 */
function renderDefaultTree(
  grid: HeatmapGrid,
  cellSlot?: (node: HeatmapCellMeta) => VNode[],
): VNode[] {
  const monthRow = h(XhHeatmapRow, null, () => [
    // 行首占位：与下面各行的星期名同宽，月份才对得上列
    h(XhHeatmapWeekDayLabel),
    ...grid.months.map(month => h(XhHeatmapMonthLabel, { key: month.value, value: month.value }, () => month.label)),
  ])

  const weekRows = grid.rows.map(row => h(XhHeatmapRow, { key: row.weekDay, value: row.weekDay }, () => [
    h(XhHeatmapWeekDayLabel, { value: row.weekDay }, () => grid.weekDays[row.weekDay]?.label ?? ''),
    ...row.cells.map(cell => h(XhHeatmapCell, { key: cell.date, value: cell.date }, () => cellSlot?.(cell) ?? [])),
  ]))

  const legend = h(
    XhHeatmapLegend,
    null,
    () => Array.from({ length: grid.levels }, (_, level) => h(XhHeatmapLegendItem, { key: level, value: level })),
  )

  return [monthRow, h(XhHeatmapGrid, null, () => weekRows), legend]
}

/** 作者写的行序，兼收字符串；没写即月份行。 */
function weekDayOf(value: number | string | undefined): number | undefined {
  if (value == null || value === '')
    return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}
