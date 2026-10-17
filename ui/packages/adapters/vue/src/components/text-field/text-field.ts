/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 text field 相关实现。

import type { ControlVariant, Size, Tone } from '@xihan-ui/core'
import type { TextFieldApi, TextFieldInputHost, TextFieldSchema, TextFieldType } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { autoSizeTextarea, textFieldStructure } from '@xihan-ui/headless'
import { defineComponent, h, onBeforeUnmount, onMounted, onUnmounted, onUpdated, ref } from 'vue'
import { withXhConfig } from '../../config/config'
import { renderStructure } from '../../runtime/structure'
import { withHandlers } from '../../runtime/with-handlers'
import { useFieldLabelWiring, useFieldStateWiring } from '../field/use-field-control'
import { useFormControlProps } from '../form/use-form-control'
import { provideTextField, useTextFieldContext } from './context'
import { useTextField } from './use-text-field'

type TextFieldProps = TextFieldSchema['props']

/** 默认插槽的载荷：当前值、值状态标志与写值方法。 */
export type TextFieldRootSlotProps = Pick<
  TextFieldApi,
  'value' | 'empty' | 'atLimit' | 'count' | 'canClear' | 'setValue' | 'clear'
>

/** 字数部件默认插槽的载荷：当前字数、上限与已达上限的标志。 */
export type TextFieldCountSlotProps = Pick<TextFieldApi, 'count' | 'maxLength' | 'atLimit'>

export const XhTextFieldRoot = defineComponent({
  name: 'XhTextFieldRoot',
  props: {
    /** 标题文字。不写默认插槽时铺 label 部件；需要放置其他内容时改用 label 插槽。 */
    label: { type: String },
    /** 不写默认插槽时输入框铺 textarea（多行，接入 autoSize 自动高度）；手写部件时由 XhTextFieldInput 的 as 决定。 */
    multiline: Boolean,
    // 缺席值 undefined 表示非受控
    value: { type: String },
    defaultValue: { type: String },
    type: { type: String as PropType<TextFieldType> },
    placeholder: { type: String },
    // undefined 才表示「本实例没说」，Form/Field 才能安全地下传状态；false 是显式顶掉继承。
    disabled: { type: Boolean, default: undefined },
    readOnly: { type: Boolean, default: undefined },
    required: { type: Boolean, default: undefined },
    invalid: { type: Boolean, default: undefined },
    name: { type: String },
    maxLength: { type: Number },
    clearable: Boolean,
    showCount: Boolean,
    autoSize: { type: [Boolean, Object] as PropType<TextFieldProps['autoSize']>, default: undefined },
    variant: { type: String as PropType<ControlVariant> },
    tone: { type: String as PropType<Tone> },
    size: { type: String as PropType<Size> },
    translations: { type: Object as PropType<TextFieldProps['translations']> },
  },
  // value-change 携带 { value }，update:value 携带裸串
  emits: {
    'clear': () => true,
    'value-change': (_details: PayloadOf<TextFieldProps, 'onValueChange'>) => true,
    'update:value': (_value: PayloadOf<TextFieldProps, 'onValueChange'>['value']) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: TextFieldRootSlotProps) => VNode[]
    label?: () => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notify: TextFieldProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const ctx = useTextField(withHandlers(withXhConfig('text-field', useFormControlProps(props)), { onClear: () => emit('clear') }) as TextFieldProps, notify)
    provideTextField(ctx)
    return () => {
      const api = ctx.api.value
      return h('div', api.getRootProps() as Record<string, unknown>, slots.default
        ? slots.default({
            value: api.value,
            empty: api.empty,
            atLimit: api.atLimit,
            count: api.count,
            canClear: api.canClear,
            setValue: api.setValue,
            clear: api.clear,
          })
        : renderDefaultStructure(api, { label: props.label, multiline: props.multiline }, slots.label))
    }
  },
})

export const XhTextFieldLabel = defineComponent({
  name: 'XhTextFieldLabel',
  setup(_, { slots }) {
    const ctx = useTextFieldContext()
    // 渲出来就登记，在 setup 里同步做：排在输入之前时首帧与服务端直出就带上名字
    ctx.labelCount.value++
    onUnmounted(() => {
      ctx.labelCount.value--
    })
    // 必须是原生 <label>，connect 把 for 写向 input
    return () => h('label', ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTextFieldControl = defineComponent({
  name: 'XhTextFieldControl',
  setup(_, { slots }) {
    const ctx = useTextFieldContext()
    // 视觉盒：输入框与清空按钮都放进来，皮肤把描边、底色、聚焦环画在它身上
    return () => h('div', ctx.api.value.getControlProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTextFieldInput = defineComponent({
  name: 'XhTextFieldInput',
  props: {
    /** 输入框渲染为哪个标签，默认 input；写 textarea 即多行宿主，接入 autoSize 自动高度。 */
    as: { type: String as PropType<TextFieldInputHost>, default: 'input' },
  },
  setup(props) {
    // 字段的说明与校验状态要落在真控件上，不能停在封装根的 div 上
    const fieldWiring = useFieldStateWiring()
    // 字段的标签也得并进名字链：控件自带的那条指的是它自己那个没渲染的 label 部件
    const fieldLabel = useFieldLabelWiring()
    const ctx = useTextFieldContext()
    const el = ref<HTMLTextAreaElement | null>(null)
    const setInputRef = (node: unknown): void => {
      const next = props.as === 'textarea' ? node as HTMLTextAreaElement | null : null
      if (el.value && el.value !== next)
        autoSizeTextarea(el.value, false)
      el.value = next
    }
    const syncAutoSize = (): void => {
      if (el.value)
        autoSizeTextarea(el.value, ctx.api.value.autoSize)
    }
    // 模板 ref 赋值时节点尚未接入 Document；挂载及更新提交后再量，程序化写值与配置变化也走这条。
    onMounted(syncAutoSize)
    onUpdated(syncAutoSize)
    onBeforeUnmount(() => {
      if (el.value)
        autoSizeTextarea(el.value, false)
      el.value = null
    })
    // 自己渲染宿主节点，label 的 for 指向它
    return () => h(props.as, fieldLabel.value({
      ...fieldWiring.value,
      ...ctx.api.value.getInputProps({ as: props.as }) as Record<string, unknown>,
      ref: setInputRef,
    }))
  },
})

export const XhTextFieldPrefix = defineComponent({
  name: 'XhTextFieldPrefix',
  setup(_, { slots }) {
    const ctx = useTextFieldContext()
    return () => h('span', ctx.api.value.getPrefixProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTextFieldSuffix = defineComponent({
  name: 'XhTextFieldSuffix',
  setup(_, { slots }) {
    const ctx = useTextFieldContext()
    return () => h('span', ctx.api.value.getSuffixProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTextFieldClearTrigger = defineComponent({
  name: 'XhTextFieldClearTrigger',
  setup(_, { slots }) {
    const ctx = useTextFieldContext()
    return () => h('button', ctx.api.value.getClearTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

/** 字数：未写内容时渲染 `已用 / 上限`，未设上限时只渲染已用。 */
export const XhTextFieldCount = defineComponent({
  name: 'XhTextFieldCount',
  slots: Object as SlotsType<{
    default?: (props: TextFieldCountSlotProps) => VNode[]
  }>,
  setup(_, { slots }) {
    const ctx = useTextFieldContext()
    return () => {
      const api = ctx.api.value
      const fallback = api.maxLength === undefined ? `${api.count}` : `${api.count} / ${api.maxLength}`
      return h(
        'span',
        api.getCountProps() as Record<string, unknown>,
        slots.default?.({ count: api.count, maxLength: api.maxLength, atLimit: api.atLimit }) ?? fallback,
      )
    }
  },
})

/** 标准结构里各部件对应的组件。 */
const TEXT_FIELD_PARTS = {
  'label': XhTextFieldLabel,
  'control': XhTextFieldControl,
  'input': XhTextFieldInput,
  'clear-trigger': XhTextFieldClearTrigger,
  'count': XhTextFieldCount,
}

/** 多行时标准结构里的输入框：XhTextFieldInput 以 textarea 渲染。 */
const XhTextFieldTextarea = defineComponent({
  name: 'XhTextFieldTextarea',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => h(XhTextFieldInput, { ...attrs, as: 'textarea' }, slots)
  },
})

/**
 * 未写默认插槽时铺开的整套结构：照 headless 的 textFieldStructure 渲，
 * 与 Web Components 不写部件时元素生成的节点出自同一份。标题由 label 插槽接管。
 */
function renderDefaultStructure(api: TextFieldApi, options: { label?: string, multiline: boolean }, labelSlot?: () => VNode[]): VNode[] {
  const nodes = textFieldStructure(api, { ...options, slotted: name => name === 'label' && labelSlot != null })
  const parts = options.multiline ? { ...TEXT_FIELD_PARTS, input: XhTextFieldTextarea } : TEXT_FIELD_PARTS
  return renderStructure(nodes, parts, node => (node.slot ? labelSlot?.() : undefined))
}
