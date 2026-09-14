/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 color field 相关实现。

import type { ControlVariant, Size, Tone } from '@xihan-ui/core'
import type { ColorFieldApi, ColorFieldSchema, ColorFormat } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
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
    /** 颜色串；缺席即非受控。空串表示没有颜色。 */
    value: { type: String },
    defaultValue: { type: String },
    /** 值串的写法：hex / rgba / hsla，默认 hex。 */
    format: { type: String as PropType<ColorFormat> },
    /** 带透明度，默认关。 */
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
    'value-change': (_details: PayloadOf<ColorFieldProps, 'onValueChange'>) => true,
    'update:value': (_value: PayloadOf<ColorFieldProps, 'onValueChange'>['value']) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: ColorFieldRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notify: ColorFieldProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const ctx = useColorField(withXhConfig('color-field', useFormControlProps(props)) as ColorFieldProps, notify)
    provideColorField(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      value: ctx.api.value.value,
      empty: ctx.api.value.empty,
      text: ctx.api.value.text,
      editing: ctx.api.value.editing,
      valid: ctx.api.value.valid,
      invalid: ctx.api.value.invalid,
      canClear: ctx.api.value.canClear,
      setValue: ctx.api.value.setValue,
      clear: ctx.api.value.clear,
      commit: ctx.api.value.commit,
    }))
  },
})

export const XhColorFieldLabel = defineComponent({
  name: 'XhColorFieldLabel',
  setup(_, { slots }) {
    const ctx = useColorFieldContext()
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

/** 当前颜色的色块：色块面家族画棋盘格与描边，颜色由连接层写进私有槽。 */
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
