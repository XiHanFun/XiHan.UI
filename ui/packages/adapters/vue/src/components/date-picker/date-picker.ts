import type { ControlVariant, Direction, Placement, Size, Tone } from '@xihan-ui/core'
import type {
  CalendarApi,
  CalendarCellProps,
  CalendarSelectionMode,
  CalendarView,
  DateFieldSegmentState,
  DatePickerApi,
  DatePickerFieldApi,
  DatePickerPreset,
  DatePickerPresetState,
  DatePickerSchema,
  DateSegmentSet,
  DateSegmentType,
} from '@xihan-ui/headless'
import type { ComputedRef, PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { computed, defineComponent, h, mergeProps, Teleport } from 'vue'
import { withXhConfig } from '../../config/config'
import { slotPaints } from '../../runtime/slot-content'
import { useScrollbars } from '../../runtime/use-scrollbars'
import { useFieldLabelWiring, useFieldStateWiring } from '../field/use-field-control'
import {
  provideDatePicker,
  provideDatePickerCell,
  provideDatePickerPanel,
  provideDatePickerSegmentGroup,
  useDatePickerCellContext,
  useDatePickerContext,
  useDatePickerPanelContext,
  useDatePickerSegmentGroupContext,
} from './context'
import { useDatePicker } from './use-date-picker'

type DatePickerProps = DatePickerSchema['props']

/**
 * 部件属于并排的第几张面板：自己写了就按自己写的，没写就跟着所在的日历走。
 * 兼收字符串以支持模板里写 index="1"。
 */
function usePanelIndex(props: { index?: number | string }): ComputedRef<number> {
  const panel = useDatePickerPanelContext()
  return computed(() => {
    if (props.index === undefined || props.index === '')
      return panel.index.value
    const n = Math.trunc(Number(props.index))
    return Number.isFinite(n) && n >= 0 ? n : panel.index.value
  })
}

/** 按组号取那一组分段输入；非区间模式下终点那组缺席。 */
function fieldOf(api: DatePickerApi, index: 0 | 1): DatePickerFieldApi | null {
  return index === 1 ? api.fieldEnd : api.field
}

/** 默认插槽的载荷：选择器的开合与选中值、内嵌日历的展示数据、两组段位，以及改写值的句柄。 */
export type DatePickerRootSlotProps
  = & Pick<
    DatePickerApi,
    | 'open'
    | 'value'
    | 'valueAsString'
    | 'focusedValue'
    | 'canClear'
    | 'setOpen'
    | 'setValue'
    | 'clear'
  >
  & Pick<
    CalendarApi,
    | 'visibleMonth'
    | 'panels'
    | 'weeks'
    | 'weekDays'
    | 'headingLabel'
    | 'canGoPrev'
    | 'canGoNext'
  >
  & {
    segments: DateFieldSegmentState[]
    /** 区间终点那组段位；非区间模式为空数组。 */
    endSegments: DateFieldSegmentState[]
  }

/** 段位默认插槽的载荷：本段的投影；下标越界时缺席。 */
export interface DatePickerSegmentSlotProps {
  segment: DateFieldSegmentState | undefined
}

/** 快捷选项列默认插槽的载荷：逐条的投影，作者据此自己铺条目。 */
export interface DatePickerPresetsSlotProps {
  presets: readonly DatePickerPresetState[]
}

export const XhDatePickerRoot = defineComponent({
  name: 'XhDatePickerRoot',
  // 有 connect / machine 兜底的 prop 一律 default: undefined
  props: {
    value: { type: [String, Array] as PropType<string | string[]>, default: undefined },
    defaultValue: { type: [String, Array] as PropType<string | string[]>, default: undefined },
    open: { type: Boolean, default: undefined },
    defaultOpen: Boolean,
    min: { type: String, default: undefined },
    max: { type: String, default: undefined },
    locale: { type: String, default: undefined },
    timeZone: { type: String, default: undefined },
    selectionMode: { type: String as PropType<CalendarSelectionMode>, default: undefined },
    /** 挑的粒度：天（默认）/ 月 / 季度 / 年。输入行铺哪几段也跟着它走。 */
    view: { type: String as PropType<CalendarView>, default: undefined },
    /** 面板此刻钻到了哪一层；给定即受控，缺省跟着 view。 */
    activeView: { type: String as PropType<CalendarView>, default: undefined },
    /** 输入行铺哪几段；不给就按 view 推。 */
    segments: { type: Array as PropType<DateSegmentSet>, default: undefined },
    /** 周选：点任意一天选中它所在的整周。只在 view=day 且区间模式下生效。 */
    weekSelection: { type: Boolean, default: undefined },
    /** 并排展示几页；缺省单选 1，区间按两端定：同一页放得下就 1，跨页才 2。 */
    visibleCount: { type: Number, default: undefined },
    /** 日历恒渲染六行，默认开。关掉后翻页时浮层高度会跟着月份变。 */
    fixedWeeks: { type: Boolean, default: undefined },
    /** 初始聚焦日，同时决定展开时先落在哪一页；不给就退回首个选中值，再退回今天。 */
    defaultFocusedValue: { type: String, default: undefined },
    /** 快捷选项；给了就在浮层里多出一列，日子要在自己的 computed 里算好再传。 */
    presets: { type: Array as PropType<DatePickerPreset[]>, default: undefined },
    isDateUnavailable: { type: Function as PropType<(value: string) => boolean>, default: undefined },
    disabled: Boolean,
    readOnly: Boolean,
    invalid: Boolean,
    required: Boolean,
    name: { type: String, default: undefined },
    // 区间终点那份隐藏输入的表单名；不给即终点不参与提交
    endName: { type: String, default: undefined },
    // 区间模式下两组段位各自的读屏名字
    translations: { type: Object as PropType<DatePickerProps['translations']>, default: undefined },
    variant: { type: String as PropType<ControlVariant>, default: undefined },
    tone: { type: String as PropType<Tone>, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
    placement: { type: String as PropType<Placement>, default: undefined },
    offset: { type: Number, default: undefined },
    /** 文字方向；浮层搬到落点后继承不到作者子树上的方向，要 RTL 就显式给。 */
    dir: { type: String as PropType<Direction>, default: undefined },
    closeOnSelect: { type: Boolean, default: undefined },
    showTime: { type: Boolean, default: undefined },
    timeGranularity: { type: String as PropType<DatePickerSchema['props']['timeGranularity']>, default: undefined },
  },
  // *-change 携带 details 对象，update:* 携带裸值；选中值恒为数组，单选时长度 ≤ 1
  emits: {
    'value-change': (_details: PayloadOf<DatePickerProps, 'onValueChange'>) => true,
    'open-change': (_details: PayloadOf<DatePickerProps, 'onOpenChange'>) => true,
    'focused-value-change': (_details: PayloadOf<DatePickerProps, 'onFocusedValueChange'>) => true,
    'active-view-change': (_details: PayloadOf<DatePickerProps, 'onActiveViewChange'>) => true,
    'update:value': (_value: PayloadOf<DatePickerProps, 'onValueChange'>['value']) => true,
    'update:open': (_open: PayloadOf<DatePickerProps, 'onOpenChange'>['open']) => true,
    'update:activeView': (_view: PayloadOf<DatePickerProps, 'onActiveViewChange'>['activeView']) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: DatePickerRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notifyValue: DatePickerProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const notifyOpen: DatePickerProps['onOpenChange'] = (details) => {
      emit('open-change', details)
      emit('update:open', details.open)
    }
    // 聚焦日只对外播报，不提供 v-model
    const notifyFocus: DatePickerProps['onFocusedValueChange'] = details => emit('focused-value-change', details)
    const notifyActiveView: DatePickerProps['onActiveViewChange'] = (details) => {
      emit('active-view-change', details)
      emit('update:activeView', details.activeView)
    }
    const ctx = useDatePicker(withXhConfig('date-picker', props) as DatePickerProps, {
      onValueChange: notifyValue,
      onOpenChange: notifyOpen,
      onFocusedValueChange: notifyFocus,
      onActiveViewChange: notifyActiveView,
    })
    provideDatePicker(ctx)
    // 网格与段位由作者照插槽里的 weeks / segments 自行渲染
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      open: ctx.api.value.open,
      value: ctx.api.value.value,
      valueAsString: ctx.api.value.valueAsString,
      focusedValue: ctx.api.value.focusedValue,
      visibleMonth: ctx.api.value.calendar.visibleMonth,
      panels: ctx.api.value.calendar.panels,
      weeks: ctx.api.value.calendar.weeks,
      weekDays: ctx.api.value.calendar.weekDays,
      headingLabel: ctx.api.value.calendar.headingLabel,
      canGoPrev: ctx.api.value.calendar.canGoPrev,
      canGoNext: ctx.api.value.calendar.canGoNext,
      segments: ctx.api.value.field.segments,
      // 区间终点那组段位；非区间模式为空数组，作者据此决定渲不渲第二组
      endSegments: ctx.api.value.fieldEnd?.segments ?? [],
      canClear: ctx.api.value.canClear,
      setOpen: ctx.api.value.setOpen,
      setValue: ctx.api.value.setValue,
      clear: ctx.api.value.clear,
    }))
  },
})

export const XhDatePickerLabel = defineComponent({
  name: 'XhDatePickerLabel',
  setup(_, { slots }) {
    const ctx = useDatePickerContext()
    // 渲染为 span 而非 label，点击聚焦由连接层接管
    return () => h('span', ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhDatePickerControl = defineComponent({
  name: 'XhDatePickerControl',
  setup(_, { slots }) {
    const ctx = useDatePickerContext()
    return () => h('div', {
      ...ctx.api.value.getControlProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.controlRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhDatePickerSegmentGroup = defineComponent({
  name: 'XhDatePickerSegmentGroup',
  props: {
    // 组号：0 起点、1 区间终点，兼收字符串以支持模板里写 index="1"
    index: { type: [Number, String] as PropType<number | string>, default: 0 },
  },
  setup(props, { slots }) {
    const ctx = useDatePickerContext()
    const index = computed<0 | 1>(() => (Number(props.index) === 1 ? 1 : 0))
    // 组内的段位与隐藏输入据此认领起止
    provideDatePickerSegmentGroup({ index })
    // role=group 的分段容器，也是换段时的查询边界
    return () => h(
      'div',
      ctx.api.value.getSegmentGroupProps({ index: index.value }) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

export const XhDatePickerSegment = defineComponent({
  name: 'XhDatePickerSegment',
  props: {
    // 段位下标，兼收字符串以支持模板里写 index="0"
    index: { type: [Number, String] as PropType<number | string>, default: undefined },
    /** 按段名声明这一格。段集里没有这一块时它收起；与 index 二选一，两个都写按段名算。 */
    segment: { type: String as PropType<DateSegmentType>, default: undefined },
  },
  slots: Object as SlotsType<{
    default?: (props: DatePickerSegmentSlotProps) => VNode[]
  }>,
  setup(props, { slots }) {
    const ctx = useDatePickerContext()
    const group = useDatePickerSegmentGroupContext()
    return () => {
      const field = fieldOf(ctx.api.value, group.index.value)
      // 非区间模式下写在终点组里的段位无处落脚，不渲染
      if (!field)
        return null
      // 落点由连接层算：按下标还是按段名是同一条路，适配器这边不重写一份
      const declared = props.segment != null
        ? { segment: props.segment }
        : { index: Math.trunc(Number(props.index)) }
      const state = field.segmentOf(declared)
      // 有插槽用插槽，否则渲染连接层算好的段位文本
      return h(
        'div',
        field.getSegmentProps(declared) as Record<string, unknown>,
        slots.default ? slots.default({ segment: state }) : state?.text,
      )
    }
  },
})

export const XhDatePickerClearTrigger = defineComponent({
  name: 'XhDatePickerClearTrigger',
  setup(_, { slots }) {
    const ctx = useDatePickerContext()
    return () => h('button', ctx.api.value.getClearTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhDatePickerTrigger = defineComponent({
  name: 'XhDatePickerTrigger',
  setup(_, { slots }) {
    // 字段的说明与校验状态要落在真控件上，不能停在封装根的 div 上
    const fieldWiring = useFieldStateWiring()
    // 字段的标签也得并进名字链：控件自带的那条指的是它自己那个没渲染的 label 部件
    const fieldLabel = useFieldLabelWiring()
    const ctx = useDatePickerContext()
    return () => h('button', fieldLabel.value({ ...ctx.api.value.getTriggerProps() as Record<string, unknown>, ...fieldWiring.value }), slots.default?.())
  },
})

export const XhDatePickerPositioner = defineComponent({
  name: 'XhDatePickerPositioner',
  // 根是 Teleport，Vue 不会把直通属性合上去，作者写的 class 与 style 得自己接住落到 positioner 上
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    const ctx = useDatePickerContext()
    // 浮层面板的自绘条：与 content 同级、绝对定位不占布局，壳是这层已经 fixed 的 positioner
    const bars = useScrollbars({ scrollable: () => ctx.contentRef.value })
    // 搬到 portal 落点：留在原地的话，宿主祖先只要建了层叠上下文就能盖住浮层
    return () => h(Teleport, { to: ctx.portalTarget.value }, [
      h('div', {
        ...mergeProps(ctx.api.value.getPositionerProps() as Record<string, unknown>, attrs),
        ref: (el: unknown) => { ctx.positionerRef.value = el as HTMLElement },
      }, [...(slots.default?.() ?? []), ...bars.render()]),
    ])
  },
})

export const XhDatePickerContent = defineComponent({
  name: 'XhDatePickerContent',
  setup(_, { slots }) {
    const ctx = useDatePickerContext()
    return () => h('div', {
      ...ctx.api.value.getContentProps() as Record<string, unknown>,
      // 收起跟着退场闸门走：皮肤刻意没给 content 补 [hidden]{display:none}（补了退场
      // 就一帧都播不出来），所以真正的收起落成内联 display——节点始终留在原地
      style: ctx.visible.value ? undefined : { display: 'none' },
      ref: (el: unknown) => { ctx.contentRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

// 以下是内嵌日历的角色节点，DOM 上带 data-scope="calendar"，行为取自本组件持有的日历机器

export const XhDatePickerCalendar = defineComponent({
  name: 'XhDatePickerCalendar',
  props: {
    /** 并排的第几张面板，默认 0。写在这里，面板内的标题、网格与格子就不必各写一遍。 */
    index: { type: [Number, String], default: 0 },
  },
  setup(props, { slots }) {
    const ctx = useDatePickerContext()
    provideDatePickerPanel({ index: usePanelIndex(props) })
    // 内嵌日历的挂载点，同时是日历的根节点
    return () => h('div', ctx.api.value.getCalendarProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhDatePickerPresetGroup = defineComponent({
  name: 'XhDatePickerPresetGroup',
  slots: Object as SlotsType<{
    /** 自己铺条目；不写就按 presets 数据自动铺，两者产出的 DOM 一致。 */
    default?: (props: DatePickerPresetsSlotProps) => VNode[]
  }>,
  setup(_, { slots }) {
    const ctx = useDatePickerContext()
    return () => {
      const api = ctx.api.value
      const authored = slots.default?.({ presets: api.presets })
      return h(
        'div',
        api.getPresetGroupProps() as Record<string, unknown>,
        slotPaints(authored)
          ? authored
          : api.presets.map(preset => h(
              'div',
              { ...api.getPresetProps({ value: preset.value }) as Record<string, unknown>, key: preset.value },
              preset.label,
            )),
      )
    }
  },
})

export const XhDatePickerPreset = defineComponent({
  name: 'XhDatePickerPreset',
  props: {
    /** 这一条的身份，与 presets 数据里的 value 逐字对上。 */
    value: { type: String, required: true },
  },
  slots: Object as SlotsType<{
    /** 条目内容；不写就用数据里的 label。 */
    default?: () => VNode[]
  }>,
  setup(props, { slots }) {
    const ctx = useDatePickerContext()
    return () => {
      const api = ctx.api.value
      const authored = slots.default?.()
      return h(
        'div',
        api.getPresetProps({ value: props.value }) as Record<string, unknown>,
        slotPaints(authored) ? authored : api.presets.find(p => p.value === props.value)?.label,
      )
    }
  },
})

export const XhDatePickerTimePanel = defineComponent({
  name: 'XhDatePickerTimePanel',
  setup() {
    const ctx = useDatePickerContext()
    // 时间列整组自动铺：时/分[/秒]各一列，选项点按写值；没开 showTime 时整组带 hidden
    return () => ctx.api.value.timeColumns.map(column =>
      h(
        'div',
        { ...ctx.api.value.getTimeColumnProps({ unit: column.unit }) as Record<string, unknown>, key: column.unit },
        column.options.map(option =>
          h(
            'div',
            { ...ctx.api.value.getTimeItemProps({ unit: column.unit, value: option }) as Record<string, unknown>, key: option },
            option,
          ),
        ),
      ),
    )
  },
})

export const XhDatePickerConfirmTrigger = defineComponent({
  name: 'XhDatePickerConfirmTrigger',
  setup(_, { slots }) {
    const ctx = useDatePickerContext()
    return () => h('button', ctx.api.value.getConfirmTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhDatePickerHeader = defineComponent({
  name: 'XhDatePickerHeader',
  setup(_, { slots }) {
    const ctx = useDatePickerContext()
    return () => h('div', ctx.api.value.calendar.getHeaderProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhDatePickerPrevYearTrigger = defineComponent({
  name: 'XhDatePickerPrevYearTrigger',
  setup(_, { slots }) {
    const ctx = useDatePickerContext()
    return () => h('button', ctx.api.value.calendar.getPrevYearTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhDatePickerPrevTrigger = defineComponent({
  name: 'XhDatePickerPrevTrigger',
  setup(_, { slots }) {
    const ctx = useDatePickerContext()
    return () => h('button', ctx.api.value.calendar.getPrevTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhDatePickerNextTrigger = defineComponent({
  name: 'XhDatePickerNextTrigger',
  setup(_, { slots }) {
    const ctx = useDatePickerContext()
    return () => h('button', ctx.api.value.calendar.getNextTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhDatePickerNextYearTrigger = defineComponent({
  name: 'XhDatePickerNextYearTrigger',
  setup(_, { slots }) {
    const ctx = useDatePickerContext()
    return () => h('button', ctx.api.value.calendar.getNextYearTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhDatePickerHeading = defineComponent({
  name: 'XhDatePickerHeading',
  props: {
    /** 属于第几个面板；不写就跟着所在的日历走。 */
    index: { type: [Number, String], default: undefined },
  },
  setup(props, { slots }) {
    const ctx = useDatePickerContext()
    const index = usePanelIndex(props)
    // 有插槽用插槽，否则渲染本面板的标题
    return () => h(
      'div',
      ctx.api.value.calendar.getHeadingProps({ index: index.value }) as Record<string, unknown>,
      slots.default?.() ?? (ctx.api.value.calendar.panels[index.value]?.headingLabel ?? ctx.api.value.calendar.headingLabel),
    )
  },
})

export const XhDatePickerHeadingYearTrigger = defineComponent({
  name: 'XhDatePickerHeadingYearTrigger',
  props: {
    /** 属于第几个面板；不写就跟着所在的日历走。 */
    index: { type: [Number, String], default: undefined },
  },
  setup(props, { slots }) {
    const ctx = useDatePickerContext()
    const index = usePanelIndex(props)
    // 有插槽用插槽，否则渲染标题里年那一截；年视图下它是整个十年跨度
    return () => h(
      'button',
      ctx.api.value.calendar.getHeadingYearTriggerProps({ index: index.value }) as Record<string, unknown>,
      slots.default?.() ?? ctx.api.value.calendar.panels[index.value]?.headingYear,
    )
  },
})

export const XhDatePickerHeadingMonthTrigger = defineComponent({
  name: 'XhDatePickerHeadingMonthTrigger',
  props: {
    /** 属于第几个面板；不写就跟着所在的日历走。 */
    index: { type: [Number, String], default: undefined },
  },
  setup(props, { slots }) {
    const ctx = useDatePickerContext()
    const index = usePanelIndex(props)
    return () => h(
      'button',
      ctx.api.value.calendar.getHeadingMonthTriggerProps({ index: index.value }) as Record<string, unknown>,
      slots.default?.() ?? ctx.api.value.calendar.panels[index.value]?.headingMonth,
    )
  },
})

export const XhDatePickerGrid = defineComponent({
  name: 'XhDatePickerGrid',
  props: {
    /** 属于第几个面板；不写就跟着所在的日历走。 */
    index: { type: [Number, String], default: undefined },
  },
  setup(props, { slots }) {
    const ctx = useDatePickerContext()
    const index = usePanelIndex(props)
    return () => h(
      'div',
      {
        ...ctx.api.value.calendar.getGridProps({ index: index.value }) as Record<string, unknown>,
        // 键盘在首个网格上收口；其余面板只渲染，方向键仍能跨面板走（落点按值现查）
        ref: index.value === 0 ? ctx.gridRef : undefined,
      },
      slots.default?.(),
    )
  },
})

export const XhDatePickerGridHead = defineComponent({
  name: 'XhDatePickerGridHead',
  setup(_, { slots }) {
    const ctx = useDatePickerContext()
    return () => h('div', ctx.api.value.calendar.getGridHeadProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhDatePickerGridBody = defineComponent({
  name: 'XhDatePickerGridBody',
  setup(_, { slots }) {
    const ctx = useDatePickerContext()
    return () => h('div', ctx.api.value.calendar.getGridBodyProps() as Record<string, unknown>, slots.default?.())
  },
})

// 表头行与日期行共用同一个 role=row
export const XhDatePickerWeekRow = defineComponent({
  name: 'XhDatePickerWeekRow',
  setup(_, { slots }) {
    const ctx = useDatePickerContext()
    return () => h('div', ctx.api.value.calendar.getWeekRowProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhDatePickerWeekNumber = defineComponent({
  name: 'XhDatePickerWeekNumber',
  props: {
    /** 这一行行首那天的 ISO 串。 */
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useDatePickerContext()
    // 有插槽用插槽，否则显示这一行的周序号
    return () => h(
      'span',
      ctx.api.value.calendar.getWeekNumberProps({ value: props.value }) as Record<string, unknown>,
      slots.default?.() ?? ctx.api.value.calendar.getWeekNumberText({ value: props.value }),
    )
  },
})

export const XhDatePickerWeekDay = defineComponent({
  name: 'XhDatePickerWeekDay',
  props: {
    // 列序 0-6，兼收字符串
    value: { type: [Number, String] as PropType<number | string>, required: true },
  },
  setup(props, { slots }) {
    const ctx = useDatePickerContext()
    const index = computed(() => Number(props.value))
    return () => h(
      'span',
      ctx.api.value.calendar.getWeekDayProps({ value: index.value }) as Record<string, unknown>,
      slots.default?.() ?? ctx.api.value.calendar.weekDays[index.value]?.label,
    )
  },
})

export const XhDatePickerCell = defineComponent({
  name: 'XhDatePickerCell',
  props: {
    /** ISO 日期串。 */
    value: { type: String, required: true },
    /**
     * 属于第几个面板；不写就跟着所在的日历走。同一天会同时出现在两个面板里
     * （8 月末那几天也铺在 9 月的首行），「是不是本月」只有连着面板一起看才判得出来。
     */
    index: { type: [Number, String], default: undefined },
  },
  setup(props, { slots }) {
    const ctx = useDatePickerContext()
    const index = usePanelIndex(props)
    const cell = computed<CalendarCellProps>(() => ({ value: props.value, index: index.value }))
    provideDatePickerCell({ cell })
    // 不上报格子卸载，翻月后由日历机器按聚焦日重新落点
    return () => h('div', ctx.api.value.calendar.getCellProps(cell.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhDatePickerCellTrigger = defineComponent({
  name: 'XhDatePickerCellTrigger',
  setup(_, { slots }) {
    const ctx = useDatePickerContext()
    const { cell } = useDatePickerCellContext()
    return () => h(
      'div',
      ctx.api.value.calendar.getCellTriggerProps(cell.value) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

export const XhDatePickerHiddenInput = defineComponent({
  name: 'XhDatePickerHiddenInput',
  props: {
    // 写在分段容器外面时用它指明属于哪一端；写在容器里面不必给，跟着容器走
    index: { type: [Number, String] as PropType<number | string>, default: undefined },
  },
  setup(props) {
    const ctx = useDatePickerContext()
    const group = useDatePickerSegmentGroupContext()
    return () => {
      const index = props.index === undefined ? group.index.value : (Number(props.index) === 1 ? 1 : 0)
      const field = fieldOf(ctx.api.value, index)
      // 非区间模式下终点那份没有可提交的值，不渲染
      if (!field)
        return null
      return h('input', field.getHiddenInputProps() as Record<string, unknown>)
    }
  },
})
