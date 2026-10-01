/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 time picker 相关实现。

import type { ControlVariant, Direction, Placement, Size, Tone } from '@xihan-ui/core'
import type {
  TimeGranularity,
  TimeHourCycle,
  TimePickerApi,
  TimePickerColumn,
  TimePickerColumnUnit,
  TimePickerPreset,
  TimePickerPresetState,
  TimePickerSchema,
  TimePickerSelectionMode,
  TimeSegmentType,
  TimeStep,
  TimeUnavailablePredicate,
} from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { computed, defineComponent, h, mergeProps, onUpdated, ref } from 'vue'
import { withXhConfig } from '../../config/config'
import { XhPortal } from '../../runtime/portal'
import { slotIsPlainText, slotPaints } from '../../runtime/slot-content'
import { useScrollbars } from '../../runtime/use-scrollbars'
import { withHandlers } from '../../runtime/with-handlers'
import { useFieldLabelWiring, useFieldStateWiring } from '../field/use-field-control'
import { useFormControlProps } from '../form/use-form-control'
import {
  provideTimePicker,
  provideTimePickerColumn,
  provideTimePickerTag,
  useTimePickerColumnContext,
  useTimePickerContext,
  useTimePickerTagContext,
} from './context'
import { useTimePicker } from './use-time-picker'

type TimePickerProps = TimePickerSchema['props']

/** 默认插槽的载荷：浮层开合与当前值、值状态标志、当前的段与列，以及开合、写值、清空的动作。 */
export type TimePickerRootSlotProps = Pick<
  TimePickerApi,
  | 'open'
  | 'value'
  | 'empty'
  | 'outOfRange'
  | 'segments'
  | 'columns'
  | 'canClear'
  | 'canAdd'
  | 'setOpen'
  | 'setValue'
  | 'clear'
  | 'add'
>

/** 默认插槽的载荷：该列当前的可选值。 */
export interface TimePickerColumnSlotProps {
  options: TimePickerColumn['options']
}

/** 快捷选项列默认插槽的载荷：逐条的投影，作者据此自行铺设条目。 */
export interface TimePickerPresetsSlotProps {
  presets: readonly TimePickerPresetState[]
}

export const XhTimePickerRoot = defineComponent({
  name: 'XhTimePickerRoot',
  // 缺省值由 connect 给出；普通类型省略 default，Boolean 显式保留 undefined
  props: {
    /** 选中的时刻，ISO 时间串数组；单选可写裸串。 */
    value: { type: [String, Array] as PropType<string | string[]> },
    defaultValue: { type: [String, Array] as PropType<string | string[]> },
    /** 选择模式，默认 single；multiple 时列上拼草稿、按「添加」收进值，输入行里排成标签。 */
    selectionMode: { type: String as PropType<TimePickerSelectionMode> },
    /** multiple 下最多选几个时刻。 */
    maxSelected: { type: Number },
    /** 多选时输入行最多摆几枚标签，其余折进 +N 那一枚；默认 3。 */
    maxTagCount: { type: Number },
    open: { type: Boolean, default: undefined },
    defaultOpen: Boolean,
    min: { type: String },
    max: { type: String },
    locale: { type: String },
    hourCycle: { type: Number as PropType<TimeHourCycle> },
    granularity: { type: String as PropType<TimeGranularity> },
    /** 按单位的步进：`{ hour?, minute?, second? }`，各单位缺省 1。 */
    timeStep: { type: Object as PropType<TimeStep> },
    /** 快捷选项；提供后浮层中多出一列，时刻要在自己的 computed 中计算后再传入。 */
    presets: { type: Array as PropType<TimePickerPreset[]> },
    disabled: { type: Boolean, default: undefined },
    translations: { type: Object as PropType<TimePickerProps['translations']> },
    /** 逐格可选性：时列按 24 小时制给值，第三个参数带已选的时与分。 */
    isTimeUnavailable: { type: Function as PropType<TimeUnavailablePredicate> },
    readOnly: { type: Boolean, default: undefined },
    invalid: { type: Boolean, default: undefined },
    required: { type: Boolean, default: undefined },
    name: { type: String },
    variant: { type: String as PropType<ControlVariant> },
    tone: { type: String as PropType<Tone> },
    size: { type: String as PropType<Size> },
    placement: { type: String as PropType<Placement> },
    offset: { type: Number },
    /** 文字方向；浮层迁移到落点后无法继承作者子树上的方向，需要 RTL 时显式提供。 */
    dir: { type: String as PropType<Direction> },
  },
  // *-change 携带 details 对象，update:* 携带裸值
  emits: {
    'clear': () => true,
    'value-change': (_details: PayloadOf<TimePickerProps, 'onValueChange'>) => true,
    'open-change': (_details: PayloadOf<TimePickerProps, 'onOpenChange'>) => true,
    'update:value': (_value: PayloadOf<TimePickerProps, 'onValueChange'>['value']) => true,
    'update:open': (_open: PayloadOf<TimePickerProps, 'onOpenChange'>['open']) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: TimePickerRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notifyValue: TimePickerProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const notifyOpen: TimePickerProps['onOpenChange'] = (details) => {
      emit('open-change', details)
      emit('update:open', details.open)
    }
    const ctx = useTimePicker(withHandlers(withXhConfig('time-picker', useFormControlProps(props)), { onClear: () => emit('clear') }) as TimePickerProps, {
      onValueChange: notifyValue,
      onOpenChange: notifyOpen,
    })
    provideTimePicker(ctx)

    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      open: ctx.api.value.open,
      value: ctx.api.value.value,
      empty: ctx.api.value.empty,
      outOfRange: ctx.api.value.outOfRange,
      segments: ctx.api.value.segments,
      columns: ctx.api.value.columns,
      canClear: ctx.api.value.canClear,
      canAdd: ctx.api.value.canAdd,
      setOpen: ctx.api.value.setOpen,
      setValue: ctx.api.value.setValue,
      clear: ctx.api.value.clear,
      add: ctx.api.value.add,
    }))
  },
})

export const XhTimePickerLabel = defineComponent({
  name: 'XhTimePickerLabel',
  setup(_, { slots }) {
    const ctx = useTimePickerContext()
    // 仍用原生 label 保持表单语义，点标题聚焦第一段由连接层的 click 接管
    return () => h('label', ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTimePickerControl = defineComponent({
  name: 'XhTimePickerControl',
  setup(_, { slots }) {
    const ctx = useTimePickerContext()
    return () => h('div', {
      ...ctx.api.value.getControlProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.controlRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

/** 标签文字所在的块（tag 的 label）。 */
export const XhTimePickerTagLabel = defineComponent({
  name: 'XhTimePickerTagLabel',
  setup(_, { slots }) {
    const ctx = useTimePickerContext()
    return () => h('span', ctx.api.value.getTagLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

/** 标签内容：只有文字时替它包一层 label；作者自己写了节点则原样放行。库自身填入的文字（+N）恒包 label。 */
function tagChildren(content: VNode[] | string | undefined): VNode[] | string | undefined {
  if (typeof content === 'string')
    return [h(XhTimePickerTagLabel, null, () => content)]
  return slotIsPlainText(content) ? [h(XhTimePickerTagLabel, null, () => content)] : content
}

/** 标签中的删除按钮：即所在标签那份 tag 的 close-trigger，可及名使用 translations.deleteItem；点按摘掉所在标签的选中值，焦点不动。 */
export const XhTimePickerItemDeleteTrigger = defineComponent({
  name: 'XhTimePickerItemDeleteTrigger',
  setup(_, { slots }) {
    const ctx = useTimePickerContext()
    const tag = useTimePickerTagContext()
    return () => h('button', ctx.api.value.getItemDeleteTriggerProps({ value: tag.value() }) as Record<string, unknown>, slots.default?.())
  },
})

/** 多选时一个选中值一个标签，即库内 tag 的 root（data-scope="tag"）。 */
export const XhTimePickerTag = defineComponent({
  name: 'XhTimePickerTag',
  props: {
    /** 它代表哪个选中值。 */
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useTimePickerContext()
    provideTimePickerTag({ value: () => props.value })
    return () => h('span', ctx.api.value.getTagProps({ value: props.value }) as Record<string, unknown>, tagChildren(slots.default?.()))
  },
})

/** 折叠的标签合成的一个标签：有插槽时使用插槽，否则显示 +N。没有折叠的标签时连接层写 hidden。 */
export const XhTimePickerOverflowTag = defineComponent({
  name: 'XhTimePickerOverflowTag',
  setup(_, { slots }) {
    const ctx = useTimePickerContext()
    return () => h(
      'span',
      ctx.api.value.getOverflowTagProps() as Record<string, unknown>,
      tagChildren(slots.default?.() ?? ctx.api.value.overflowText),
    )
  },
})

/**
 * 标签行：多选时放在盒里、触发钮之前；单选时连接层给 hidden。
 * 不写插槽即按 tags 铺出带删除钮的标签与 +N 那一枚，写了插槽由作者自己铺。
 */
export const XhTimePickerTagList = defineComponent({
  name: 'XhTimePickerTagList',
  setup(_, { slots }) {
    const ctx = useTimePickerContext()
    return () => h('span', ctx.api.value.getTagListProps() as Record<string, unknown>, slots.default
      ? slots.default()
      : [
          ...ctx.api.value.tags.map(tag => h(XhTimePickerTag, { key: tag.value, value: tag.value }, () => [
            h(XhTimePickerTagLabel, null, () => tag.label),
            h(XhTimePickerItemDeleteTrigger),
          ])),
          h(XhTimePickerOverflowTag),
        ])
  },
})

export const XhTimePickerSegmentGroup = defineComponent({
  name: 'XhTimePickerSegmentGroup',
  setup(_, { slots }) {
    const ctx = useTimePickerContext()
    return () => h('div', ctx.api.value.getSegmentGroupProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTimePickerSegment = defineComponent({
  name: 'XhTimePickerSegment',
  props: {
    // 段的身份由作者声明
    segment: { type: String as PropType<TimeSegmentType>, required: true },
  },
  setup(props, { slots }) {
    const ctx = useTimePickerContext()
    // 有插槽用插槽，否则显示该段的文字，空段为占位串
    return () => h(
      'span',
      ctx.api.value.getSegmentProps({ segment: props.segment }) as Record<string, unknown>,
      slots.default?.() ?? ctx.api.value.getSegmentText({ segment: props.segment }),
    )
  },
})

export const XhTimePickerTrigger = defineComponent({
  name: 'XhTimePickerTrigger',
  setup(_, { slots }) {
    // 字段的说明与校验状态要落在真控件上，不能停在封装根的 div 上
    const fieldWiring = useFieldStateWiring()
    // 字段的标签也得并进名字链：控件自带的那条指的是它自己那个没渲染的 label 部件
    const fieldLabel = useFieldLabelWiring()
    const ctx = useTimePickerContext()
    return () => h('button', fieldLabel.value({
      ...fieldWiring.value,
      ...ctx.api.value.getTriggerProps() as Record<string, unknown>,
      // 归还焦点要落到它身上：锚点取的是整个输入行，那一层不可聚焦
      ref: (el: unknown) => { ctx.triggerRef.value = el as HTMLElement },
    }), slots.default?.())
  },
})

export const XhTimePickerClearTrigger = defineComponent({
  name: 'XhTimePickerClearTrigger',
  setup(_, { slots }) {
    const ctx = useTimePickerContext()
    return () => h('button', ctx.api.value.getClearTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTimePickerPositioner = defineComponent({
  name: 'XhTimePickerPositioner',
  props: {
    /** 本实例的 Portal 容器；优先于应用级配置。 */
    container: { type: Object as PropType<Element> },
  },
  // 根是 Teleport，Vue 不会把直通属性合上去，作者写的 class 与 style 得自己接住落到 positioner 上
  inheritAttrs: false,
  setup(props, { slots, attrs }) {
    const ctx = useTimePickerContext()
    // 搬到 portal 落点：留在原地的话，宿主祖先只要建了层叠上下文就能盖住浮层
    return () => h(XhPortal, { to: props.container ?? ctx.portalTarget.value, source: ctx.controlRef }, () => [
      h('div', {
        ...mergeProps(ctx.api.value.getPositionerProps() as Record<string, unknown>, attrs),
        ref: (el: unknown) => { ctx.positionerRef.value = el as HTMLElement },
      }, slots.default?.()),
    ])
  },
})

export const XhTimePickerContent = defineComponent({
  name: 'XhTimePickerContent',
  setup(_, { slots }) {
    const ctx = useTimePickerContext()
    return () => h('div', {
      ...ctx.api.value.getContentProps() as Record<string, unknown>,
      // 收起跟着退场闸门走：皮肤刻意没给 content 补 [hidden]{display:none}（补了退场
      // 就一帧都播不出来），所以真正的收起落成内联 display——节点始终留在原地
      style: ctx.visible.value ? undefined : { display: 'none' },
      ref: (el: unknown) => { ctx.contentRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhTimePickerPresetGroup = defineComponent({
  name: 'XhTimePickerPresetGroup',
  slots: Object as SlotsType<{
    /** 自行铺设条目；未写时按 presets 数据自动铺设，两者产出的 DOM 一致。 */
    default?: (props: TimePickerPresetsSlotProps) => VNode[]
  }>,
  // 根是片段（选项列节点 + 贴层的条子），Vue 不会把直通属性合上去：作者写的 class、style 与 data-* 自己接住落到列节点上
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    const ctx = useTimePickerContext()
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

export const XhTimePickerPreset = defineComponent({
  name: 'XhTimePickerPreset',
  props: {
    /** 该条目的身份，与 presets 数据中的 value 逐字对应。 */
    value: { type: String, required: true },
  },
  slots: Object as SlotsType<{
    /** 条目内容；未写时使用数据中的 label。 */
    default?: () => VNode[]
  }>,
  setup(props, { slots }) {
    const ctx = useTimePickerContext()
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

export const XhTimePickerColumn = defineComponent({
  name: 'XhTimePickerColumn',
  props: {
    unit: { type: String as PropType<TimePickerColumnUnit>, required: true },
  },
  slots: Object as SlotsType<{
    default?: (props: TimePickerColumnSlotProps) => VNode[]
  }>,
  // 根是片段（列节点 + 贴层的条子），Vue 不会把直通属性合上去：作者写的 class、style 与 data-* 自己接住落到列节点上
  inheritAttrs: false,
  setup(props, { slots, attrs }) {
    const ctx = useTimePickerContext()
    const unit = computed(() => props.unit)
    // 下传单位，供列内选项取到自己归哪一列
    provideTimePickerColumn({ unit })
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
          ...mergeProps(ctx.api.value.getColumnProps({ unit: props.unit }) as Record<string, unknown>, attrs),
          ref: (el: unknown) => { columnRef.value = el as HTMLElement },
        },
        slots.default?.({ options: ctx.api.value.columns.find(c => c.unit === props.unit)?.options ?? [] }),
      ),
      ...bars.render(),
    ]
  },
})

export const XhTimePickerItem = defineComponent({
  name: 'XhTimePickerItem',
  props: {
    /** 两位补零的显示串（'09' / '30'）；上下午列写 '00' / '01'。 */
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useTimePickerContext()
    const { unit } = useTimePickerColumnContext()
    // 有插槽用插槽，否则显示这一格该显示的文字（上下午列按 locale 译成「上午 / 下午」）
    return () => h(
      'div',
      ctx.api.value.getItemProps({ unit: unit.value, value: props.value }) as Record<string, unknown>,
      slots.default?.() ?? ctx.api.value.getItemText({ unit: unit.value, value: props.value }),
    )
  },
})

/** 「添加」：多选时把浮层里拼好的草稿收进值，浮层不收；单选时连接层给 hidden。文字由作者写。 */
export const XhTimePickerConfirmTrigger = defineComponent({
  name: 'XhTimePickerConfirmTrigger',
  setup(_, { slots }) {
    const ctx = useTimePickerContext()
    return () => h('button', ctx.api.value.getConfirmTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTimePickerHiddenInput = defineComponent({
  name: 'XhTimePickerHiddenInput',
  setup() {
    const ctx = useTimePickerContext()
    // 多选时一个选中值一份同名输入，表单按原生多值收；单选仍是一份
    return () => ctx.api.value.selectionMode === 'multiple'
      ? ctx.api.value.value.map(value => h('input', { key: value, ...ctx.api.value.getHiddenInputProps({ value }) as Record<string, unknown> }))
      : h('input', ctx.api.value.getHiddenInputProps() as Record<string, unknown>)
  },
})
