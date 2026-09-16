/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 date range picker 相关实现。

import type { ControlVariant, Direction, Placement, Size, Tone } from '@xihan-ui/core'
import type {
  CalendarCellProps,
  CalendarGranularity,
  CalendarRangePickerApi,
  CalendarView,
  DateFieldSegmentState,
  DateRangePickerApi,
  DateRangePickerPreset,
  DateRangePickerPresetState,
  DateRangePickerSchema,
  DateSegmentSet,
  DateSegmentType,
} from '@xihan-ui/headless'
import type { ComputedRef, PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { dateRangePickerFieldAt, resolveDateRangePickerFieldIndex, resolveDateRangePickerPanelIndex } from '@xihan-ui/headless'
import { computed, defineComponent, h, mergeProps, onUpdated, ref } from 'vue'
import { withXhConfig } from '../../config/config'
import { XhPortal } from '../../runtime/portal'
import { slotPaints } from '../../runtime/slot-content'
import { useScrollbars } from '../../runtime/use-scrollbars'
import { useFieldLabelWiring, useFieldStateWiring } from '../field/use-field-control'
import { useFormControlProps } from '../form/use-form-control'
import {
  provideDateRangePicker,
  provideDateRangePickerCell,
  provideDateRangePickerPanel,
  provideDateRangePickerSegmentGroup,
  useDateRangePickerCellContext,
  useDateRangePickerContext,
  useDateRangePickerPanelContext,
  useDateRangePickerSegmentGroupContext,
} from './context'
import { useDateRangePickerWithRoot } from './use-date-range-picker'

type DateRangePickerProps = DateRangePickerSchema['props']

/**
 * 部件属于并排的第几张面板：自己写了即按自己写的，未写时跟随所在的日历。
 * 兼收字符串以支持模板中写 index="1"。
 */
function usePanelIndex(props: { index?: number | string }): ComputedRef<number> {
  const panel = useDateRangePickerPanelContext()
  return computed(() => resolveDateRangePickerPanelIndex(props.index, panel.index.value))
}

/** 默认插槽的载荷：选择器的开合与两端、内嵌范围日历的展示数据、两组段位，以及改写值的句柄。 */
export type DateRangePickerRootSlotProps
  = & Pick<
    DateRangePickerApi,
    | 'open'
    | 'value'
    | 'start'
    | 'end'
    | 'periodValue'
    | 'focusedValue'
    | 'canClear'
    | 'setOpen'
    | 'setValue'
    | 'clear'
  >
  & Pick<
    CalendarRangePickerApi,
    | 'visibleMonth'
    | 'panels'
    | 'periods'
    | 'weeks'
    | 'weekDays'
    | 'headingLabel'
    | 'canGoPrev'
    | 'canGoNext'
  >
  & {
    /** 起点组段位。 */
    segments: DateFieldSegmentState[]
    /** 终点组段位。 */
    endSegments: DateFieldSegmentState[]
  }

/** 段位默认插槽的载荷：本段的投影；下标越界时缺席。 */
export interface DateRangePickerSegmentSlotProps {
  segment: DateFieldSegmentState | undefined
}

/** 快捷选项列默认插槽的载荷：逐条的投影，作者据此自行铺设条目。 */
export interface DateRangePickerPresetsSlotProps {
  presets: readonly DateRangePickerPresetState[]
}

export const XhDateRangePickerRoot = defineComponent({
  name: 'XhDateRangePickerRoot',
  // 有 connect / machine 兜底的 prop：普通类型省略 default，Boolean 显式保留 undefined
  props: {
    /** 区间两端 [start, end]；空缺的一端用空串占位。 */
    value: { type: Array as PropType<string[]> },
    defaultValue: { type: Array as PropType<string[]> },
    open: { type: Boolean, default: undefined },
    defaultOpen: Boolean,
    min: { type: String },
    max: { type: String },
    locale: { type: String },
    timeZone: { type: String },
    /** 选择粒度；两组输入行铺设哪几段也跟随它。 */
    granularity: { type: String as PropType<CalendarGranularity> },
    /** 面板当前所处的层级；给定即受控，默认跟随 granularity。 */
    activeView: { type: String as PropType<CalendarView> },
    /** 输入行铺设哪几段；未提供时按 granularity 推导。 */
    segments: { type: Array as PropType<DateSegmentSet> },
    /** 并排展示几页；默认 1，起止常跨月时可设为 2。 */
    visibleCount: { type: Number },
    /** 日历恒渲染六行，默认开启。关闭后翻页时浮层高度会随月份变化。 */
    fixedWeeks: { type: Boolean, default: undefined },
    /** 初始聚焦日，同时决定展开时先落在哪一页；未提供时退回起点，再退回今天。 */
    defaultFocusedValue: { type: String },
    /** 快捷选项；提供后浮层中多出一列，日期要在自己的 computed 中计算后再传入。 */
    presets: { type: Array as PropType<DateRangePickerPreset[]> },
    isDateUnavailable: { type: Function as PropType<(value: string, anchor: string | null) => boolean> },
    /** 允许跨过不可用的日期；默认关闭，落下起点后只能选到两侧最近的不可用日为止。 */
    allowsNonContiguousRanges: { type: Boolean, default: undefined },
    disabled: { type: Boolean, default: undefined },
    readOnly: { type: Boolean, default: undefined },
    invalid: { type: Boolean, default: undefined },
    required: { type: Boolean, default: undefined },
    name: { type: String },
    // 终点那份隐藏输入的表单名；不给即终点不参与提交
    endName: { type: String },
    // 两组段位各自的读屏名字与快捷选项列的名字
    translations: { type: Object as PropType<DateRangePickerProps['translations']> },
    variant: { type: String as PropType<ControlVariant> },
    tone: { type: String as PropType<Tone> },
    size: { type: String as PropType<Size> },
    placement: { type: String as PropType<Placement> },
    offset: { type: Number },
    /** 文字方向；浮层迁移到落点后无法继承作者子树上的方向，需要 RTL 时显式提供。 */
    dir: { type: String as PropType<Direction> },
    closeOnSelect: { type: Boolean, default: undefined },
  },
  // *-change 携带 details 对象，update:* 携带裸值；值恒为 [start, end]，只填了终点时是 ['', end]
  emits: {
    'value-change': (_details: PayloadOf<DateRangePickerProps, 'onValueChange'>) => true,
    'open-change': (_details: PayloadOf<DateRangePickerProps, 'onOpenChange'>) => true,
    'focused-value-change': (_details: PayloadOf<DateRangePickerProps, 'onFocusedValueChange'>) => true,
    'active-view-change': (_details: PayloadOf<DateRangePickerProps, 'onActiveViewChange'>) => true,
    'update:value': (_value: PayloadOf<DateRangePickerProps, 'onValueChange'>['value']) => true,
    'update:open': (_open: PayloadOf<DateRangePickerProps, 'onOpenChange'>['open']) => true,
    'update:activeView': (_view: PayloadOf<DateRangePickerProps, 'onActiveViewChange'>['activeView']) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: DateRangePickerRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const rootRef = ref<HTMLElement | null>(null)
    const notifyValue: DateRangePickerProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const notifyOpen: DateRangePickerProps['onOpenChange'] = (details) => {
      emit('open-change', details)
      emit('update:open', details.open)
    }
    // 聚焦日只对外播报，不提供 v-model
    const notifyFocus: DateRangePickerProps['onFocusedValueChange'] = details => emit('focused-value-change', details)
    const notifyActiveView: DateRangePickerProps['onActiveViewChange'] = (details) => {
      emit('active-view-change', details)
      emit('update:activeView', details.activeView)
    }
    const ctx = useDateRangePickerWithRoot(withXhConfig('date-range-picker', useFormControlProps(props)) as DateRangePickerProps, {
      onValueChange: notifyValue,
      onOpenChange: notifyOpen,
      onFocusedValueChange: notifyFocus,
      onActiveViewChange: notifyActiveView,
    }, rootRef)
    provideDateRangePicker(ctx)
    // 网格与段位由作者照插槽里的 weeks / segments 自行渲染
    return () => h('div', { ...ctx.api.value.getRootProps() as Record<string, unknown>, ref: rootRef }, slots.default?.({
      open: ctx.api.value.open,
      value: ctx.api.value.value,
      start: ctx.api.value.start,
      end: ctx.api.value.end,
      periodValue: ctx.api.value.periodValue,
      focusedValue: ctx.api.value.focusedValue,
      visibleMonth: ctx.api.value.calendar.visibleMonth,
      panels: ctx.api.value.calendar.panels,
      periods: ctx.api.value.calendar.periods,
      weeks: ctx.api.value.calendar.weeks,
      weekDays: ctx.api.value.calendar.weekDays,
      headingLabel: ctx.api.value.calendar.headingLabel,
      canGoPrev: ctx.api.value.calendar.canGoPrev,
      canGoNext: ctx.api.value.calendar.canGoNext,
      segments: ctx.api.value.field.segments,
      endSegments: ctx.api.value.fieldEnd.segments,
      canClear: ctx.api.value.canClear,
      setOpen: ctx.api.value.setOpen,
      setValue: ctx.api.value.setValue,
      clear: ctx.api.value.clear,
    }))
  },
})

export const XhDateRangePickerLabel = defineComponent({
  name: 'XhDateRangePickerLabel',
  setup(_, { slots }) {
    const ctx = useDateRangePickerContext()
    // 渲染为 span 而非 label，点击聚焦由连接层接管
    return () => h('span', ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhDateRangePickerControl = defineComponent({
  name: 'XhDateRangePickerControl',
  setup(_, { slots }) {
    const ctx = useDateRangePickerContext()
    return () => h('div', {
      ...ctx.api.value.getControlProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.controlRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhDateRangePickerSegmentGroup = defineComponent({
  name: 'XhDateRangePickerSegmentGroup',
  props: {
    // 组号：0 起点、1 终点，兼收字符串以支持模板里写 index="1"
    index: { type: [Number, String] as PropType<number | string>, default: 0 },
  },
  setup(props, { slots }) {
    const ctx = useDateRangePickerContext()
    const index = computed<0 | 1>(() => resolveDateRangePickerFieldIndex(props.index))
    // 组内的段位与隐藏输入据此认领起止
    provideDateRangePickerSegmentGroup({ index })
    // role=group 的分段容器，也是换段时的查询边界
    return () => h(
      'div',
      ctx.api.value.getSegmentGroupProps({ index: index.value }) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

export const XhDateRangePickerSegment = defineComponent({
  name: 'XhDateRangePickerSegment',
  props: {
    // 段位下标，兼收字符串以支持模板里写 index="0"
    index: { type: [Number, String] as PropType<number | string> },
    /** 按段名声明该格。段集中没有该段时它收起；与 index 二选一，两个都写时按段名计算。 */
    segment: { type: String as PropType<DateSegmentType> },
  },
  slots: Object as SlotsType<{
    default?: (props: DateRangePickerSegmentSlotProps) => VNode[]
  }>,
  setup(props, { slots }) {
    const ctx = useDateRangePickerContext()
    const group = useDateRangePickerSegmentGroupContext()
    return () => {
      const field = dateRangePickerFieldAt(ctx.api.value, group.index.value)
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

export const XhDateRangePickerRangeSeparator = defineComponent({
  name: 'XhDateRangePickerRangeSeparator',
  setup(_, { slots }) {
    const ctx = useDateRangePickerContext()
    return () => h(
      'span',
      ctx.api.value.getRangeSeparatorProps() as Record<string, unknown>,
      slots.default?.() ?? '-',
    )
  },
})

export const XhDateRangePickerClearTrigger = defineComponent({
  name: 'XhDateRangePickerClearTrigger',
  setup(_, { slots }) {
    const ctx = useDateRangePickerContext()
    return () => h('button', ctx.api.value.getClearTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhDateRangePickerTrigger = defineComponent({
  name: 'XhDateRangePickerTrigger',
  setup(_, { slots }) {
    // 字段的说明与校验状态要落在真控件上，不能停在封装根的 div 上
    const fieldWiring = useFieldStateWiring()
    // 字段的标签也得并进名字链：控件自带的那条指的是它自己那个没渲染的 label 部件
    const fieldLabel = useFieldLabelWiring()
    const ctx = useDateRangePickerContext()
    return () => h('button', fieldLabel.value({ ...fieldWiring.value, ...ctx.api.value.getTriggerProps() as Record<string, unknown> }), slots.default?.())
  },
})

export const XhDateRangePickerPositioner = defineComponent({
  name: 'XhDateRangePickerPositioner',
  props: {
    /** 本实例的 Portal 容器；优先于应用级配置。 */
    container: { type: Object as PropType<Element> },
  },
  // 根是 Teleport，Vue 不会把直通属性合上去，作者写的 class 与 style 得自己接住落到 positioner 上
  inheritAttrs: false,
  setup(props, { slots, attrs }) {
    const ctx = useDateRangePickerContext()
    // 浮层面板的自绘条：与 content 同级、绝对定位不占布局，壳是这层已经 fixed 的 positioner；
    // 面板皮肤两轴都滚，条子走浮层 4px 档
    const bars = useScrollbars({
      scrollable: () => ctx.contentRef.value,
      scope: ctx.services.root.scope,
      axes: ['vertical', 'horizontal'],
      props: () => ({ dir: (ctx.api.value.getPositionerProps() as { dir?: Direction }).dir, size: 'sm' }),
    })
    // 搬到 portal 落点：留在原地的话，宿主祖先只要建了层叠上下文就能盖住浮层
    return () => {
      const target = props.container ?? ctx.portalTarget.value
      return h(XhPortal, {
        to: target,
        source: ctx.controlRef,
        // SSR 与客户端首帧都还没有真实 root：保持同一原地结构，绑定 Scope 后再搬运。
        disabled: props.container == null && typeof target === 'string',
      }, () => [
        h('div', {
          ...mergeProps(ctx.api.value.getPositionerProps() as Record<string, unknown>, attrs),
          ref: (el: unknown) => { ctx.positionerRef.value = el as HTMLElement },
        }, [...(slots.default?.() ?? []), ...bars.render()]),
      ])
    }
  },
})

export const XhDateRangePickerContent = defineComponent({
  name: 'XhDateRangePickerContent',
  setup(_, { slots }) {
    const ctx = useDateRangePickerContext()
    return () => h('div', {
      ...ctx.api.value.getContentProps() as Record<string, unknown>,
      // 收起跟着退场闸门走：皮肤刻意没给 content 补 [hidden]{display:none}（补了退场
      // 就一帧都播不出来），所以真正的收起落成内联 display——节点始终留在原地
      style: ctx.visible.value ? undefined : { display: 'none' },
      ref: (el: unknown) => { ctx.contentRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

// 以下是内嵌范围日历的角色节点，DOM 上带 data-scope="calendar-range-picker"，行为取自本组件持有的日历机器

export const XhDateRangePickerCalendar = defineComponent({
  name: 'XhDateRangePickerCalendar',
  props: {
    /** 并排的第几张面板，默认 0。写在这里，面板内的标题、网格与格子就不必各写一遍。 */
    index: { type: [Number, String], default: 0 },
  },
  setup(props, { slots }) {
    const ctx = useDateRangePickerContext()
    provideDateRangePickerPanel({ index: usePanelIndex(props) })
    // 内嵌日历的挂载点，同时是日历的根节点
    return () => h('div', ctx.api.value.getCalendarProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhDateRangePickerPresetGroup = defineComponent({
  name: 'XhDateRangePickerPresetGroup',
  slots: Object as SlotsType<{
    /** 自行铺设条目；未写时按 presets 数据自动铺设，两者产出的 DOM 一致。 */
    default?: (props: DateRangePickerPresetsSlotProps) => VNode[]
  }>,
  // 根是片段（选项列节点 + 贴层的条子），Vue 不会把直通属性合上去：作者写的 class、style 与 data-* 自己接住落到列节点上
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    const ctx = useDateRangePickerContext()
    const presetGroupRef = ref<HTMLElement | null>(null)
    // 快捷选项列自己滚（窄视口横排横滚、宽视口竖排竖滚）：两轴的条子贴在它的盒子上、紧跟在它后面
    const bars = useScrollbars({
      scrollable: () => presetGroupRef.value,
      anchor: 'layer',
      axes: ['vertical', 'horizontal'],
      props: () => ({ dir: (ctx.api.value.getPositionerProps() as { dir?: Direction }).dir, size: 'sm' }),
    })
    onUpdated(() => bars.measure())
    return () => {
      const api = ctx.api.value
      const authored = slots.default?.({ presets: api.presets })
      return [
        h(
          'div',
          {
            ...mergeProps(api.getPresetGroupProps() as Record<string, unknown>, attrs),
            ref: (el: unknown) => { presetGroupRef.value = el as HTMLElement },
          },
          slotPaints(authored)
            ? authored
            : api.presets.map(preset => h(
                'div',
                { ...api.getPresetProps({ value: preset.value }) as Record<string, unknown>, key: preset.value },
                preset.label,
              )),
        ),
        ...bars.render(),
      ]
    }
  },
})

export const XhDateRangePickerPreset = defineComponent({
  name: 'XhDateRangePickerPreset',
  props: {
    /** 该条目的身份，与 presets 数据中的 value 逐字对应。 */
    value: { type: String, required: true },
  },
  slots: Object as SlotsType<{
    /** 条目内容；未写时使用数据中的 label。 */
    default?: () => VNode[]
  }>,
  setup(props, { slots }) {
    const ctx = useDateRangePickerContext()
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

export const XhDateRangePickerHeader = defineComponent({
  name: 'XhDateRangePickerHeader',
  setup(_, { slots }) {
    const ctx = useDateRangePickerContext()
    return () => h('div', ctx.api.value.calendar.getHeaderProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhDateRangePickerPrevYearTrigger = defineComponent({
  name: 'XhDateRangePickerPrevYearTrigger',
  setup(_, { slots }) {
    const ctx = useDateRangePickerContext()
    return () => h('button', ctx.api.value.calendar.getPrevYearTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhDateRangePickerPrevTrigger = defineComponent({
  name: 'XhDateRangePickerPrevTrigger',
  setup(_, { slots }) {
    const ctx = useDateRangePickerContext()
    return () => h('button', ctx.api.value.calendar.getPrevTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhDateRangePickerNextTrigger = defineComponent({
  name: 'XhDateRangePickerNextTrigger',
  setup(_, { slots }) {
    const ctx = useDateRangePickerContext()
    return () => h('button', ctx.api.value.calendar.getNextTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhDateRangePickerNextYearTrigger = defineComponent({
  name: 'XhDateRangePickerNextYearTrigger',
  setup(_, { slots }) {
    const ctx = useDateRangePickerContext()
    return () => h('button', ctx.api.value.calendar.getNextYearTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhDateRangePickerHeading = defineComponent({
  name: 'XhDateRangePickerHeading',
  props: {
    /** 属于第几个面板；未写时跟随所在的日历。 */
    index: { type: [Number, String] },
  },
  setup(props, { slots }) {
    const ctx = useDateRangePickerContext()
    const index = usePanelIndex(props)
    // 有插槽用插槽，否则渲染本面板的标题
    return () => h(
      'div',
      ctx.api.value.calendar.getHeadingProps({ index: index.value }) as Record<string, unknown>,
      slots.default?.() ?? (ctx.api.value.calendar.panels[index.value]?.headingLabel ?? ctx.api.value.calendar.headingLabel),
    )
  },
})

export const XhDateRangePickerHeadingYearTrigger = defineComponent({
  name: 'XhDateRangePickerHeadingYearTrigger',
  props: {
    /** 属于第几个面板；未写时跟随所在的日历。 */
    index: { type: [Number, String] },
  },
  setup(props, { slots }) {
    const ctx = useDateRangePickerContext()
    const index = usePanelIndex(props)
    // 有插槽用插槽，否则渲染标题里年那一截；年视图下它是整个十年跨度
    return () => h(
      'button',
      ctx.api.value.calendar.getHeadingYearTriggerProps({ index: index.value }) as Record<string, unknown>,
      slots.default?.() ?? ctx.api.value.calendar.panels[index.value]?.headingYear,
    )
  },
})

export const XhDateRangePickerHeadingMonthTrigger = defineComponent({
  name: 'XhDateRangePickerHeadingMonthTrigger',
  props: {
    /** 属于第几个面板；未写时跟随所在的日历。 */
    index: { type: [Number, String] },
  },
  setup(props, { slots }) {
    const ctx = useDateRangePickerContext()
    const index = usePanelIndex(props)
    return () => h(
      'button',
      ctx.api.value.calendar.getHeadingMonthTriggerProps({ index: index.value }) as Record<string, unknown>,
      slots.default?.() ?? ctx.api.value.calendar.panels[index.value]?.headingMonth,
    )
  },
})

export const XhDateRangePickerGrid = defineComponent({
  name: 'XhDateRangePickerGrid',
  props: {
    /** 属于第几个面板；未写时跟随所在的日历。 */
    index: { type: [Number, String] },
  },
  setup(props, { slots }) {
    const ctx = useDateRangePickerContext()
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

export const XhDateRangePickerGridHead = defineComponent({
  name: 'XhDateRangePickerGridHead',
  setup(_, { slots }) {
    const ctx = useDateRangePickerContext()
    return () => h('div', ctx.api.value.calendar.getGridHeadProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhDateRangePickerGridBody = defineComponent({
  name: 'XhDateRangePickerGridBody',
  setup(_, { slots }) {
    const ctx = useDateRangePickerContext()
    return () => h('div', ctx.api.value.calendar.getGridBodyProps() as Record<string, unknown>, slots.default?.())
  },
})

// 表头行与日期行共用同一个 role=row
export const XhDateRangePickerWeekRow = defineComponent({
  name: 'XhDateRangePickerWeekRow',
  setup(_, { slots }) {
    const ctx = useDateRangePickerContext()
    return () => h('div', ctx.api.value.calendar.getWeekRowProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhDateRangePickerWeekNumber = defineComponent({
  name: 'XhDateRangePickerWeekNumber',
  props: {
    /** 该行行首那一天的 ISO 串。 */
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useDateRangePickerContext()
    // 有插槽用插槽，否则显示这一行的周序号
    return () => h(
      'span',
      ctx.api.value.calendar.getWeekNumberProps({ value: props.value }) as Record<string, unknown>,
      slots.default?.() ?? ctx.api.value.calendar.getWeekNumberText({ value: props.value }),
    )
  },
})

export const XhDateRangePickerWeekDay = defineComponent({
  name: 'XhDateRangePickerWeekDay',
  props: {
    // 列序 0-6，兼收字符串
    value: { type: [Number, String] as PropType<number | string>, required: true },
  },
  setup(props, { slots }) {
    const ctx = useDateRangePickerContext()
    const index = computed(() => Number(props.value))
    return () => h(
      'span',
      ctx.api.value.calendar.getWeekDayProps({ value: index.value }) as Record<string, unknown>,
      slots.default?.() ?? ctx.api.value.calendar.weekDays[index.value]?.label,
    )
  },
})

export const XhDateRangePickerCell = defineComponent({
  name: 'XhDateRangePickerCell',
  props: {
    /** ISO 日期串。 */
    value: { type: String, required: true },
    /**
     * 属于第几个面板；未写时跟随所在的日历。同一天会同时出现在两个面板中
     * （8 月末的几天也铺在 9 月的首行），是否为本月只有连同面板一起看才能判定。
     */
    index: { type: [Number, String] },
  },
  setup(props, { slots }) {
    const ctx = useDateRangePickerContext()
    const index = usePanelIndex(props)
    const cell = computed<CalendarCellProps>(() => ({ value: props.value, index: index.value }))
    provideDateRangePickerCell({ cell })
    // 不上报格子卸载，翻月后由日历机器按聚焦日重新落点
    return () => h('div', ctx.api.value.calendar.getCellProps(cell.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhDateRangePickerCellTrigger = defineComponent({
  name: 'XhDateRangePickerCellTrigger',
  setup(_, { slots }) {
    const ctx = useDateRangePickerContext()
    const { cell } = useDateRangePickerCellContext()
    return () => h(
      'div',
      ctx.api.value.calendar.getCellTriggerProps(cell.value) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

export const XhDateRangePickerHiddenInput = defineComponent({
  name: 'XhDateRangePickerHiddenInput',
  props: {
    // 写在分段容器外面时用它指明属于哪一端；写在容器里面不必给，跟着容器走
    index: { type: [Number, String] as PropType<number | string> },
  },
  setup(props) {
    const ctx = useDateRangePickerContext()
    const group = useDateRangePickerSegmentGroupContext()
    return () => {
      const index = props.index === undefined ? group.index.value : resolveDateRangePickerFieldIndex(props.index)
      return h('input', dateRangePickerFieldAt(ctx.api.value, index).getHiddenInputProps() as Record<string, unknown>)
    }
  },
})
