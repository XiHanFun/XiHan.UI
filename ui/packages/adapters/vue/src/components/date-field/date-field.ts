/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 date field 相关实现。

import type { ControlVariant, Size, Tone } from '@xihan-ui/core'
import type { DateFieldApi, DateFieldSchema, DateFieldSegmentState, DateFieldTranslations, DateGranularity, DateHourCycle, DateSegmentSet, DateSegmentType } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { dateFieldStructure } from '@xihan-ui/headless'
import { defineComponent, h, onUnmounted } from 'vue'
import { withXhConfig } from '../../config/config'
import { renderStructure } from '../../runtime/structure'
import { withHandlers } from '../../runtime/with-handlers'
import { useFormControlProps } from '../form/use-form-control'
import { provideDateField, useDateFieldContext } from './context'
import { useDateField } from './use-date-field'

type DateFieldProps = DateFieldSchema['props']
type SegmentTexts = { readonly [K in DateSegmentType]?: string }

/** 默认插槽的载荷：整份值、逐段投影、填写状态，以及改写与清空的句柄。 */
export type DateFieldRootSlotProps = Pick<
  DateFieldApi,
  | 'value'
  | 'valueAsDate'
  | 'segments'
  | 'complete'
  | 'empty'
  | 'outOfRange'
  | 'focusedSegment'
  | 'setValue'
  | 'clear'
  | 'canClear'
>

/** 段位默认插槽的载荷：本段的投影；下标越界时缺席。 */
export interface DateFieldSegmentSlotProps {
  segment: DateFieldSegmentState | undefined
}

export const XhDateFieldRoot = defineComponent({
  name: 'XhDateFieldRoot',
  // 缺省值由 connect 给出；普通类型省略 default，Boolean 显式保留 undefined
  props: {
    /** 不显示出来的名字，写成 aria-label 落在与字段标签同一个部件上；放进字段或渲染了 label 部件时以它们为准。 */
    ariaLabel: { type: String },
    /** 标题文字。不写默认插槽时铺 label 部件；需要放置其他内容时改用 label 插槽。 */
    label: { type: String },
    value: { type: String as PropType<string | null> },
    defaultValue: { type: String as PropType<string | null> },
    min: { type: String },
    max: { type: String },
    locale: { type: String },
    timeZone: { type: String },
    granularity: { type: String as PropType<DateGranularity> },
    /** 时刻段的小时制，默认 24；12 时小时段收 1-12 并多出上下午段。 */
    hourCycle: { type: Number as PropType<DateHourCycle> },
    // 段集：给了就以它为准，granularity 让路。段位节点仍按下标认段，段集是有序的
    segments: { type: Array as PropType<DateSegmentSet> },
    disabled: { type: Boolean, default: undefined },
    readOnly: { type: Boolean, default: undefined },
    invalid: { type: Boolean, default: undefined },
    required: { type: Boolean, default: undefined },
    name: { type: String },
    /** 占位。字符串是整条占位：一段都没填、焦点也不在段上时输入行显示这句文字，焦点进到段上即换回段位；对象是逐段的占位串，覆盖内置的 yyyy / mm / dd。 */
    placeholder: { type: [String, Object] as PropType<string | SegmentTexts> },
    translations: { type: Object as PropType<DateFieldTranslations> },
    variant: { type: String as PropType<ControlVariant> },
    tone: { type: String as PropType<Tone> },
    size: { type: String as PropType<Size> },
  },
  // value-change 携带 { value }，update:value 携带裸串
  emits: {
    'clear': () => true,
    'value-change': (_details: PayloadOf<DateFieldProps, 'onValueChange'>) => true,
    'update:value': (_value: PayloadOf<DateFieldProps, 'onValueChange'>['value']) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: DateFieldRootSlotProps) => VNode[]
    label?: () => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const onValueChange: DateFieldProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const ctx = useDateField(withHandlers(withXhConfig('date-field', useFormControlProps(props)), { onClear: () => emit('clear') }) as DateFieldProps, { onValueChange })
    provideDateField(ctx)
    return () => {
      const api = ctx.api.value
      return h('div', api.getRootProps() as Record<string, unknown>, slots.default
        ? slots.default({
            value: api.value,
            valueAsDate: api.valueAsDate,
            segments: api.segments,
            complete: api.complete,
            empty: api.empty,
            outOfRange: api.outOfRange,
            focusedSegment: api.focusedSegment,
            setValue: api.setValue,
            clear: api.clear,
            canClear: api.canClear,
          })
        : renderDefaultStructure(api, props.label, slots.label))
    }
  },
})

export const XhDateFieldLabel = defineComponent({
  name: 'XhDateFieldLabel',
  setup(_, { slots }) {
    const ctx = useDateFieldContext()
    // 渲出来就登记，在 setup 里同步做：排在输入之前时首帧与服务端直出就带上名字
    ctx.labelCount.value++
    onUnmounted(() => {
      ctx.labelCount.value--
    })
    // 渲染为 span 而非 label，段位不是可被 for 标注的控件；点标题聚焦由连接层接管
    return () => h('span', ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhDateFieldControl = defineComponent({
  name: 'XhDateFieldControl',
  setup(_, { slots }) {
    const ctx = useDateFieldContext()
    return () => h('div', ctx.api.value.getControlProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhDateFieldSegmentGroup = defineComponent({
  name: 'XhDateFieldSegmentGroup',
  setup(_, { slots }) {
    const ctx = useDateFieldContext()
    return () => h('div', ctx.api.value.getSegmentGroupProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhDateFieldSegment = defineComponent({
  name: 'XhDateFieldSegment',
  props: {
    // 下标由作者声明，是哪一段由 locale 与段集算出；兼收字符串
    index: { type: [Number, String] as PropType<number | string> },
    /** 按段名声明该格。段集中没有该段时它收起；与 index 二选一，两个都写时按段名计算。 */
    segment: { type: String as PropType<DateSegmentType> },
  },
  slots: Object as SlotsType<{
    default?: (props: DateFieldSegmentSlotProps) => VNode[]
  }>,
  setup(props, { slots }) {
    const ctx = useDateFieldContext()
    return () => {
      const api = ctx.api.value
      // 落点由连接层算：按下标还是按段名是同一条路，适配器这边不重写一份
      const declared = props.segment != null
        ? { segment: props.segment }
        : { index: Math.trunc(Number(props.index)) }
      const state = api.segmentOf(declared)
      // 有插槽用插槽，否则渲染连接层算好的段位文本
      return h(
        'div',
        api.getSegmentProps(declared) as Record<string, unknown>,
        slots.default ? slots.default({ segment: state }) : state?.text,
      )
    }
  },
})

export const XhDateFieldClearTrigger = defineComponent({
  name: 'XhDateFieldClearTrigger',
  setup(_, { slots }) {
    const ctx = useDateFieldContext()
    // 没有默认插槽时由皮肤画兜底字形
    return () => h('button', ctx.api.value.getClearTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhDateFieldHiddenInput = defineComponent({
  name: 'XhDateFieldHiddenInput',
  setup() {
    const ctx = useDateFieldContext()
    return () => h('input', ctx.api.value.getHiddenInputProps() as Record<string, unknown>)
  },
})

/** 标准结构里各部件对应的组件。 */
const DATE_FIELD_PARTS = {
  'label': XhDateFieldLabel,
  'control': XhDateFieldControl,
  'segment-group': XhDateFieldSegmentGroup,
  'segment': XhDateFieldSegment,
  'clear-trigger': XhDateFieldClearTrigger,
  'hidden-input': XhDateFieldHiddenInput,
}

/**
 * 未写默认插槽时铺开的整套结构：照 headless 的 dateFieldStructure 渲，段按当前段序铺、段间是 locale 的分隔符，
 * 与 Web Components 不写部件时元素生成的节点出自同一份。标题由 label 插槽接管。
 */
function renderDefaultStructure(api: DateFieldApi, label: string | undefined, labelSlot?: () => VNode[]): VNode[] {
  const nodes = dateFieldStructure(api, { label, slotted: name => name === 'label' && labelSlot != null })
  return renderStructure(nodes, DATE_FIELD_PARTS, node => (node.slot ? labelSlot?.() : undefined))
}
