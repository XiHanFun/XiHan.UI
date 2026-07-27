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
  // 缺省值的唯一事实源在 connect —— 凡是 connect 有兜底的一律 default: undefined
  // （loop 尤其：裸 Boolean 声明会把缺省压成 false，回绕就默默关掉了）
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
  },
  // *-change 携带 details 对象；update:* 携带裸值，支持 v-model:value / v-model:inputValue / v-model:open
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

    // 首帧先结算一次候选条数（空态节点据此显形）。
    // 之后的增删由条目自己上报——候选多半住在插槽里，那份 v-for 的响应式依赖记在
    // 渲染它的那个组件身上，根部件可能压根不重渲，onUpdated 在这儿是靠不住的信号。
    // 这里仍挂一个 onUpdated：条目原地改写（v-for 复用节点）时数量不变，聊胜于无。
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
    // 必须是 <label>：connect 给的 for 只在原生 label 上生效，点标题聚焦输入框靠它
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
    // 候选进出与改名都由条目自己上报：这是唯一可靠的信号——候选多半住在插槽里，
    // 那份 v-for 的响应式依赖记在渲染它的那个组件身上，根部件可能压根不重渲。
    // 机器据此结算候选条数（空态节点靠它显形），并摘掉指向已消失候选的悬空高亮
    // （不摘的话 aria-activedescendant 会指着一个不存在的 id，读屏当场哑掉）。
    // 卸载用 onUnmounted 而不是 onBeforeUnmount：后者跑在节点还在文档里的时候，现查会多数出一条。
    onMounted(ctx.syncItems)
    onUnmounted(ctx.syncItems)
    // v-for 不带 key 时 Vue 就地复用节点：数量没变、身份却换了，只看增删会漏掉
    watch(() => props.value, ctx.syncItems)
    // 候选不承载焦点（焦点恒在输入框），因此不必像 Listbox 那样另行补报焦点离场
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
    // 摆在 positioner 里当 content 的兄弟：role=listbox 内只允许 option 与 group，
    // 空态提示挤进列表会把无障碍树弄坏
    return () => h('div', ctx.api.value.getEmptyProps() as Record<string, unknown>, slots.default?.())
  },
})
