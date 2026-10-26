/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 pin input 相关实现。

import type { ControlVariant, Size, Tone } from '@xihan-ui/core'
import type { PinInputApi, PinInputSchema, PinInputTranslations, PinInputType } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { pinInputStructure } from '@xihan-ui/headless'
import { defineComponent, h, onUnmounted } from 'vue'
import { withXhConfig } from '../../config/config'
import { renderStructure } from '../../runtime/structure'
import { useFieldGroupWiring, useFieldLabelWiring } from '../field/use-field-control'
import { useFormControlProps } from '../form/use-form-control'
import { providePinInput, usePinInputContext } from './context'
import { usePinInput } from './use-pin-input'

type PinInputProps = PinInputSchema['props']

/** 默认插槽的载荷：逐格的值与拼接后的串、是否填满、格数与焦点所在格，以及修改值、清空的命令。 */
export type PinInputRootSlotProps = Pick<
  PinInputApi,
  'value' | 'valueAsString' | 'complete' | 'length' | 'focusedIndex' | 'setValue' | 'clear'
>

export const XhPinInputRoot = defineComponent({
  name: 'XhPinInputRoot',
  props: {
    /** 不显示出来的名字，写成 aria-label 落在与字段标签同一个部件上；放进字段或渲染了 label 部件时以它们为准。 */
    ariaLabel: { type: String },
    /** 标题文字。不写默认插槽时铺 label 部件；需要放置其他内容时改用 label 插槽。 */
    label: { type: String },
    // 缺席值 undefined 表示非受控
    value: { type: Array as PropType<string[]> },
    defaultValue: { type: Array as PropType<string[]> },
    // 缺省值由 connect 给出；普通类型省略 default，Boolean 显式保留 undefined
    length: { type: Number },
    type: { type: String as PropType<PinInputType> },
    pattern: { type: String },
    mask: Boolean,
    otp: Boolean,
    placeholder: { type: String },
    disabled: { type: Boolean, default: undefined },
    readOnly: { type: Boolean, default: undefined },
    required: { type: Boolean, default: undefined },
    invalid: { type: Boolean, default: undefined },
    blurOnComplete: Boolean,
    name: { type: String },
    variant: { type: String as PropType<ControlVariant> },
    tone: { type: String as PropType<Tone> },
    size: { type: String as PropType<Size> },
    translations: { type: Object as PropType<Partial<PinInputTranslations>> },
  },
  // value-change 携带 { value, valueAsString }，update:value 携带裸数组
  emits: {
    'value-change': (_details: PayloadOf<PinInputProps, 'onValueChange'>) => true,
    'value-complete': (_details: PayloadOf<PinInputProps, 'onValueComplete'>) => true,
    'update:value': (_value: PayloadOf<PinInputProps, 'onValueChange'>['value']) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: PinInputRootSlotProps) => VNode[]
    /** 不写默认插槽时标题的内容，代替 label 文字。 */
    label?: () => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const onValueChange: PinInputProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const onValueComplete: PinInputProps['onValueComplete'] = details => emit('value-complete', details)
    const ctx = usePinInput(withXhConfig('pin-input', useFormControlProps(props)) as PinInputProps, { onValueChange, onValueComplete })
    providePinInput(ctx)
    // 放进表单字段时，字段的标题与说明接到整组上：读屏进组时念组名与说明，每格的名字仍是「第几格」
    const fieldWiring = useFieldGroupWiring()
    const fieldLabel = useFieldLabelWiring()
    return () => h('div', fieldLabel.value({ ...fieldWiring.value, ...ctx.api.value.getRootProps() }), slots.default
      ? slots.default({
          value: ctx.api.value.value,
          valueAsString: ctx.api.value.valueAsString,
          complete: ctx.api.value.complete,
          length: ctx.api.value.length,
          focusedIndex: ctx.api.value.focusedIndex,
          setValue: ctx.api.value.setValue,
          clear: ctx.api.value.clear,
        })
      : renderDefaultStructure(ctx.api.value, { label: props.label, hiddenInput: props.name !== undefined }, slots.label))
  },
})

export const XhPinInputLabel = defineComponent({
  name: 'XhPinInputLabel',
  setup(_, { slots }) {
    const ctx = usePinInputContext()
    // 渲出来就登记，在 setup 里同步做：排在输入之前时首帧与服务端直出就带上名字
    ctx.labelCount.value++
    onUnmounted(() => {
      ctx.labelCount.value--
    })
    // 必须是原生 label，getLabelProps 的 for 恒写向首格
    return () => h('label', ctx.api.value.getLabelProps(), slots.default?.())
  },
})

/** 分段：相邻的几格圈为一段（123-456 这种分段写法）。 */
export const XhPinInputGroup = defineComponent({
  name: 'XhPinInputGroup',
  setup(_, { slots }) {
    const ctx = usePinInputContext()
    return () => h('div', ctx.api.value.getGroupProps(), slots.default?.())
  },
})

/** 段与段之间的分隔；对读屏隐藏。 */
export const XhPinInputSeparator = defineComponent({
  name: 'XhPinInputSeparator',
  setup(_, { slots }) {
    const ctx = usePinInputContext()
    return () => h('span', ctx.api.value.getSeparatorProps(), slots.default?.())
  },
})

export const XhPinInputInput = defineComponent({
  name: 'XhPinInputInput',
  props: {
    // 下标由作者声明，兼收字符串以支持模板里写 index="0"
    index: { type: [Number, String] as PropType<number | string>, required: true },
  },
  setup(props) {
    const ctx = usePinInputContext()
    return () => h('input', ctx.api.value.getInputProps({ index: Math.trunc(Number(props.index)) }))
  },
})

export const XhPinInputHiddenInput = defineComponent({
  name: 'XhPinInputHiddenInput',
  setup() {
    const ctx = usePinInputContext()
    return () => h('input', ctx.api.value.getHiddenInputProps())
  },
})

/** 标准结构里各部件对应的组件。 */
const PIN_INPUT_PARTS = {
  'label': XhPinInputLabel,
  'group': XhPinInputGroup,
  'input': XhPinInputInput,
  'hidden-input': XhPinInputHiddenInput,
}

/**
 * 未写默认插槽时铺开的整套结构：照 headless 的 pinInputStructure 渲，
 * 与 Web Components 不写部件时元素生成的节点出自同一份。标题由 label 插槽接管。
 */
function renderDefaultStructure(api: PinInputApi, options: { label?: string, hiddenInput: boolean }, labelSlot?: () => VNode[]): VNode[] {
  const nodes = pinInputStructure(api, { ...options, slotted: name => name === 'label' && labelSlot != null })
  return renderStructure(nodes, PIN_INPUT_PARTS, node => (node.slot ? labelSlot?.() : undefined))
}
