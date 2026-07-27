import type { EditableActivationMode, EditableSchema, EditableSubmitMode } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { defineComponent, h } from 'vue'
import { provideEditable, useEditableContext } from './context'
import { useEditable } from './use-editable'

type EditableProps = EditableSchema['props']

export const XhEditableRoot = defineComponent({
  name: 'XhEditableRoot',
  // 缺省值的唯一事实源在 connect 与机器里 —— 凡是那边有兜底的一律 default: undefined。
  // selectOnFocus 尤其：裸 Boolean 声明会把缺省压成 false，进编辑态就再也不全选了
  props: {
    value: { type: String, default: undefined },
    defaultValue: { type: String, default: undefined },
    edit: { type: Boolean, default: undefined },
    defaultEdit: Boolean,
    placeholder: { type: String, default: undefined },
    disabled: Boolean,
    readOnly: Boolean,
    invalid: Boolean,
    maxLength: { type: Number, default: undefined },
    name: { type: String, default: undefined },
    submitMode: { type: String as PropType<EditableSubmitMode>, default: undefined },
    activationMode: { type: String as PropType<EditableActivationMode>, default: undefined },
    selectOnFocus: { type: Boolean, default: undefined },
    autoResize: Boolean,
  },
  // value-change 携带 { value }；update:value 携带裸串，支持 v-model:value。
  // 编辑态同理走 update:edit。提交与撤销只有语义事件，没有 v-model 对应物
  emits: ['value-change', 'update:value', 'value-commit', 'value-revert', 'edit-change', 'update:edit'],
  setup(props, { slots, emit }) {
    const ctx = useEditable(props as EditableProps, {
      onValueChange: (details) => {
        emit('value-change', details)
        emit('update:value', details.value)
      },
      onValueCommit: details => emit('value-commit', details),
      onValueRevert: details => emit('value-revert', details),
      onEditChange: (details) => {
        emit('edit-change', details)
        emit('update:edit', details.edit)
      },
    })
    provideEditable(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      value: ctx.api.value.value,
      displayValue: ctx.api.value.displayValue,
      editing: ctx.api.value.editing,
      empty: ctx.api.value.empty,
      setValue: ctx.api.value.setValue,
      edit: ctx.api.value.edit,
      submit: ctx.api.value.submit,
      cancel: ctx.api.value.cancel,
    }))
  },
})

export const XhEditableLabel = defineComponent({
  name: 'XhEditableLabel',
  setup(_, { slots }) {
    const ctx = useEditableContext()
    return () => h('label', ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhEditableArea = defineComponent({
  name: 'XhEditableArea',
  setup(_, { slots }) {
    const ctx = useEditableContext()
    return () => h('div', ctx.api.value.getAreaProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhEditablePreview = defineComponent({
  name: 'XhEditablePreview',
  setup(_, { slots }) {
    const ctx = useEditableContext()
    // 作者写了插槽就听作者的，否则显示当下的值，值为空时显示 placeholder
    return () => h(
      'span',
      { ...ctx.api.value.getPreviewProps() as Record<string, unknown>, ref: ctx.previewRef },
      slots.default?.() ?? ctx.api.value.displayValue,
    )
  },
})

export const XhEditableInput = defineComponent({
  name: 'XhEditableInput',
  setup() {
    const ctx = useEditableContext()
    return () => h('input', { ...ctx.api.value.getInputProps() as Record<string, unknown>, ref: ctx.inputRef })
  },
})

export const XhEditableEditTrigger = defineComponent({
  name: 'XhEditableEditTrigger',
  setup(_, { slots }) {
    const ctx = useEditableContext()
    return () => h('button', ctx.api.value.getEditTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhEditableSubmitTrigger = defineComponent({
  name: 'XhEditableSubmitTrigger',
  setup(_, { slots }) {
    const ctx = useEditableContext()
    return () => h('button', ctx.api.value.getSubmitTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhEditableCancelTrigger = defineComponent({
  name: 'XhEditableCancelTrigger',
  setup(_, { slots }) {
    const ctx = useEditableContext()
    return () => h('button', ctx.api.value.getCancelTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhEditableControl = defineComponent({
  name: 'XhEditableControl',
  setup(_, { slots }) {
    const ctx = useEditableContext()
    return () => h('div', ctx.api.value.getControlProps() as Record<string, unknown>, slots.default?.())
  },
})
