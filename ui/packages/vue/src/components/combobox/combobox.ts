import type { Placement } from '@xihan-ui/core'
import type { ComboboxInputBehavior, ComboboxItemGroupProps, ComboboxItemProps, ComboboxSchema } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { computed, defineComponent, h, onMounted, onUnmounted, onUpdated, watch } from 'vue'
import {
  provideCombobox,
  provideComboboxItem,
  provideComboboxItemGroup,
  useComboboxContext,
  useComboboxItemContext,
  useComboboxItemGroupContext,
} from './context'
import { useCombobox } from './use-combobox'

type ComboboxProps = ComboboxSchema['props']

export const XhComboboxRoot = defineComponent({
  name: 'XhComboboxRoot',
  // 有 connect 兜底的 prop 一律 default: undefined
  props: {
    value: { type: [String, Array] as PropType<string | string[]>, default: undefined },
    defaultValue: { type: [String, Array] as PropType<string | string[]>, default: undefined },
    inputValue: { type: String, default: undefined },
    defaultInputValue: { type: String, default: undefined },
    open: { type: Boolean, default: undefined },
    defaultOpen: Boolean,
    multiple: Boolean,
    disabled: Boolean,
    readOnly: Boolean,
    invalid: Boolean,
    loop: { type: Boolean, default: undefined },
    placeholder: { type: String, default: undefined },
    allowCustomValue: Boolean,
    openOnClick: Boolean,
    inputBehavior: { type: String as PropType<ComboboxInputBehavior>, default: undefined },
    placement: { type: String as PropType<Placement>, default: undefined },
    offset: { type: Number, default: undefined },
    variant: { type: String, default: undefined },
    tone: { type: String, default: undefined },
    size: { type: String, default: undefined },
  },
  // *-change 携带 details 对象，update:* 携带裸值
  emits: ['value-change', 'input-value-change', 'open-change', 'update:value', 'update:inputValue', 'update:open'],
  setup(props, { slots, emit }) {
    const notifyValue: ComboboxProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const notifyInputValue: ComboboxProps['onInputValueChange'] = (details) => {
      emit('input-value-change', details)
      emit('update:inputValue', details.inputValue)
    }
    const notifyOpen: ComboboxProps['onOpenChange'] = (details) => {
      emit('open-change', details)
      emit('update:open', details.open)
    }
    const ctx = useCombobox(props as ComboboxProps, {
      onValueChange: notifyValue,
      onInputValueChange: notifyInputValue,
      onOpenChange: notifyOpen,
    })
    provideCombobox(ctx)

    // 首帧结算一次候选条数供空态节点判断，之后的增删由条目自己上报
    onMounted(ctx.syncItems)
    onUpdated(ctx.syncItems)

    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      open: ctx.api.value.open,
      value: ctx.api.value.value,
      inputValue: ctx.api.value.inputValue,
      highlightedValue: ctx.api.value.highlightedValue,
      empty: ctx.api.value.empty,
      isSelected: ctx.api.value.isSelected,
      setOpen: ctx.api.value.setOpen,
      setValue: ctx.api.value.setValue,
      setInputValue: ctx.api.value.setInputValue,
      clear: ctx.api.value.clear,
    }))
  },
})

export const XhComboboxLabel = defineComponent({
  name: 'XhComboboxLabel',
  setup(_, { slots }) {
    const ctx = useComboboxContext()
    // 用原生 label，connect 给的 for 指向输入框
    return () => h('label', ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhComboboxControl = defineComponent({
  name: 'XhComboboxControl',
  setup(_, { slots }) {
    const ctx = useComboboxContext()
    return () => h('div', {
      ...ctx.api.value.getControlProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.controlRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhComboboxInput = defineComponent({
  name: 'XhComboboxInput',
  setup() {
    const ctx = useComboboxContext()
    return () => h('input', {
      ...ctx.api.value.getInputProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.inputRef.value = el as HTMLInputElement },
    })
  },
})

export const XhComboboxTrigger = defineComponent({
  name: 'XhComboboxTrigger',
  setup(_, { slots }) {
    const ctx = useComboboxContext()
    return () => h('button', ctx.api.value.getTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhComboboxClearTrigger = defineComponent({
  name: 'XhComboboxClearTrigger',
  setup(_, { slots }) {
    const ctx = useComboboxContext()
    return () => h('button', ctx.api.value.getClearTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhComboboxPositioner = defineComponent({
  name: 'XhComboboxPositioner',
  setup(_, { slots }) {
    const ctx = useComboboxContext()
    return () => h('div', {
      ...ctx.api.value.getPositionerProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.positionerRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhComboboxContent = defineComponent({
  name: 'XhComboboxContent',
  setup(_, { slots }) {
    const ctx = useComboboxContext()
    return () => h('div', {
      ...ctx.api.value.getContentProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.contentRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhComboboxItemGroup = defineComponent({
  name: 'XhComboboxItemGroup',
  props: {
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useComboboxContext()
    const group = computed<ComboboxItemGroupProps>(() => ({ value: props.value }))
    provideComboboxItemGroup({ group })
    return () => h('div', ctx.api.value.getItemGroupProps(group.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhComboboxItemGroupLabel = defineComponent({
  name: 'XhComboboxItemGroupLabel',
  setup(_, { slots }) {
    const ctx = useComboboxContext()
    const { group } = useComboboxItemGroupContext()
    return () => h('span', ctx.api.value.getItemGroupLabelProps(group.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhComboboxItem = defineComponent({
  name: 'XhComboboxItem',
  props: {
    value: { type: String, required: true },
    disabled: Boolean,
  },
  setup(props, { slots }) {
    const ctx = useComboboxContext()
    const item = computed<ComboboxItemProps>(() => ({ value: props.value, disabled: props.disabled }))
    provideComboboxItem({ item })
    // 候选的进出与改名由条目自己上报，机器据此结算条数并摘掉悬空高亮
    onMounted(ctx.syncItems)
    onUnmounted(ctx.syncItems)
    // 节点就地复用时数量不变但身份换了，需按 value 另行上报
    watch(() => props.value, ctx.syncItems)
    return () => h('div', ctx.api.value.getItemProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhComboboxItemText = defineComponent({
  name: 'XhComboboxItemText',
  setup(_, { slots }) {
    const ctx = useComboboxContext()
    const { item } = useComboboxItemContext()
    return () => h('span', ctx.api.value.getItemTextProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhComboboxItemIndicator = defineComponent({
  name: 'XhComboboxItemIndicator',
  setup(_, { slots }) {
    const ctx = useComboboxContext()
    const { item } = useComboboxItemContext()
    return () => h('span', ctx.api.value.getItemIndicatorProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhComboboxEmpty = defineComponent({
  name: 'XhComboboxEmpty',
  setup(_, { slots }) {
    const ctx = useComboboxContext()
    // 放在 positioner 里作 content 的兄弟节点，不进 role=listbox
    return () => h('div', ctx.api.value.getEmptyProps() as Record<string, unknown>, slots.default?.())
  },
})
