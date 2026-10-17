/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 slider 相关实现。

import type { Direction, Orientation, Size, Tone } from '@xihan-ui/core'
import type { SliderApi, SliderMark, SliderMarkMeta, SliderSchema, SliderValueTextDetails, StructureChild } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { normalizeItemIndex } from '@xihan-ui/core'
import { sliderStructure } from '@xihan-ui/headless'
import { computed, defineComponent, h, onUnmounted } from 'vue'
import { renderStructure } from '../../runtime/structure'
import { useFieldGroupWiring, useFieldLabelWiring } from '../field/use-field-control'
import { useFormControlProps } from '../form/use-form-control'
import { provideSlider, provideSliderThumb, useSliderContext, useSliderThumbContext } from './context'
import { useSlider } from './use-slider'

type SliderProps = SliderSchema['props']

/** 默认插槽的载荷：当前值、逐个滑块的状态、已选区间与拖动标记，以及整份改值与单个滑块改值。 */
export type SliderRootSlotProps = Pick<
  SliderApi,
  'value' | 'thumbs' | 'range' | 'dragging' | 'setValue' | 'setThumbValue'
>

/** tick 插槽的载荷：该档刻度的呈现数据。 */
export interface SliderTickGroupTickSlotProps {
  tick: SliderMarkMeta
}

export const XhSliderRoot = defineComponent({
  name: 'XhSliderRoot',
  props: {
    /** 标题文字。不写默认插槽时铺 label 部件；需要放置其他内容时改用 label 插槽。 */
    label: { type: String },
    /** 不显示出来的名字，写成 aria-label 落在与字段标签同一个部件上；放进字段或渲染了 label 部件时以它们为准。 */
    ariaLabel: { type: String },
    // 值恒是数组，单滑块即长度 1；缺席值 undefined 表示非受控
    value: { type: Array as PropType<number[]> },
    defaultValue: { type: Array as PropType<number[]> },
    min: { type: Number },
    max: { type: Number },
    step: { type: Number },
    largeStep: { type: Number },
    minStepsBetweenThumbs: { type: Number },
    marks: { type: Array as PropType<SliderMark[]> },
    snapToMarks: { type: Boolean, default: undefined },
    inverted: { type: Boolean, default: undefined },
    draggableRange: { type: Boolean, default: undefined },
    trackFill: { type: Boolean, default: undefined },
    orientation: { type: String as PropType<Orientation> },
    dir: { type: String as PropType<Direction> },
    disabled: { type: Boolean, default: undefined },
    readOnly: { type: Boolean, default: undefined },
    invalid: { type: Boolean, default: undefined },
    required: { type: Boolean, default: undefined },
    tone: { type: String as PropType<Tone> },
    size: { type: String as PropType<Size> },
    name: { type: String },
    getValueText: {
      type: Function as PropType<(details: SliderValueTextDetails) => string>,
    },
  },
  // value-change 携带 { value }，update:value 携带裸数组；value-change-end 只在操作收尾时发一次
  emits: {
    'value-change': (_details: PayloadOf<SliderProps, 'onValueChange'>) => true,
    'update:value': (_value: PayloadOf<SliderProps, 'onValueChange'>['value']) => true,
    'value-change-end': (_details: PayloadOf<SliderProps, 'onValueChangeEnd'>) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: SliderRootSlotProps) => VNode[]
    label?: () => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notify: SliderProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const notifyEnd: SliderProps['onValueChangeEnd'] = (details) => {
      emit('value-change-end', details)
    }
    const ctx = useSlider(useFormControlProps(props) as SliderProps, notify, notifyEnd)
    provideSlider(ctx)
    return () => {
      const api = ctx.api.value
      return h('div', api.getRootProps() as Record<string, unknown>, slots.default
        ? slots.default({
            value: api.value,
            thumbs: api.thumbs,
            range: api.range,
            dragging: api.dragging,
            setValue: api.setValue,
            setThumbValue: api.setThumbValue,
          })
        : renderDefaultStructure(api, props.label, props.name !== undefined, slots.label))
    }
  },
})

export const XhSliderLabel = defineComponent({
  name: 'XhSliderLabel',
  setup(_, { slots }) {
    const ctx = useSliderContext()
    // 渲出来就登记，在 setup 里同步做：排在输入之前时首帧与服务端直出就带上名字
    ctx.labelCount.value++
    onUnmounted(() => {
      ctx.labelCount.value--
    })
    return () => h('label', ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhSliderControl = defineComponent({
  name: 'XhSliderControl',
  setup(_, { slots }) {
    const ctx = useSliderContext()
    return () => h('div', ctx.api.value.getControlProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhSliderTrack = defineComponent({
  name: 'XhSliderTrack',
  setup(_, { slots }) {
    const ctx = useSliderContext()
    // 轨道节点交给机器，矩形在指针事件里现量
    return () => h('div', {
      ...ctx.api.value.getTrackProps() as Record<string, unknown>,
      ref: ctx.trackRef,
    }, slots.default?.())
  },
})

export const XhSliderTickGroup = defineComponent({
  name: 'XhSliderTickGroup',
  slots: Object as SlotsType<{
    tick?: (props: SliderTickGroupTickSlotProps) => VNode[]
  }>,
  setup(_, { slots }) {
    const ctx = useSliderContext()
    // 刻度整组自动铺：圆点 + 文案（点文案跳值）；tick 插槽可换文案内容
    return () => h('div', ctx.api.value.getTickGroupProps() as Record<string, unknown>, ctx.api.value.marks.flatMap(tick => [
      h('span', { ...ctx.api.value.getTickProps({ value: tick.value }) as Record<string, unknown>, key: `dot-${tick.value}` }),
      h(
        'span',
        { ...ctx.api.value.getTickLabelProps({ value: tick.value }) as Record<string, unknown>, key: `label-${tick.value}` },
        slots.tick ? slots.tick({ tick }) : tick.label,
      ),
    ]))
  },
})

export const XhSliderRange = defineComponent({
  name: 'XhSliderRange',
  setup(_, { slots }) {
    const ctx = useSliderContext()
    return () => h('div', ctx.api.value.getRangeProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhSliderThumb = defineComponent({
  name: 'XhSliderThumb',
  props: {
    /** 第几个滑块，多滑块时必须逐个写明（`:index="i"`）；兼收字符串。 */
    index: { type: [Number, String] as PropType<number | string>, default: 0 },
  },
  setup(props, { slots }) {
    const ctx = useSliderContext()
    const index = computed(() => normalizeItemIndex(props.index))
    provideSliderThumb({ index })
    // 放进表单字段时，字段的标题与说明接到拇指上：焦点落在拇指，读屏在这里念名字与说明
    const fieldWiring = useFieldGroupWiring()
    const fieldLabel = useFieldLabelWiring()
    return () => h('div', fieldLabel.value({ ...fieldWiring.value, ...ctx.api.value.getThumbProps(index.value) as Record<string, unknown> }), slots.default?.())
  },
})

export const XhSliderValueText = defineComponent({
  name: 'XhSliderValueText',
  setup(_, { slots }) {
    const { index } = useSliderThumbContext()
    const ctx = useSliderContext()
    // 值气泡：写在拇指里，没给内容就填这一个拇指的值文本
    return () => h(
      'span',
      ctx.api.value.getValueTextProps(index.value) as Record<string, unknown>,
      slots.default?.() ?? ctx.api.value.valueText(index.value),
    )
  },
})

export const XhSliderHiddenInput = defineComponent({
  name: 'XhSliderHiddenInput',
  setup() {
    const { index } = useSliderThumbContext()
    const ctx = useSliderContext()
    return () => h('input', ctx.api.value.getHiddenInputProps(index.value) as Record<string, unknown>)
  },
})

/** 标准结构里各部件对应的组件；刻度的圆点与文案由 XhSliderTickGroup 自己铺。 */
const SLIDER_PARTS = {
  'label': XhSliderLabel,
  'control': XhSliderControl,
  'track': XhSliderTrack,
  'range': XhSliderRange,
  'tick-group': XhSliderTickGroup,
  'thumb': XhSliderThumb,
  'hidden-input': XhSliderHiddenInput,
}

/** 刻度组自己按 marks 铺圆点与文案，铺结构时去掉这两格。 */
function withoutSelfAssembled(nodes: readonly StructureChild[]): StructureChild[] {
  return nodes.flatMap((node): StructureChild[] => {
    if (!('part' in node))
      return [node]
    if (node.part === 'tick' || node.part === 'tick-label')
      return []
    return [node.children ? { ...node, children: withoutSelfAssembled(node.children) } : node]
  })
}

/**
 * 未写默认插槽时铺开的整套结构：照 headless 的 sliderStructure 渲，
 * 与 Web Components 不写部件时元素生成的节点出自同一份。标题由 label 插槽接管。
 */
function renderDefaultStructure(api: SliderApi, label: string | undefined, hiddenInput: boolean, labelSlot?: () => VNode[]): VNode[] {
  const nodes = sliderStructure(api, { label, hiddenInput, slotted: name => name === 'label' && labelSlot != null })
  return renderStructure(withoutSelfAssembled(nodes), SLIDER_PARTS, node => (node.slot ? labelSlot?.() : undefined))
}
