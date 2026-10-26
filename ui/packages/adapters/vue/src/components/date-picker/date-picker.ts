/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 date picker 相关实现。

import type { ControlVariant, Direction, Placement, Size, Tone } from '@xihan-ui/core'
import type {
  CalendarCellProps,
  CalendarGranularity,
  CalendarPickerApi,
  CalendarPickerSelectionMode,
  CalendarView,
  DateFieldSegmentState,
  DatePickerApi,
  DatePickerPreset,
  DatePickerPresetState,
  DatePickerSchema,
  DatePickerTimeUnit,
  DateSegmentPlaceholders,
  DateSegmentSet,
  DateSegmentType,
  TimeHourCycle,
  TimeStep,
  TimeUnavailablePredicate,
} from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey, PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { datePickerStructure, resolveDatePickerPanelIndex } from '@xihan-ui/headless'
import { computed, defineComponent, h, inject, mergeProps, onUnmounted, onUpdated, provide, ref } from 'vue'
import { withXhConfig } from '../../config/config'
import { XhPortal } from '../../runtime/portal'
import { slotIsPlainText, slotPaints } from '../../runtime/slot-content'
import { renderStructure } from '../../runtime/structure'
import { useOverlayScrollbars } from '../../runtime/use-overlay-scrollbars'
import { withHandlers } from '../../runtime/with-handlers'
import { useFieldGroupWiring, useFieldLabelWiring } from '../field/use-field-control'
import { useFormControlProps } from '../form/use-form-control'
import {
  provideDatePicker,
  provideDatePickerCell,
  provideDatePickerPanel,
  provideDatePickerTag,
  useDatePickerCellContext,
  useDatePickerContext,
  useDatePickerPanelContext,
  useDatePickerTagContext,
} from './context'
import { useDatePickerWithRoot } from './use-date-picker'

type DatePickerProps = DatePickerSchema['props']

/**
 * 部件属于并排的第几张面板：自己写了即按自己写的，未写时跟随所在的日历。
 * 兼收字符串以支持模板中写 index="1"。
 */
function usePanelIndex(props: { index?: number | string }): ComputedRef<number> {
  const panel = useDatePickerPanelContext()
  return computed(() => resolveDatePickerPanelIndex(props.index, panel.index.value))
}

/** 默认插槽的载荷：选择器的开合与选中值、内嵌日历的展示数据、段位，以及改写值的句柄。 */
export type DatePickerRootSlotProps
  = & Pick<
    DatePickerApi,
    | 'open'
    | 'value'
    | 'valueAsString'
    | 'periodValue'
    | 'focusedValue'
    | 'canClear'
    | 'setOpen'
    | 'setValue'
    | 'clear'
  >
  & Pick<
    CalendarPickerApi,
    | 'visibleMonth'
    | 'panels'
    | 'periods'
    | 'rows'
    | 'weeks'
    | 'weekDays'
    | 'headingLabel'
    | 'canGoPrev'
    | 'canGoNext'
  >
  & {
    segments: DateFieldSegmentState[]
  }

/** 段位默认插槽的载荷：本段的投影；下标越界时缺席。 */
export interface DatePickerSegmentSlotProps {
  segment: DateFieldSegmentState | undefined
}

/** 快捷选项列默认插槽的载荷：逐条的投影，作者据此自行铺设条目。 */
export interface DatePickerPresetsSlotProps {
  presets: readonly DatePickerPresetState[]
}

export const XhDatePickerRoot = defineComponent({
  name: 'XhDatePickerRoot',
  // 有 connect / machine 兜底的 prop：普通类型省略 default，Boolean 显式保留 undefined
  props: {
    /** 不显示出来的名字，写成 aria-label 落在与字段标签同一个部件上；放进字段或渲染了 label 部件时以它们为准。 */
    ariaLabel: { type: String },
    /** 标题文字：不写默认插槽时铺带这段文字的 label 部件；需要放置其他内容时改用 label 插槽。 */
    label: { type: String },
    value: { type: [String, Array] as PropType<string | string[]> },
    defaultValue: { type: [String, Array] as PropType<string | string[]> },
    open: { type: Boolean, default: undefined },
    defaultOpen: Boolean,
    min: { type: String },
    max: { type: String },
    locale: { type: String },
    /** 周首日，0 = 星期日 … 6 = 星期六；不给按 locale。只改日历的表头、行首与 Home / End，月份名与星期名仍按 locale。 */
    firstDayOfWeek: { type: Number },
    timeZone: { type: String },
    selectionMode: { type: String as PropType<CalendarPickerSelectionMode> },
    /** multiple 下最多选几个周期；选满后日历里没选中的格子不可再加选，已选的仍可点掉。 */
    maxSelected: { type: Number },
    /** 多选时输入行最多摆几枚标签，其余折进 +N 那一枚；默认 3。 */
    maxTagCount: { type: Number },
    /** 选择粒度；与 selectionMode 正交，输入行铺设哪几段也跟随它。 */
    granularity: { type: String as PropType<CalendarGranularity> },
    /** 面板当前所处的层级；给定即受控，默认跟随 granularity。 */
    activeView: { type: String as PropType<CalendarView> },
    /** 输入行铺设哪几段；未提供时按 granularity 推导。 */
    segments: { type: Array as PropType<DateSegmentSet> },
    /** 占位。字符串是整条占位：一段都没填、焦点也不在段上时输入行显示这句文字，焦点进到段上即换回段位；对象是逐段的占位串，覆盖内置的 yyyy / mm / dd。 */
    placeholder: { type: [String, Object] as PropType<string | DateSegmentPlaceholders> },
    /** 并排展示几页；默认 1。 */
    visibleCount: { type: Number },
    /** 日历恒渲染六行，默认开启。关闭后翻页时浮层高度会随月份变化。 */
    fixedWeeks: { type: Boolean, default: undefined },
    /** 初始聚焦日，同时决定展开时先落在哪一页；未提供时退回首个选中值，再退回今天。 */
    defaultFocusedValue: { type: String },
    /** 快捷选项；提供后浮层中多出一列，日期要在自己的 computed 中计算后再传入。 */
    presets: { type: Array as PropType<DatePickerPreset[]> },
    isDateUnavailable: { type: Function as PropType<(value: string) => boolean> },
    disabled: { type: Boolean, default: undefined },
    readOnly: { type: Boolean, default: undefined },
    invalid: { type: Boolean, default: undefined },
    required: { type: Boolean, default: undefined },
    name: { type: String },
    translations: { type: Object as PropType<DatePickerProps['translations']> },
    variant: { type: String as PropType<ControlVariant> },
    tone: { type: String as PropType<Tone> },
    size: { type: String as PropType<Size> },
    placement: { type: String as PropType<Placement> },
    offset: { type: Number },
    /** 文字方向；浮层迁移到落点后无法继承作者子树上的方向，需要 RTL 时显式提供。 */
    dir: { type: String as PropType<Direction> },
    closeOnSelect: { type: Boolean, default: undefined },
    showTime: { type: Boolean, default: undefined },
    timeGranularity: { type: String as PropType<DatePickerSchema['props']['timeGranularity']> },
    /** showTime 的小时制，默认 24；12 时多出上下午列与上下午段。 */
    hourCycle: { type: Number as PropType<TimeHourCycle> },
    /** showTime 时间列按单位的步进：`{ hour?, minute?, second? }`。 */
    timeStep: { type: Object as PropType<TimeStep> },
    /** showTime 时间列的逐格可选性：时列按 24 小时制给值，第三个参数带已选的时分与所属日期。 */
    isTimeUnavailable: { type: Function as PropType<TimeUnavailablePredicate> },
  },
  // *-change 携带 details 对象，update:* 携带裸值；选中值恒为数组，单选时长度 ≤ 1
  emits: {
    'clear': () => true,
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
    /** 不写默认插槽时标题的内容，盖过 label 文字。 */
    label?: () => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const rootRef = ref<HTMLElement | null>(null)
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
    const ctx = useDatePickerWithRoot(withHandlers(withXhConfig('date-picker', useFormControlProps(props)), { onClear: () => emit('clear') }) as DatePickerProps, {
      onValueChange: notifyValue,
      onOpenChange: notifyOpen,
      onFocusedValueChange: notifyFocus,
      onActiveViewChange: notifyActiveView,
    }, rootRef)
    provideDatePicker(ctx)
    // 写了默认插槽时网格与段位由作者照插槽里的 weeks（日视图）/ rows（周期视图）/ segments 自行渲染；
    // 没写时照 datePickerStructure 铺整套结构
    return () => h('div', { ...ctx.api.value.getRootProps(), ref: rootRef }, !slots.default
      ? renderDefaultStructure(ctx.api.value, props.label, slots.label)
      : slots.default({
          open: ctx.api.value.open,
          value: ctx.api.value.value,
          valueAsString: ctx.api.value.valueAsString,
          periodValue: ctx.api.value.periodValue,
          focusedValue: ctx.api.value.focusedValue,
          visibleMonth: ctx.api.value.calendar.visibleMonth,
          panels: ctx.api.value.calendar.panels,
          periods: ctx.api.value.calendar.periods,
          rows: ctx.api.value.calendar.rows,
          weeks: ctx.api.value.calendar.weeks,
          weekDays: ctx.api.value.calendar.weekDays,
          headingLabel: ctx.api.value.calendar.headingLabel,
          canGoPrev: ctx.api.value.calendar.canGoPrev,
          canGoNext: ctx.api.value.calendar.canGoNext,
          segments: ctx.api.value.field.segments,
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
    // 渲出来就登记，在 setup 里同步做：排在输入之前时首帧与服务端直出就带上名字
    ctx.labelCount.value++
    onUnmounted(() => {
      ctx.labelCount.value--
    })
    // 渲染为 span 而非 label，点击聚焦由连接层接管
    return () => h('span', ctx.api.value.getLabelProps(), slots.default?.())
  },
})

export const XhDatePickerControl = defineComponent({
  name: 'XhDatePickerControl',
  setup(_, { slots }) {
    const ctx = useDatePickerContext()
    return () => h('div', {
      ...ctx.api.value.getControlProps(),
      ref: (el: unknown) => { ctx.controlRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

/** 标签文字所在的块（tag 的 label）：截断规则挂在这一层。 */
export const XhDatePickerTagLabel = defineComponent({
  name: 'XhDatePickerTagLabel',
  setup(_, { slots }) {
    const ctx = useDatePickerContext()
    return () => h('span', ctx.api.value.getTagLabelProps(), slots.default?.())
  },
})

/**
 * 标签内容：只有文字时替它包一层 label：截断规则挂在 label 上，直接展开在 root 上的文字过长会把
 * 删除按钮挤出；作者自己写了节点则原样放行。库自身填入的文字（+N）恒包 label，三个适配器渲染出同一棵树。
 */
function tagChildren(content: VNode[] | string | undefined): VNode[] | string | undefined {
  if (typeof content === 'string')
    return [h(XhDatePickerTagLabel, null, () => content)]
  return slotIsPlainText(content) ? [h(XhDatePickerTagLabel, null, () => content)] : content
}

/** 标签中的删除按钮：即所在标签那份 tag 的 close-trigger，可及名使用 translations.deleteItem；点按摘掉所在标签的选中值，焦点不动。 */
export const XhDatePickerItemDeleteTrigger = defineComponent({
  name: 'XhDatePickerItemDeleteTrigger',
  setup(_, { slots }) {
    const ctx = useDatePickerContext()
    const tag = useDatePickerTagContext()
    return () => h('button', ctx.api.value.getItemDeleteTriggerProps({ value: tag.value() }), slots.default?.())
  },
})

/** 多选时一个选中值一个标签，即库内 tag 的 root（data-scope="tag"）：语气、尺寸与禁用从日期选择器传下，形态按盒的面派生。 */
export const XhDatePickerTag = defineComponent({
  name: 'XhDatePickerTag',
  props: {
    /** 它代表哪个选中值。 */
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useDatePickerContext()
    provideDatePickerTag({ value: () => props.value })
    return () => h('span', ctx.api.value.getTagProps({ value: props.value }), tagChildren(slots.default?.()))
  },
})

/** 折叠的标签合成的一个标签：同样是 tag 的 root；有插槽时使用插槽，否则显示 +N。没有折叠的标签时连接层写 hidden。 */
export const XhDatePickerOverflowTag = defineComponent({
  name: 'XhDatePickerOverflowTag',
  setup(_, { slots }) {
    const ctx = useDatePickerContext()
    return () => h(
      'span',
      ctx.api.value.getOverflowTagProps(),
      tagChildren(slots.default?.() ?? ctx.api.value.overflowText),
    )
  },
})

/**
 * 标签行：多选时放在盒里、触发钮之前；没有选中时承载整条占位，单选时连接层给 hidden。
 * 不写插槽即按 tags 铺出带删除钮的标签与 +N 那一枚，写了插槽由作者自己铺。
 */
export const XhDatePickerTagList = defineComponent({
  name: 'XhDatePickerTagList',
  setup(_, { slots }) {
    const ctx = useDatePickerContext()
    return () => h('span', ctx.api.value.getTagListProps(), slots.default
      ? slots.default()
      : [
          ...ctx.api.value.tags.map(tag => h(XhDatePickerTag, { key: tag.value, value: tag.value }, () => [
            h(XhDatePickerTagLabel, null, () => tag.label),
            h(XhDatePickerItemDeleteTrigger),
          ])),
          h(XhDatePickerOverflowTag),
        ])
  },
})

export const XhDatePickerSegmentGroup = defineComponent({
  name: 'XhDatePickerSegmentGroup',
  setup(_, { slots }) {
    const ctx = useDatePickerContext()
    // role=group 的分段容器，也是换段时的查询边界
    return () => h('div', ctx.api.value.getSegmentGroupProps(), slots.default?.())
  },
})

export const XhDatePickerSegment = defineComponent({
  name: 'XhDatePickerSegment',
  props: {
    // 段位下标，兼收字符串以支持模板里写 index="0"
    index: { type: [Number, String] as PropType<number | string> },
    /** 按段名声明该格。段集中没有该段时它收起；与 index 二选一，两个都写时按段名计算。 */
    segment: { type: String as PropType<DateSegmentType> },
  },
  slots: Object as SlotsType<{
    default?: (props: DatePickerSegmentSlotProps) => VNode[]
  }>,
  setup(props, { slots }) {
    const ctx = useDatePickerContext()
    return () => {
      const { field } = ctx.api.value
      // 落点由连接层算：按下标还是按段名是同一条路，适配器这边不重写一份
      const declared = props.segment != null
        ? { segment: props.segment }
        : { index: Math.trunc(Number(props.index)) }
      const state = field.segmentOf(declared)
      // 有插槽用插槽，否则渲染连接层算好的段位文本
      return h(
        'div',
        field.getSegmentProps(declared),
        slots.default ? slots.default({ segment: state }) : state?.text,
      )
    }
  },
})

export const XhDatePickerClearTrigger = defineComponent({
  name: 'XhDatePickerClearTrigger',
  setup(_, { slots }) {
    const ctx = useDatePickerContext()
    return () => h('button', ctx.api.value.getClearTriggerProps(), slots.default?.())
  },
})

export const XhDatePickerTrigger = defineComponent({
  name: 'XhDatePickerTrigger',
  setup(_, { slots }) {
    // 放进字段时字段的说明与错误文案接到触发钮上；按钮不收 aria-required / aria-readonly，只取描述链，
    // 只读、必填与校验状态由各段自己按字段状态投影
    const fieldWiring = useFieldGroupWiring()
    // 字段的标签也得并进名字链：控件自带的那条指的是它自己那个没渲染的 label 部件
    const fieldLabel = useFieldLabelWiring()
    const ctx = useDatePickerContext()
    return () => h('button', fieldLabel.value({ ...fieldWiring.value, ...ctx.api.value.getTriggerProps() }), slots.default?.())
  },
})

export const XhDatePickerPositioner = defineComponent({
  name: 'XhDatePickerPositioner',
  props: {
    /** 本实例的 Portal 容器；优先于应用级配置。 */
    container: { type: Object as PropType<Element> },
  },
  // 根是 Teleport，Vue 不会把直通属性合上去，作者写的 class 与 style 得自己接住落到 positioner 上
  inheritAttrs: false,
  setup(props, { slots, attrs }) {
    const ctx = useDatePickerContext()
    // 浮层面板的自绘条：与 content 同级、绝对定位不占布局，壳是这层已经 fixed 的 positioner；
    // 面板两轴都滚（日历保持天然宽度），条子走浮层 4px 档
    const bars = useOverlayScrollbars({
      present: () => ctx.visible.value,
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
        present: ctx.visible.value,
        // SSR 与客户端首帧都还没有真实 root：保持同一原地结构，绑定 Scope 后再搬运。
        disabled: props.container == null && typeof target === 'string',
      }, () => [
        h('div', {
          ...mergeProps(ctx.api.value.getPositionerProps(), attrs),
          ref: (el: unknown) => { ctx.positionerRef.value = el as HTMLElement },
        }, [...(slots.default?.() ?? []), ...bars.render()]),
      ])
    }
  },
})

export const XhDatePickerContent = defineComponent({
  name: 'XhDatePickerContent',
  setup(_, { slots }) {
    const ctx = useDatePickerContext()
    return () => h('div', {
      ...ctx.api.value.getContentProps(),
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
    return () => h('div', ctx.api.value.getCalendarProps(), slots.default?.())
  },
})

export const XhDatePickerPresetGroup = defineComponent({
  name: 'XhDatePickerPresetGroup',
  slots: Object as SlotsType<{
    /** 自行铺设条目；未写时按 presets 数据自动铺设，两者产出的 DOM 一致。 */
    default?: (props: DatePickerPresetsSlotProps) => VNode[]
  }>,
  // 根是片段（选项列节点 + 贴层的条子），Vue 不会把直通属性合上去：作者写的 class、style 与 data-* 自己接住落到列节点上
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    const ctx = useDatePickerContext()
    const presetGroupRef = ref<HTMLElement | null>(null)
    // 快捷选项列自己滚（窄视口横排横滚、宽视口竖排竖滚）：两轴的条子贴在它的盒子上、紧跟在它后面
    const bars = useOverlayScrollbars({
      present: () => ctx.visible.value,
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
            ...mergeProps(api.getPresetGroupProps(), attrs),
            ref: (el: unknown) => { presetGroupRef.value = el as HTMLElement },
          },
          slotPaints(authored)
            ? authored
            : api.presets.map(preset => h(
                'div',
                { ...api.getPresetProps({ value: preset.value }), key: preset.value },
                preset.label,
              )),
        ),
        ...bars.render(),
      ]
    }
  },
})

export const XhDatePickerPreset = defineComponent({
  name: 'XhDatePickerPreset',
  props: {
    /** 该条目的身份，与 presets 数据中的 value 逐字对应。 */
    value: { type: String, required: true },
  },
  slots: Object as SlotsType<{
    /** 条目内容；未写时使用数据中的 label。 */
    default?: () => VNode[]
  }>,
  setup(props, { slots }) {
    const ctx = useDatePickerContext()
    return () => {
      const api = ctx.api.value
      const authored = slots.default?.()
      return h(
        'div',
        api.getPresetProps({ value: props.value }),
        slotPaints(authored) ? authored : api.presets.find(p => p.value === props.value)?.label,
      )
    }
  },
})

/** 时间项所在那一列的单位，由 XhDatePickerTimeColumn 提供。 */
const DATE_PICKER_TIME_UNIT: InjectionKey<() => DatePickerTimeUnit> = Symbol('XhDatePickerTimeUnit')

/** 一格时间选项：value 写两位补零的值（上下午列写 '00' / '01'）；没写内容时显示按 locale 译好的文字。要放在 XhDatePickerTimeColumn 里。 */
export const XhDatePickerTimeItem = defineComponent({
  name: 'XhDatePickerTimeItem',
  props: {
    /** 这一格的值，与时间列的可选值逐字对应。 */
    value: { type: String, required: true },
  },
  slots: Object as SlotsType<{
    /** 格里的内容；未写时显示按 locale 译好的文字。 */
    default?: () => VNode[]
  }>,
  setup(props, { slots }) {
    const ctx = useDatePickerContext()
    const unit = inject(DATE_PICKER_TIME_UNIT, null)
    if (!unit)
      throw new Error('[xh] XhDatePickerTimeItem 要放在 XhDatePickerTimeColumn 里')
    return () => {
      const api = ctx.api.value
      const item = { unit: unit(), value: props.value }
      const authored = slots.default?.()
      return h('div', api.getTimeItemProps(item), slotPaints(authored) ? authored : api.getTimeItemText(item))
    }
  },
})

/**
 * 一列时间选项连同贴在它盒子上的竖条：每列一台滚动条机器。不写默认插槽时按这一列的可选值铺 XhDatePickerTimeItem；
 * 这一单位不在当前精度里（如没开秒）时整列不渲染。
 */
export const XhDatePickerTimeColumn = defineComponent({
  name: 'XhDatePickerTimeColumn',
  props: {
    /** 这一列的单位：hour、minute、second 或 dayPeriod。 */
    unit: { type: String as PropType<DatePickerTimeUnit>, required: true },
  },
  slots: Object as SlotsType<{
    /** 自行铺 XhDatePickerTimeItem；未写时按这一列的可选值自动铺。 */
    default?: () => VNode[]
  }>,
  setup(props, { slots }) {
    const ctx = useDatePickerContext()
    provide(DATE_PICKER_TIME_UNIT, () => props.unit)
    const timeColumnRef = ref<HTMLElement | null>(null)
    // 定高的时间列自己竖滚：条子贴在本列的盒子上、紧跟在它后面（浮层 4px 档）
    const bars = useOverlayScrollbars({
      present: () => ctx.visible.value,
      scrollable: () => timeColumnRef.value,
      anchor: 'layer',
      props: () => ({ dir: (ctx.api.value.getPositionerProps() as { dir?: Direction }).dir, size: 'sm' }),
    })
    onUpdated(() => bars.measure())
    return () => {
      const api = ctx.api.value
      const column = api.timeColumns.find(item => item.unit === props.unit)
      if (!column)
        return null
      return [
        h(
          'div',
          {
            ...api.getTimeColumnProps({ unit: column.unit }),
            ref: (el: unknown) => { timeColumnRef.value = el as HTMLElement },
          },
          slots.default?.() ?? column.options.map(option => h(XhDatePickerTimeItem, { key: option, value: option })),
        ),
        ...bars.render(),
      ]
    }
  },
})

export const XhDatePickerTimePanel = defineComponent({
  name: 'XhDatePickerTimePanel',
  setup() {
    const ctx = useDatePickerContext()
    // 时间列整组自动铺：时/分[/秒][/上下午]各一列，选项点按写值；没开 showTime 时整组带 hidden
    return () => ctx.api.value.timeColumns.map(column =>
      h(XhDatePickerTimeColumn, { unit: column.unit, key: column.unit }),
    )
  },
})

export const XhDatePickerConfirmTrigger = defineComponent({
  name: 'XhDatePickerConfirmTrigger',
  setup(_, { slots }) {
    const ctx = useDatePickerContext()
    return () => h('button', ctx.api.value.getConfirmTriggerProps(), slots.default?.())
  },
})

export const XhDatePickerFooter = defineComponent({
  name: 'XhDatePickerFooter',
  setup(_, { slots }) {
    const ctx = useDatePickerContext()
    // 浮层底部的通栏操作区：写在 content 里、排在面板主体之后，确认钮通常放在这里；
    // 不进任何集合的拥有关系，方向键走不到，里面的按钮照常进 Tab 序列
    return () => h('div', ctx.api.value.getFooterProps(), slots.default?.())
  },
})

export const XhDatePickerHeader = defineComponent({
  name: 'XhDatePickerHeader',
  setup(_, { slots }) {
    const ctx = useDatePickerContext()
    return () => h('div', ctx.api.value.calendar.getHeaderProps(), slots.default?.())
  },
})

export const XhDatePickerPrevYearTrigger = defineComponent({
  name: 'XhDatePickerPrevYearTrigger',
  setup(_, { slots }) {
    const ctx = useDatePickerContext()
    return () => h('button', ctx.api.value.calendar.getPrevYearTriggerProps(), slots.default?.())
  },
})

export const XhDatePickerPrevTrigger = defineComponent({
  name: 'XhDatePickerPrevTrigger',
  setup(_, { slots }) {
    const ctx = useDatePickerContext()
    return () => h('button', ctx.api.value.calendar.getPrevTriggerProps(), slots.default?.())
  },
})

export const XhDatePickerNextTrigger = defineComponent({
  name: 'XhDatePickerNextTrigger',
  setup(_, { slots }) {
    const ctx = useDatePickerContext()
    return () => h('button', ctx.api.value.calendar.getNextTriggerProps(), slots.default?.())
  },
})

export const XhDatePickerNextYearTrigger = defineComponent({
  name: 'XhDatePickerNextYearTrigger',
  setup(_, { slots }) {
    const ctx = useDatePickerContext()
    return () => h('button', ctx.api.value.calendar.getNextYearTriggerProps(), slots.default?.())
  },
})

export const XhDatePickerHeading = defineComponent({
  name: 'XhDatePickerHeading',
  props: {
    /** 属于第几个面板；未写时跟随所在的日历。 */
    index: { type: [Number, String] },
  },
  setup(props, { slots }) {
    const ctx = useDatePickerContext()
    const index = usePanelIndex(props)
    // 有插槽用插槽，否则渲染本面板的标题
    return () => h(
      'div',
      ctx.api.value.calendar.getHeadingProps({ index: index.value }),
      slots.default?.() ?? (ctx.api.value.calendar.panels[index.value]?.headingLabel ?? ctx.api.value.calendar.headingLabel),
    )
  },
})

export const XhDatePickerHeadingYearTrigger = defineComponent({
  name: 'XhDatePickerHeadingYearTrigger',
  props: {
    /** 属于第几个面板；未写时跟随所在的日历。 */
    index: { type: [Number, String] },
  },
  setup(props, { slots }) {
    const ctx = useDatePickerContext()
    const index = usePanelIndex(props)
    // 有插槽用插槽，否则渲染标题里年那一截；年视图下它是整个十年跨度
    return () => h(
      'button',
      ctx.api.value.calendar.getHeadingYearTriggerProps({ index: index.value }),
      slots.default?.() ?? ctx.api.value.calendar.panels[index.value]?.headingYear,
    )
  },
})

export const XhDatePickerHeadingMonthTrigger = defineComponent({
  name: 'XhDatePickerHeadingMonthTrigger',
  props: {
    /** 属于第几个面板；未写时跟随所在的日历。 */
    index: { type: [Number, String] },
  },
  setup(props, { slots }) {
    const ctx = useDatePickerContext()
    const index = usePanelIndex(props)
    return () => h(
      'button',
      ctx.api.value.calendar.getHeadingMonthTriggerProps({ index: index.value }),
      slots.default?.() ?? ctx.api.value.calendar.panels[index.value]?.headingMonth,
    )
  },
})

export const XhDatePickerGrid = defineComponent({
  name: 'XhDatePickerGrid',
  props: {
    /** 属于第几个面板；未写时跟随所在的日历。 */
    index: { type: [Number, String] },
  },
  setup(props, { slots }) {
    const ctx = useDatePickerContext()
    const index = usePanelIndex(props)
    return () => h(
      'div',
      {
        ...ctx.api.value.calendar.getGridProps({ index: index.value }),
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
    return () => h('div', ctx.api.value.calendar.getGridHeadProps(), slots.default?.())
  },
})

export const XhDatePickerGridBody = defineComponent({
  name: 'XhDatePickerGridBody',
  setup(_, { slots }) {
    const ctx = useDatePickerContext()
    return () => h('div', ctx.api.value.calendar.getGridBodyProps(), slots.default?.())
  },
})

// 表头行与日期行共用同一个 role=row
export const XhDatePickerWeekRow = defineComponent({
  name: 'XhDatePickerWeekRow',
  setup(_, { slots }) {
    const ctx = useDatePickerContext()
    return () => h('div', ctx.api.value.calendar.getWeekRowProps(), slots.default?.())
  },
})

export const XhDatePickerWeekNumber = defineComponent({
  name: 'XhDatePickerWeekNumber',
  props: {
    /** 该行行首那一天的 ISO 串。 */
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useDatePickerContext()
    // 有插槽用插槽，否则显示这一行的周序号
    return () => h(
      'span',
      ctx.api.value.calendar.getWeekNumberProps({ value: props.value }),
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
      ctx.api.value.calendar.getWeekDayProps({ value: index.value }),
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
     * 属于第几个面板；未写时跟随所在的日历。同一天会同时出现在两个面板中
     * （8 月末的几天也铺在 9 月的首行），是否为本月只有连同面板一起看才能判定。
     */
    index: { type: [Number, String] },
  },
  setup(props, { slots }) {
    const ctx = useDatePickerContext()
    const index = usePanelIndex(props)
    const cell = computed<CalendarCellProps>(() => ({ value: props.value, index: index.value }))
    provideDatePickerCell({ cell })
    // 不上报格子卸载，翻月后由日历机器按聚焦日重新落点
    return () => h('div', ctx.api.value.calendar.getCellProps(cell.value), slots.default?.())
  },
})

export const XhDatePickerCellTrigger = defineComponent({
  name: 'XhDatePickerCellTrigger',
  setup(_, { slots }) {
    const ctx = useDatePickerContext()
    const { cell } = useDatePickerCellContext()
    return () => h(
      'div',
      ctx.api.value.calendar.getCellTriggerProps(cell.value),
      slots.default?.(),
    )
  },
})

export const XhDatePickerHiddenInput = defineComponent({
  name: 'XhDatePickerHiddenInput',
  setup() {
    const ctx = useDatePickerContext()
    // 多选时一个选中值一份同名输入，表单按原生多值收；单选仍是一份
    return () => ctx.api.value.selectionMode === 'multiple'
      ? ctx.api.value.value.map(value => h('input', { key: value, ...ctx.api.value.field.getHiddenInputProps({ value }) }))
      : h('input', ctx.api.value.field.getHiddenInputProps())
  },
})

/** 结构里的部件 → 部件组件；委派出去的部件按「组件名/部件名」查。 */
const DATE_PICKER_PARTS = {
  'label': XhDatePickerLabel,
  'control': XhDatePickerControl,
  'tag-list': XhDatePickerTagList,
  'segment-group': XhDatePickerSegmentGroup,
  'trigger': XhDatePickerTrigger,
  'clear-trigger': XhDatePickerClearTrigger,
  'positioner': XhDatePickerPositioner,
  'content': XhDatePickerContent,
  'preset-group': XhDatePickerPresetGroup,
  'preset': XhDatePickerPreset,
  'calendar': XhDatePickerCalendar,
  'time-column': XhDatePickerTimeColumn,
  'time-item': XhDatePickerTimeItem,
  'footer': XhDatePickerFooter,
  'confirm-trigger': XhDatePickerConfirmTrigger,
  'date-field/segment': XhDatePickerSegment,
  'date-field/hidden-input': XhDatePickerHiddenInput,
  'tag/tag': XhDatePickerTag,
  'tag/tag-label': XhDatePickerTagLabel,
  'tag/item-delete-trigger': XhDatePickerItemDeleteTrigger,
  'tag/overflow-tag': XhDatePickerOverflowTag,
  'calendar-picker/header': XhDatePickerHeader,
  'calendar-picker/prev-year-trigger': XhDatePickerPrevYearTrigger,
  'calendar-picker/prev-trigger': XhDatePickerPrevTrigger,
  'calendar-picker/heading': XhDatePickerHeading,
  'calendar-picker/heading-year-trigger': XhDatePickerHeadingYearTrigger,
  'calendar-picker/heading-month-trigger': XhDatePickerHeadingMonthTrigger,
  'calendar-picker/next-trigger': XhDatePickerNextTrigger,
  'calendar-picker/next-year-trigger': XhDatePickerNextYearTrigger,
  'calendar-picker/grid': XhDatePickerGrid,
  'calendar-picker/grid-head': XhDatePickerGridHead,
  'calendar-picker/week-row': XhDatePickerWeekRow,
  'calendar-picker/week-day': XhDatePickerWeekDay,
  'calendar-picker/grid-body': XhDatePickerGridBody,
  'calendar-picker/cell': XhDatePickerCell,
  'calendar-picker/cell-trigger': XhDatePickerCellTrigger,
}

/**
 * 未写默认插槽时照 datePickerStructure 铺开的整套结构，与 Web Components 不写部件时元素生成的节点出自同一份。
 * 标题文字由 label 给出，需要放置其他内容时由 label 插槽接管。
 */
function renderDefaultStructure(api: DatePickerApi, label: string | undefined, labelSlot?: () => VNode[]): VNode[] {
  const nodes = datePickerStructure(api, { label, slotted: name => name === 'label' && labelSlot != null })
  return renderStructure(nodes, DATE_PICKER_PARTS, node => node.slot?.name === 'label' ? labelSlot?.() : undefined)
}
