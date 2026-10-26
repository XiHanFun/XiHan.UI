/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 password input 相关实现。

import type { ControlVariant, Size, Tone } from '@xihan-ui/core'
import type { PasswordInputApi, PasswordInputSchema, PasswordInputTranslations } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { passwordInputStructure, withFieldDescription } from '@xihan-ui/headless'
import { defineComponent, h, onUnmounted } from 'vue'
import { withXhConfig } from '../../config/config'
import { renderStructure } from '../../runtime/structure'
import { useFieldLabelWiring, useFieldStateWiring } from '../field/use-field-control'
import { useFormControlProps } from '../form/use-form-control'
import { providePasswordInput, usePasswordInputContext } from './context'
import { usePasswordInput } from './use-password-input'

type PasswordInputProps = PasswordInputSchema['props']

/** 默认插槽的载荷：当前值与空标志、明暗与大写锁定，以及写值与切换明暗的动作。 */
export type PasswordInputRootSlotProps = Pick<
  PasswordInputApi,
  'value' | 'empty' | 'revealed' | 'capsLock' | 'inputType' | 'setValue' | 'setRevealed' | 'toggleRevealed'
>

export const XhPasswordInputRoot = defineComponent({
  name: 'XhPasswordInputRoot',
  props: {
    /** 标题文字。不写默认插槽时铺 label 部件；需要放置其他内容时改用 label 插槽。 */
    label: { type: String },
    /** 不显示出来的名字，写成 aria-label 落在与字段标签同一个部件上；放进字段或渲染了 label 部件时以它们为准。 */
    ariaLabel: { type: String },
    // 缺席值 undefined 表示非受控
    value: { type: String },
    defaultValue: { type: String },
    revealed: { type: Boolean, default: undefined },
    defaultRevealed: { type: Boolean, default: undefined },
    disabled: { type: Boolean, default: undefined },
    readOnly: { type: Boolean, default: undefined },
    required: { type: Boolean, default: undefined },
    invalid: { type: Boolean, default: undefined },
    name: { type: String },
    placeholder: { type: String },
    autoComplete: { type: String },
    strength: { type: Number },
    variant: { type: String as PropType<ControlVariant> },
    tone: { type: String as PropType<Tone> },
    size: { type: String as PropType<Size> },
    translations: { type: Object as PropType<Partial<PasswordInputTranslations>> },
  },
  // value-change 携带 { value }，update:value 携带裸串；明暗走 visibility-change 一路
  emits: {
    'value-change': (_details: PayloadOf<PasswordInputProps, 'onValueChange'>) => true,
    'update:value': (_value: PayloadOf<PasswordInputProps, 'onValueChange'>['value']) => true,
    'revealed-change': (_details: PayloadOf<PasswordInputProps, 'onRevealedChange'>) => true,
    'update:revealed': (_revealed: PayloadOf<PasswordInputProps, 'onRevealedChange'>['revealed']) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: PasswordInputRootSlotProps) => VNode[]
    /** 不写默认插槽时标题的内容，代替 label 文字。 */
    label?: () => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const onValueChange: PasswordInputProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const onRevealedChange: PasswordInputProps['onRevealedChange'] = (details) => {
      emit('revealed-change', details)
      emit('update:revealed', details.revealed)
    }
    const ctx = usePasswordInput(
      withXhConfig('password-input', useFormControlProps(props)) as PasswordInputProps,
      { onValueChange, onRevealedChange },
    )
    providePasswordInput(ctx)
    return () => {
      const api = ctx.api.value
      return h('div', api.getRootProps(), slots.default
        ? slots.default({
            value: api.value,
            empty: api.empty,
            revealed: api.revealed,
            capsLock: api.capsLock,
            inputType: api.inputType,
            setValue: api.setValue,
            setRevealed: api.setRevealed,
            toggleRevealed: api.toggleRevealed,
          })
        : renderDefaultStructure(api, props.label, slots.label))
    }
  },
})

export const XhPasswordInputLabel = defineComponent({
  name: 'XhPasswordInputLabel',
  setup(_, { slots }) {
    const ctx = usePasswordInputContext()
    // 渲出来就登记，在 setup 里同步做：排在输入之前时首帧与服务端直出就带上名字
    ctx.labelCount.value++
    onUnmounted(() => {
      ctx.labelCount.value--
    })
    // 必须是原生 <label>，connect 把 for 写向 input
    return () => h('label', ctx.api.value.getLabelProps(), slots.default?.())
  },
})

export const XhPasswordInputControl = defineComponent({
  name: 'XhPasswordInputControl',
  setup(_, { slots }) {
    const ctx = usePasswordInputContext()
    // 视觉盒：输入框、切换钮与大写锁定提示都排在它里面
    return () => h('div', ctx.api.value.getControlProps(), slots.default?.())
  },
})

export const XhPasswordInputInput = defineComponent({
  name: 'XhPasswordInputInput',
  setup() {
    // 字段的说明与校验状态要落在真控件上，不能停在封装根的 div 上
    const fieldWiring = useFieldStateWiring()
    // 字段的标签也得并进名字链：控件自带的那条指的是它自己那个没渲染的 label 部件
    const fieldLabel = useFieldLabelWiring()
    const ctx = usePasswordInputContext()
    // 原生 <input>：光标、选区与撤销都归浏览器，label 的 for 也指着它
    // 输入框自己的描述链（大写锁定提示）与字段的拼起来，不互相顶掉
    return () => h('input', fieldLabel.value(withFieldDescription(
      { ...fieldWiring.value, ...ctx.api.value.getInputProps() },
      fieldWiring.value['aria-describedby'] as string | undefined,
    )))
  },
})

export const XhPasswordInputVisibilityTrigger = defineComponent({
  name: 'XhPasswordInputVisibilityTrigger',
  setup(_, { slots }) {
    const ctx = usePasswordInputContext()
    // 原生 <button>，Enter / Space 的激活交给平台
    return () => h('button', ctx.api.value.getVisibilityTriggerProps(), slots.default?.())
  },
})

export const XhPasswordInputCapsLockIndicator = defineComponent({
  name: 'XhPasswordInputCapsLockIndicator',
  setup() {
    const ctx = usePasswordInputContext()
    // 区内文字由组件写：活区域播报的是内容，不是名字。关着时是空串，节点仍在场
    return () => h('span', ctx.api.value.getCapsLockIndicatorProps(), ctx.api.value.capsLockMessage)
  },
})

/** 强度条：档位由调用方评分后经 strength 传入，未提供时收起。 */
export const XhPasswordInputStrengthMeter = defineComponent({
  name: 'XhPasswordInputStrengthMeter',
  setup(_, { slots }) {
    const ctx = usePasswordInputContext()
    return () => h('div', ctx.api.value.getStrengthMeterProps(), slots.default?.())
  },
})

/** 标准结构里各部件对应的组件。 */
const PASSWORD_INPUT_PARTS = {
  'label': XhPasswordInputLabel,
  'control': XhPasswordInputControl,
  'input': XhPasswordInputInput,
  'caps-lock-indicator': XhPasswordInputCapsLockIndicator,
  'visibility-trigger': XhPasswordInputVisibilityTrigger,
  'strength-meter': XhPasswordInputStrengthMeter,
}

/**
 * 未写默认插槽时铺开的整套结构：照 headless 的 passwordInputStructure 渲，
 * 与 Web Components 不写部件时元素生成的节点出自同一份。标题由 label 插槽接管。
 */
function renderDefaultStructure(api: PasswordInputApi, label: string | undefined, labelSlot?: () => VNode[]): VNode[] {
  const nodes = passwordInputStructure(api, { label, slotted: name => name === 'label' && labelSlot != null })
  return renderStructure(nodes, PASSWORD_INPUT_PARTS, node => (node.slot ? labelSlot?.() : undefined))
}
