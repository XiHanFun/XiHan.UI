/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 number field 相关实现。

import type { ControlVariant, Size, Tone } from '@xihan-ui/core'
import type { NumberFieldApi, NumberFieldSchema } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { numberFieldStructure } from '@xihan-ui/headless'
import { defineComponent, h, onUnmounted } from 'vue'
import { renderStructure } from '../../runtime/structure'
import { useFieldLabelWiring, useFieldStateWiring } from '../field/use-field-control'
import { useFormControlProps } from '../form/use-form-control'
import { provideNumberField, useNumberFieldContext } from './context'
import { useNumberField } from './use-number-field'

type NumberFieldProps = NumberFieldSchema['props']

/** 默认插槽的载荷：原始输入串与其数值、增减是否仍可进行，以及写值、增减的命令。 */
export type NumberFieldRootSlotProps = Pick<
  NumberFieldApi,
  'value' | 'valueAsNumber' | 'empty' | 'canIncrement' | 'canDecrement' | 'outOfRange' | 'setValue' | 'increment' | 'decrement'
>

export const XhNumberFieldRoot = defineComponent({
  name: 'XhNumberFieldRoot',
  props: {
    /** 不显示出来的名字，写成 aria-label 落在与字段标签同一个部件上；放进字段或渲染了 label 部件时以它们为准。 */
    ariaLabel: { type: String },
    /** 标题文字。不写默认插槽时铺 label 部件；需要放置其他内容时改用 label 插槽。 */
    label: { type: String },
    // 值是原始输入串；缺席值 undefined 表示非受控
    value: { type: String },
    defaultValue: { type: String },
    min: { type: Number },
    max: { type: Number },
    step: { type: Number },
    largeStep: { type: Number },
    disabled: { type: Boolean, default: undefined },
    readOnly: { type: Boolean, default: undefined },
    required: { type: Boolean, default: undefined },
    invalid: { type: Boolean, default: undefined },
    name: { type: String },
    placeholder: { type: String },
    changeDelay: { type: Number },
    changeInterval: { type: Number },
    minChangeInterval: { type: Number },
    clampValueOnBlur: { type: Boolean, default: undefined },
    variant: { type: String as PropType<ControlVariant> },
    tone: { type: String as PropType<Tone> },
    size: { type: String as PropType<Size> },
    parse: { type: Function as PropType<NumberFieldProps['parse']> },
    format: { type: Function as PropType<NumberFieldProps['format']> },
  },
  // value-change 携带 { value, valueAsNumber }，update:value 携带裸串
  emits: {
    'value-change': (_details: PayloadOf<NumberFieldProps, 'onValueChange'>) => true,
    'update:value': (_value: PayloadOf<NumberFieldProps, 'onValueChange'>['value']) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: NumberFieldRootSlotProps) => VNode[]
    label?: () => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notify: NumberFieldProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const ctx = useNumberField(useFormControlProps(props) as NumberFieldProps, notify)
    provideNumberField(ctx)
    return () => {
      const api = ctx.api.value
      return h('div', api.getRootProps(), slots.default
        ? slots.default({
            value: api.value,
            valueAsNumber: api.valueAsNumber,
            empty: api.empty,
            canIncrement: api.canIncrement,
            canDecrement: api.canDecrement,
            outOfRange: api.outOfRange,
            setValue: api.setValue,
            increment: api.increment,
            decrement: api.decrement,
          })
        : renderDefaultStructure(props.label, slots.label))
    }
  },
})

export const XhNumberFieldLabel = defineComponent({
  name: 'XhNumberFieldLabel',
  setup(_, { slots }) {
    const ctx = useNumberFieldContext()
    // 渲出来就登记，在 setup 里同步做：排在输入之前时首帧与服务端直出就带上名字
    ctx.labelCount.value++
    onUnmounted(() => {
      ctx.labelCount.value--
    })
    return () => h('label', ctx.api.value.getLabelProps(), slots.default?.())
  },
})

export const XhNumberFieldControl = defineComponent({
  name: 'XhNumberFieldControl',
  setup(_, { slots }) {
    const ctx = useNumberFieldContext()
    // 视觉盒：输入框与加减钮都放进来，皮肤把描边、底色、聚焦环画在它身上
    return () => h('div', ctx.api.value.getControlProps(), slots.default?.())
  },
})

export const XhNumberFieldPrefix = defineComponent({
  name: 'XhNumberFieldPrefix',
  setup(_, { slots }) {
    const ctx = useNumberFieldContext()
    return () => h('span', ctx.api.value.getPrefixProps(), slots.default?.())
  },
})

export const XhNumberFieldSuffix = defineComponent({
  name: 'XhNumberFieldSuffix',
  setup(_, { slots }) {
    const ctx = useNumberFieldContext()
    return () => h('span', ctx.api.value.getSuffixProps(), slots.default?.())
  },
})

export const XhNumberFieldInput = defineComponent({
  name: 'XhNumberFieldInput',
  setup() {
    // 字段的说明与校验状态要落在真控件上，不能停在封装根的 div 上
    const fieldWiring = useFieldStateWiring()
    // 字段的标签也得并进名字链：控件自带的那条指的是它自己那个没渲染的 label 部件
    const fieldLabel = useFieldLabelWiring()
    const ctx = useNumberFieldContext()
    return () => h('input', fieldLabel.value({ ...fieldWiring.value, ...ctx.api.value.getInputProps() }))
  },
})

export const XhNumberFieldIncrementTrigger = defineComponent({
  name: 'XhNumberFieldIncrementTrigger',
  setup(_, { slots }) {
    const ctx = useNumberFieldContext()
    return () => h('button', ctx.api.value.getIncrementTriggerProps(), slots.default?.())
  },
})

export const XhNumberFieldDecrementTrigger = defineComponent({
  name: 'XhNumberFieldDecrementTrigger',
  setup(_, { slots }) {
    const ctx = useNumberFieldContext()
    return () => h('button', ctx.api.value.getDecrementTriggerProps(), slots.default?.())
  },
})

/** 标准结构里各部件对应的组件。 */
const NUMBER_FIELD_PARTS = {
  'label': XhNumberFieldLabel,
  'control': XhNumberFieldControl,
  'decrement-trigger': XhNumberFieldDecrementTrigger,
  'input': XhNumberFieldInput,
  'increment-trigger': XhNumberFieldIncrementTrigger,
}

/**
 * 未写默认插槽时铺开的整套结构：照 headless 的 numberFieldStructure 渲，
 * 与 Web Components 不写部件时元素生成的节点出自同一份。标题由 label 插槽接管。
 */
function renderDefaultStructure(label: string | undefined, labelSlot?: () => VNode[]): VNode[] {
  const nodes = numberFieldStructure({ label, slotted: name => name === 'label' && labelSlot != null })
  return renderStructure(nodes, NUMBER_FIELD_PARTS, node => (node.slot ? labelSlot?.() : undefined))
}
