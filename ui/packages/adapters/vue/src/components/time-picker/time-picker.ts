import type {
  TimeGranularity,
  TimeHourCycle,
  TimePickerApi,
  TimePickerColumn,
  TimePickerColumnUnit,
  TimePickerPreset,
  TimePickerPresetState,
  TimePickerSchema,
  TimeSegmentType,
} from '@xihan-ui/headless'
import type { ControlVariant, Placement, Size, Tone } from '@xihan-ui/kernel'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { computed, defineComponent, h, mergeProps, Teleport } from 'vue'
import { withXhConfig } from '../../config/config'
import { slotPaints } from '../../runtime/slot-content'
import { useFieldLabelWiring, useFieldStateWiring } from '../field/use-field-control'
import {
  provideTimePicker,
  provideTimePickerColumn,
  useTimePickerColumnContext,
  useTimePickerContext,
} from './context'
import { useTimePicker } from './use-time-picker'

type TimePickerProps = TimePickerSchema['props']

/** 默认插槽的载荷：浮层开合与当前值、值状态标志、此刻的段与列，以及开合、写值、清空的动作。 */
export type TimePickerRootSlotProps = Pick<
  TimePickerApi,
  | 'open'
  | 'value'
  | 'empty'
  | 'outOfRange'
  | 'segments'
  | 'columns'
  | 'canClear'
  | 'setOpen'
  | 'setValue'
  | 'clear'
>

/** 默认插槽的载荷：这一列此刻的可选值。 */
export interface TimePickerColumnSlotProps {
  options: TimePickerColumn['options']
}

/** 快捷选项列默认插槽的载荷：逐条的投影，作者据此自己铺条目。 */
export interface TimePickerPresetsSlotProps {
  presets: readonly TimePickerPresetState[]
}

export const XhTimePickerRoot = defineComponent({
  name: 'XhTimePickerRoot',
  // 缺省值由 connect 给出，这里一律 default: undefined
  props: {
    value: { type: String, default: undefined },
    defaultValue: { type: String, default: undefined },
    open: { type: Boolean, default: undefined },
    defaultOpen: Boolean,
    min: { type: String, default: undefined },
    max: { type: String, default: undefined },
    locale: { type: String, default: undefined },
    hourCycle: { type: Number as PropType<TimeHourCycle>, default: undefined },
    granularity: { type: String as PropType<TimeGranularity>, default: undefined },
    step: { type: Number, default: undefined },
    /** 快捷选项；给了就在浮层里多出一列，时刻要在自己的 computed 里算好再传。 */
    presets: { type: Array as PropType<TimePickerPreset[]>, default: undefined },
    disabled: Boolean,
    translations: { type: Object as PropType<TimePickerProps['translations']>, default: undefined },
    isTimeUnavailable: { type: Function as PropType<(value: string, unit: TimePickerColumnUnit) => boolean>, default: undefined },
    readOnly: Boolean,
    invalid: Boolean,
    required: Boolean,
    name: { type: String, default: undefined },
    variant: { type: String as PropType<ControlVariant>, default: undefined },
    tone: { type: String as PropType<Tone>, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
    placement: { type: String as PropType<Placement>, default: undefined },
    offset: { type: Number, default: undefined },
  },
  // *-change 携带 details 对象，update:* 携带裸值
  emits: {
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
    const ctx = useTimePicker(withXhConfig('time-picker', props) as TimePickerProps, {
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
      setOpen: ctx.api.value.setOpen,
      setValue: ctx.api.value.setValue,
      clear: ctx.api.value.clear,
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

export const XhTimePickerSegmentGroup = defineComponent({
  name: 'XhTimePickerSegmentGroup',
  setup(_, { slots }) {
    const ctx = useTimePickerContext()
    return () => h('div', ctx.api.value.getSegmentGroupProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTimePickerInput = defineComponent({
  name: 'XhTimePickerInput',
  props: {
    // 段的身份由作者声明
    segment: { type: String as PropType<TimeSegmentType>, required: true },
  },
  setup(props, { slots }) {
    const ctx = useTimePickerContext()
    // 有插槽用插槽，否则显示该段的文字，空段为占位串
    return () => h(
      'span',
      ctx.api.value.getInputProps({ segment: props.segment }) as Record<string, unknown>,
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
      ...ctx.api.value.getTriggerProps() as Record<string, unknown>,
      // 归还焦点要落到它身上：锚点取的是整个输入行，那一层不可聚焦
      ref: (el: unknown) => { ctx.triggerRef.value = el as HTMLElement },
      ...fieldWiring.value,
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
  // 根是 Teleport，Vue 不会把直通属性合上去，作者写的 class 与 style 得自己接住落到 positioner 上
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    const ctx = useTimePickerContext()
    // 搬到 portal 落点：留在原地的话，宿主祖先只要建了层叠上下文就能盖住浮层
    return () => h(Teleport, { to: ctx.portalTarget.value }, [
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

export const XhTimePickerPresets = defineComponent({
  name: 'XhTimePickerPresets',
  slots: Object as SlotsType<{
    /** 自己铺条目；不写就按 presets 数据自动铺，两者产出的 DOM 一致。 */
    default?: (props: TimePickerPresetsSlotProps) => VNode[]
  }>,
  setup(_, { slots }) {
    const ctx = useTimePickerContext()
    return () => {
      const api = ctx.api.value
      const authored = slots.default?.({ presets: api.presets })
      return h(
        'div',
        api.getPresetsProps() as Record<string, unknown>,
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

export const XhTimePickerPreset = defineComponent({
  name: 'XhTimePickerPreset',
  props: {
    /** 这一条的身份，与 presets 数据里的 value 逐字对上。 */
    value: { type: String, required: true },
  },
  slots: Object as SlotsType<{
    /** 条目内容；不写就用数据里的 label。 */
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
  setup(props, { slots }) {
    const ctx = useTimePickerContext()
    const unit = computed(() => props.unit)
    // 下传单位，供列内选项取到自己归哪一列
    provideTimePickerColumn({ unit })
    return () => h(
      'div',
      ctx.api.value.getColumnProps({ unit: props.unit }) as Record<string, unknown>,
      slots.default?.({ options: ctx.api.value.columns.find(c => c.unit === props.unit)?.options ?? [] }),
    )
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

export const XhTimePickerHiddenInput = defineComponent({
  name: 'XhTimePickerHiddenInput',
  setup() {
    const ctx = useTimePickerContext()
    return () => h('input', ctx.api.value.getHiddenInputProps() as Record<string, unknown>)
  },
})
