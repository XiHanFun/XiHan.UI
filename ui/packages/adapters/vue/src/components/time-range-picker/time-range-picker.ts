/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 time range picker 相关实现。

import type { ControlVariant, Direction, Placement, Size, Tone } from '@xihan-ui/core'
import type {
  TimeGranularity,
  TimeHourCycle,
  TimePickerColumn,
  TimePickerColumnUnit,
  TimeRangePickerApi,
  TimeRangePickerEndIndex,
  TimeRangePickerPreset,
  TimeRangePickerPresetState,
  TimeRangePickerSchema,
  TimeSegmentType,
} from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { resolveTimeRangePickerEndIndex } from '@xihan-ui/headless'
import { computed, defineComponent, h, mergeProps, onUpdated, ref } from 'vue'
import { withXhConfig } from '../../config/config'
import { XhPortal } from '../../runtime/portal'
import { slotPaints } from '../../runtime/slot-content'
import { useScrollbars } from '../../runtime/use-scrollbars'
import { useFieldLabelWiring, useFieldStateWiring } from '../field/use-field-control'
import { useFormControlProps } from '../form/use-form-control'
import {
  provideTimeRangePicker,
  provideTimeRangePickerColumn,
  provideTimeRangePickerEnd,
  useTimeRangePickerColumnContext,
  useTimeRangePickerContext,
  useTimeRangePickerEndContext,
} from './context'
import { useTimeRangePicker } from './use-time-range-picker'

type TimeRangePickerProps = TimeRangePickerSchema['props']

/** 默认插槽的载荷：浮层开合与两端、值状态标志、当前的段与两组时列，以及开合、写值、清空的动作。 */
export type TimeRangePickerRootSlotProps = Pick<
  TimeRangePickerApi,
  | 'open'
  | 'value'
  | 'start'
  | 'end'
  | 'empty'
  | 'outOfRange'
  | 'reversed'
  | 'segments'
  | 'columnGroups'
  | 'canClear'
  | 'setOpen'
  | 'setValue'
  | 'clear'
>

/** 时列外壳默认插槽的载荷：该端当前应排列的列。 */
export interface TimeRangePickerColumnGroupSlotProps {
  columns: readonly TimePickerColumn[]
}

/** 默认插槽的载荷：该列当前的可选值。 */
export interface TimeRangePickerColumnSlotProps {
  options: TimePickerColumn['options']
}

/** 快捷选项列默认插槽的载荷：逐条的投影，作者据此自行铺设条目。 */
export interface TimeRangePickerPresetsSlotProps {
  presets: readonly TimeRangePickerPresetState[]
}

export const XhTimeRangePickerRoot = defineComponent({
  name: 'XhTimeRangePickerRoot',
  // 缺省值由 connect 给出；普通类型省略 default，Boolean 显式保留 undefined
  props: {
    /** 区间两端 [start, end]；空缺的一端用空串占位。 */
    value: { type: Array as PropType<string[]> },
    defaultValue: { type: Array as PropType<string[]> },
    open: { type: Boolean, default: undefined },
    defaultOpen: Boolean,
    min: { type: String },
    max: { type: String },
    locale: { type: String },
    hourCycle: { type: Number as PropType<TimeHourCycle> },
    granularity: { type: String as PropType<TimeGranularity> },
    step: { type: Number },
    /** 快捷选项；提供后浮层中多出一列，时刻要在自己的 computed 中计算后再传入。 */
    presets: { type: Array as PropType<TimeRangePickerPreset[]> },
    disabled: { type: Boolean, default: undefined },
    // 两组段位与时列各自的读屏名字
    translations: { type: Object as PropType<TimeRangePickerProps['translations']> },
    isTimeUnavailable: { type: Function as PropType<(value: string, unit: TimePickerColumnUnit, index: TimeRangePickerEndIndex) => boolean> },
    readOnly: { type: Boolean, default: undefined },
    invalid: { type: Boolean, default: undefined },
    required: { type: Boolean, default: undefined },
    name: { type: String },
    // 终点那份隐藏输入的表单名；不给即终点不参与提交
    endName: { type: String },
    variant: { type: String as PropType<ControlVariant> },
    tone: { type: String as PropType<Tone> },
    size: { type: String as PropType<Size> },
    placement: { type: String as PropType<Placement> },
    offset: { type: Number },
    /** 文字方向；浮层迁移到落点后无法继承作者子树上的方向，需要 RTL 时显式提供。 */
    dir: { type: String as PropType<Direction> },
  },
  // *-change 携带 details 对象，update:* 携带裸值；值恒为 [start, end]，只填了终点时是 ['', end]
  emits: {
    'value-change': (_details: PayloadOf<TimeRangePickerProps, 'onValueChange'>) => true,
    'open-change': (_details: PayloadOf<TimeRangePickerProps, 'onOpenChange'>) => true,
    'update:value': (_value: PayloadOf<TimeRangePickerProps, 'onValueChange'>['value']) => true,
    'update:open': (_open: PayloadOf<TimeRangePickerProps, 'onOpenChange'>['open']) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: TimeRangePickerRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notifyValue: TimeRangePickerProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const notifyOpen: TimeRangePickerProps['onOpenChange'] = (details) => {
      emit('open-change', details)
      emit('update:open', details.open)
    }
    const ctx = useTimeRangePicker(withXhConfig('time-range-picker', useFormControlProps(props)) as TimeRangePickerProps, {
      onValueChange: notifyValue,
      onOpenChange: notifyOpen,
    })
    provideTimeRangePicker(ctx)

    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      open: ctx.api.value.open,
      value: ctx.api.value.value,
      start: ctx.api.value.start,
      end: ctx.api.value.end,
      empty: ctx.api.value.empty,
      outOfRange: ctx.api.value.outOfRange,
      reversed: ctx.api.value.reversed,
      segments: ctx.api.value.segments,
      columnGroups: ctx.api.value.columnGroups,
      canClear: ctx.api.value.canClear,
      setOpen: ctx.api.value.setOpen,
      setValue: ctx.api.value.setValue,
      clear: ctx.api.value.clear,
    }))
  },
})

export const XhTimeRangePickerLabel = defineComponent({
  name: 'XhTimeRangePickerLabel',
  setup(_, { slots }) {
    const ctx = useTimeRangePickerContext()
    // 仍用原生 label 保持表单语义，点标题聚焦第一段由连接层的 click 接管
    return () => h('label', ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTimeRangePickerControl = defineComponent({
  name: 'XhTimeRangePickerControl',
  setup(_, { slots }) {
    const ctx = useTimeRangePickerContext()
    return () => h('div', {
      ...ctx.api.value.getControlProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.controlRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhTimeRangePickerSegmentGroup = defineComponent({
  name: 'XhTimeRangePickerSegmentGroup',
  props: {
    // 端号：0 起点、1 终点，兼收字符串以支持模板里写 index="1"
    index: { type: [Number, String] as PropType<number | string>, default: 0 },
  },
  setup(props, { slots }) {
    const ctx = useTimeRangePickerContext()
    const index = computed<TimeRangePickerEndIndex>(() => resolveTimeRangePickerEndIndex(props.index))
    // 组内的段位据此认领起止
    provideTimeRangePickerEnd({ index })
    return () => h('div', ctx.api.value.getSegmentGroupProps({ index: index.value }) as Record<string, unknown>, slots.default?.())
  },
})

export const XhTimeRangePickerSegment = defineComponent({
  name: 'XhTimeRangePickerSegment',
  props: {
    // 段的身份由作者声明；属于哪一端跟着所在的段位容器走
    segment: { type: String as PropType<TimeSegmentType>, required: true },
  },
  setup(props, { slots }) {
    const ctx = useTimeRangePickerContext()
    const end = useTimeRangePickerEndContext()
    // 有插槽用插槽，否则显示该段的文字，空段为占位串
    return () => h(
      'span',
      ctx.api.value.getSegmentProps({ index: end.index.value, segment: props.segment }) as Record<string, unknown>,
      slots.default?.() ?? ctx.api.value.getSegmentText({ index: end.index.value, segment: props.segment }),
    )
  },
})

export const XhTimeRangePickerRangeSeparator = defineComponent({
  name: 'XhTimeRangePickerRangeSeparator',
  setup(_, { slots }) {
    const ctx = useTimeRangePickerContext()
    return () => h(
      'span',
      ctx.api.value.getRangeSeparatorProps() as Record<string, unknown>,
      slots.default?.() ?? '-',
    )
  },
})

export const XhTimeRangePickerTrigger = defineComponent({
  name: 'XhTimeRangePickerTrigger',
  setup(_, { slots }) {
    // 字段的说明与校验状态要落在真控件上，不能停在封装根的 div 上
    const fieldWiring = useFieldStateWiring()
    // 字段的标签也得并进名字链：控件自带的那条指的是它自己那个没渲染的 label 部件
    const fieldLabel = useFieldLabelWiring()
    const ctx = useTimeRangePickerContext()
    return () => h('button', fieldLabel.value({
      ...fieldWiring.value,
      ...ctx.api.value.getTriggerProps() as Record<string, unknown>,
      // 归还焦点要落到它身上：锚点取的是整个输入行，那一层不可聚焦
      ref: (el: unknown) => { ctx.triggerRef.value = el as HTMLElement },
    }), slots.default?.())
  },
})

export const XhTimeRangePickerClearTrigger = defineComponent({
  name: 'XhTimeRangePickerClearTrigger',
  setup(_, { slots }) {
    const ctx = useTimeRangePickerContext()
    return () => h('button', ctx.api.value.getClearTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTimeRangePickerPositioner = defineComponent({
  name: 'XhTimeRangePickerPositioner',
  props: {
    /** 本实例的 Portal 容器；优先于应用级配置。 */
    container: { type: Object as PropType<Element> },
  },
  // 根是 Teleport，Vue 不会把直通属性合上去，作者写的 class 与 style 得自己接住落到 positioner 上
  inheritAttrs: false,
  setup(props, { slots, attrs }) {
    const ctx = useTimeRangePickerContext()
    // 浮层面板的自绘条：两组时列并排放不下时面板整体横滚，横条与 content 同级挂在已经 fixed 的 positioner 上，
    // 条子走浮层 4px 档；各列自己竖滚的条子贴在列上、挂在 content 里
    const bars = useScrollbars({
      scrollable: () => ctx.contentRef.value,
      axes: ['horizontal'],
      props: () => ({ dir: (ctx.api.value.getPositionerProps() as { dir?: Direction }).dir, size: 'sm' }),
    })
    // 搬到 portal 落点：留在原地的话，宿主祖先只要建了层叠上下文就能盖住浮层
    return () => h(XhPortal, { to: props.container ?? ctx.portalTarget.value, source: ctx.controlRef }, () => [
      h('div', {
        ...mergeProps(ctx.api.value.getPositionerProps() as Record<string, unknown>, attrs),
        ref: (el: unknown) => { ctx.positionerRef.value = el as HTMLElement },
      }, [...(slots.default?.() ?? []), ...bars.render()]),
    ])
  },
})

export const XhTimeRangePickerContent = defineComponent({
  name: 'XhTimeRangePickerContent',
  setup(_, { slots }) {
    const ctx = useTimeRangePickerContext()
    return () => h('div', {
      ...ctx.api.value.getContentProps() as Record<string, unknown>,
      // 收起跟着退场闸门走：皮肤刻意没给 content 补 [hidden]{display:none}（补了退场
      // 就一帧都播不出来），所以真正的收起落成内联 display——节点始终留在原地
      style: ctx.visible.value ? undefined : { display: 'none' },
      ref: (el: unknown) => { ctx.contentRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhTimeRangePickerPresetGroup = defineComponent({
  name: 'XhTimeRangePickerPresetGroup',
  slots: Object as SlotsType<{
    /** 自行铺设条目；未写时按 presets 数据自动铺设，两者产出的 DOM 一致。 */
    default?: (props: TimeRangePickerPresetsSlotProps) => VNode[]
  }>,
  // 根是片段（选项列节点 + 贴层的条子），Vue 不会把直通属性合上去：作者写的 class、style 与 data-* 自己接住落到列节点上
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    const ctx = useTimeRangePickerContext()
    const presetGroupRef = ref<HTMLElement | null>(null)
    // 快捷选项列定高自己竖滚：条子贴在它的盒子上、紧跟在它后面（浮层 4px 档）
    const bars = useScrollbars({
      scrollable: () => presetGroupRef.value,
      anchor: 'layer',
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

export const XhTimeRangePickerPreset = defineComponent({
  name: 'XhTimeRangePickerPreset',
  props: {
    /** 该条目的身份，与 presets 数据中的 value 逐字对应。 */
    value: { type: String, required: true },
  },
  slots: Object as SlotsType<{
    /** 条目内容；未写时使用数据中的 label。 */
    default?: () => VNode[]
  }>,
  setup(props, { slots }) {
    const ctx = useTimeRangePickerContext()
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

export const XhTimeRangePickerColumnGroup = defineComponent({
  name: 'XhTimeRangePickerColumnGroup',
  props: {
    // 端号：0 起点、1 终点，兼收字符串以支持模板里写 index="1"
    index: { type: [Number, String] as PropType<number | string>, default: 0 },
  },
  slots: Object as SlotsType<{
    default?: (props: TimeRangePickerColumnGroupSlotProps) => VNode[]
  }>,
  setup(props, { slots }) {
    const ctx = useTimeRangePickerContext()
    const index = computed<TimeRangePickerEndIndex>(() => resolveTimeRangePickerEndIndex(props.index))
    // 组内的小标题、列与选项据此认领起止
    provideTimeRangePickerEnd({ index })
    return () => h(
      'div',
      ctx.api.value.getColumnGroupProps({ index: index.value }) as Record<string, unknown>,
      slots.default?.({ columns: ctx.api.value.columnGroups[index.value].columns }),
    )
  },
})

export const XhTimeRangePickerColumnGroupLabel = defineComponent({
  name: 'XhTimeRangePickerColumnGroupLabel',
  setup(_, { slots }) {
    const ctx = useTimeRangePickerContext()
    const end = useTimeRangePickerEndContext()
    return () => h('div', ctx.api.value.getColumnGroupLabelProps({ index: end.index.value }) as Record<string, unknown>, slots.default?.())
  },
})

export const XhTimeRangePickerColumn = defineComponent({
  name: 'XhTimeRangePickerColumn',
  props: {
    unit: { type: String as PropType<TimePickerColumnUnit>, required: true },
  },
  slots: Object as SlotsType<{
    default?: (props: TimeRangePickerColumnSlotProps) => VNode[]
  }>,
  // 根是片段（列节点 + 贴层的条子），Vue 不会把直通属性合上去：作者写的 class、style 与 data-* 自己接住落到列节点上
  inheritAttrs: false,
  setup(props, { slots, attrs }) {
    const ctx = useTimeRangePickerContext()
    const end = useTimeRangePickerEndContext()
    const unit = computed(() => props.unit)
    // 下传单位，供列内选项取到自己归哪一列
    provideTimeRangePickerColumn({ unit })
    const columnRef = ref<HTMLElement | null>(null)
    // 定高的时间列自己竖滚：条子贴在本列的盒子上、紧跟在它后面（浮层 4px 档）
    const bars = useScrollbars({
      scrollable: () => columnRef.value,
      anchor: 'layer',
      props: () => ({ dir: (ctx.api.value.getPositionerProps() as { dir?: Direction }).dir, size: 'sm' }),
    })
    onUpdated(() => bars.measure())
    return () => [
      h(
        'div',
        {
          ...mergeProps(ctx.api.value.getColumnProps({ index: end.index.value, unit: props.unit }) as Record<string, unknown>, attrs),
          ref: (el: unknown) => { columnRef.value = el as HTMLElement },
        },
        slots.default?.({ options: ctx.api.value.columnGroups[end.index.value].columns.find(c => c.unit === props.unit)?.options ?? [] }),
      ),
      ...bars.render(),
    ]
  },
})

export const XhTimeRangePickerItem = defineComponent({
  name: 'XhTimeRangePickerItem',
  props: {
    /** 两位补零的显示串（'09' / '30'）；上下午列写 '00' / '01'。 */
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useTimeRangePickerContext()
    const end = useTimeRangePickerEndContext()
    const { unit } = useTimeRangePickerColumnContext()
    // 有插槽用插槽，否则显示这一格该显示的文字（上下午列按 locale 译成「上午 / 下午」）
    return () => h(
      'div',
      ctx.api.value.getItemProps({ index: end.index.value, unit: unit.value, value: props.value }) as Record<string, unknown>,
      slots.default?.() ?? ctx.api.value.getItemText({ unit: unit.value, value: props.value }),
    )
  },
})

export const XhTimeRangePickerHiddenInput = defineComponent({
  name: 'XhTimeRangePickerHiddenInput',
  props: {
    // 写在段位容器外面时用它指明属于哪一端；写在容器里面不必给，跟着容器走
    index: { type: [Number, String] as PropType<number | string> },
  },
  setup(props) {
    const ctx = useTimeRangePickerContext()
    const end = useTimeRangePickerEndContext()
    return () => {
      const index = props.index === undefined ? end.index.value : resolveTimeRangePickerEndIndex(props.index)
      return h('input', ctx.api.value.getHiddenInputProps({ index }) as Record<string, unknown>)
    }
  },
})
