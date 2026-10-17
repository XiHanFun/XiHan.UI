/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 color field 相关实现。

import type { ControlVariant, Size, Tone } from '@xihan-ui/core'
import type { ColorFieldApi, ColorFieldSchema, ColorFormat } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { colorFieldStructure } from '@xihan-ui/headless'
import { defineComponent, h, onUnmounted } from 'vue'
import { withXhConfig } from '../../config/config'
import { renderStructure } from '../../runtime/structure'
import { withHandlers } from '../../runtime/with-handlers'
import { useFieldLabelWiring, useFieldStateWiring } from '../field/use-field-control'
import { useFormControlProps } from '../form/use-form-control'
import { provideColorField, useColorFieldContext } from './context'
import { useColorField } from './use-color-field'

type ColorFieldProps = ColorFieldSchema['props']

export type ColorFieldRootSlotProps = Pick<
  ColorFieldApi,
  'value' | 'empty' | 'text' | 'editing' | 'valid' | 'invalid' | 'canClear' | 'setValue' | 'clear' | 'commit'
>

export const XhColorFieldRoot = defineComponent({
  name: 'XhColorFieldRoot',
  props: {
    /** 标题文字。不写默认插槽时铺 label 部件；需要放置其他内容时改用 label 插槽。 */
    label: { type: String },
    /** 不显示出来的名字，写成 aria-label 落在与字段标签同一个部件上；放进字段或渲染了 label 部件时以它们为准。 */
    ariaLabel: { type: String },
    /** 颜色串；缺席即非受控。空串表示没有颜色。 */
    value: { type: String },
    defaultValue: { type: String },
    /** 值串的写法：hex / rgba / hsla / oklch，默认 hex。 */
    format: { type: String as PropType<ColorFormat> },
    /** 带透明度，默认关闭。 */
    alpha: { type: Boolean, default: undefined },
    placeholder: { type: String },
    disabled: { type: Boolean, default: undefined },
    readOnly: { type: Boolean, default: undefined },
    required: { type: Boolean, default: undefined },
    invalid: { type: Boolean, default: undefined },
    name: { type: String },
    clearable: Boolean,
    variant: { type: String as PropType<ControlVariant> },
    tone: { type: String as PropType<Tone> },
    size: { type: String as PropType<Size> },
    translations: { type: Object as PropType<ColorFieldProps['translations']> },
  },
  // value-change 携带 { value }，update:value 携带裸串
  emits: {
    'clear': () => true,
    'value-change': (_details: PayloadOf<ColorFieldProps, 'onValueChange'>) => true,
    'update:value': (_value: PayloadOf<ColorFieldProps, 'onValueChange'>['value']) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: ColorFieldRootSlotProps) => VNode[]
    label?: () => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notify: ColorFieldProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const ctx = useColorField(withHandlers(withXhConfig('color-field', useFormControlProps(props)), { onClear: () => emit('clear') }) as ColorFieldProps, notify)
    provideColorField(ctx)
    return () => {
      const api = ctx.api.value
      return h('div', api.getRootProps() as Record<string, unknown>, slots.default
        ? slots.default({
            value: api.value,
            empty: api.empty,
            text: api.text,
            editing: api.editing,
            valid: api.valid,
            invalid: api.invalid,
            canClear: api.canClear,
            setValue: api.setValue,
            clear: api.clear,
            commit: api.commit,
          })
        : renderDefaultStructure(api, props.label, props.name !== undefined, slots.label))
    }
  },
})

export const XhColorFieldLabel = defineComponent({
  name: 'XhColorFieldLabel',
  setup(_, { slots }) {
    const ctx = useColorFieldContext()
    // 渲出来就登记，在 setup 里同步做：排在输入之前时首帧与服务端直出就带上名字
    ctx.labelCount.value++
    onUnmounted(() => {
      ctx.labelCount.value--
    })
    // 必须是原生 <label>，connect 把 for 写向 input
    return () => h('label', ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhColorFieldControl = defineComponent({
  name: 'XhColorFieldControl',
  setup(_, { slots }) {
    const ctx = useColorFieldContext()
    // 视觉盒：色块、输入框与清空按钮都放进来，皮肤把描边、底色、聚焦环画在它身上
    return () => h('div', ctx.api.value.getControlProps() as Record<string, unknown>, slots.default?.())
  },
})

/** 当前颜色的色块：色块面家族绘制棋盘格与描边，颜色由连接层写入私有槽。 */
export const XhColorFieldSwatch = defineComponent({
  name: 'XhColorFieldSwatch',
  setup() {
    const ctx = useColorFieldContext()
    return () => h('span', ctx.api.value.getSwatchProps() as Record<string, unknown>)
  },
})

export const XhColorFieldInput = defineComponent({
  name: 'XhColorFieldInput',
  setup() {
    // 字段的说明与校验状态要落在真控件上，不能停在封装根的 div 上
    const fieldWiring = useFieldStateWiring()
    // 字段的标签也得并进名字链：控件自带的那条指的是它自己那个没渲染的 label 部件
    const fieldLabel = useFieldLabelWiring()
    const ctx = useColorFieldContext()
    return () => h('input', fieldLabel.value({
      ...fieldWiring.value,
      ...ctx.api.value.getInputProps() as Record<string, unknown>,
    }))
  },
})

export const XhColorFieldClearTrigger = defineComponent({
  name: 'XhColorFieldClearTrigger',
  setup(_, { slots }) {
    const ctx = useColorFieldContext()
    return () => h('button', ctx.api.value.getClearTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhColorFieldHiddenInput = defineComponent({
  name: 'XhColorFieldHiddenInput',
  setup() {
    const ctx = useColorFieldContext()
    return () => h('input', ctx.api.value.getHiddenInputProps() as Record<string, unknown>)
  },
})

/** 标准结构里各部件对应的组件。 */
const COLOR_FIELD_PARTS = {
  'label': XhColorFieldLabel,
  'control': XhColorFieldControl,
  'swatch': XhColorFieldSwatch,
  'input': XhColorFieldInput,
  'clear-trigger': XhColorFieldClearTrigger,
  'hidden-input': XhColorFieldHiddenInput,
}

/**
 * 未写默认插槽时铺开的整套结构：照 headless 的 colorFieldStructure 渲，
 * 与 Web Components 不写部件时元素生成的节点出自同一份。标题由 label 插槽接管。
 */
function renderDefaultStructure(api: ColorFieldApi, label: string | undefined, hiddenInput: boolean, labelSlot?: () => VNode[]): VNode[] {
  const nodes = colorFieldStructure(api, { label, hiddenInput, slotted: name => name === 'label' && labelSlot != null })
  return renderStructure(nodes, COLOR_FIELD_PARTS, node => (node.slot ? labelSlot?.() : undefined))
}
