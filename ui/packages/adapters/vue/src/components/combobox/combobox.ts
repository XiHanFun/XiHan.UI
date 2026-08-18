import type { ComboboxApi, ComboboxInputBehavior, ComboboxInputEl, ComboboxInputHost, ComboboxItemGroupProps, ComboboxItemProps, ComboboxNode, ComboboxNodeMeta, ComboboxSchema } from '@xihan-ui/headless'
import type { ControlVariant, Placement, Size, Tone } from '@xihan-ui/kernel'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { computed, defineComponent, h, mergeProps, onMounted, onUnmounted, onUpdated, Teleport, watch } from 'vue'
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

/** 默认插槽的载荷：展开状态、选中值、输入串、高亮候选、空态，与改这些的命令。 */
export type ComboboxRootSlotProps = Pick<
  ComboboxApi,
  'open' | 'value' | 'inputValue' | 'highlightedValue' | 'empty' | 'isSelected' | 'setOpen' | 'setValue' | 'setInputValue' | 'clear'
>

export const XhComboboxRoot = defineComponent({
  name: 'XhComboboxRoot',
  // 有 connect 兜底的 prop 一律 default: undefined
  props: {
    collection: { type: Array as PropType<ComboboxNode[]>, default: undefined },
    /** 标题文字。给了它就不必再写 label 部件；要放别的内容改用 label 插槽。 */
    label: { type: String, default: undefined },
    /** 无匹配时的提示语。给了它就不必再写 empty 部件；要放别的内容改用 empty 插槽。 */
    empty: { type: String, default: undefined },
    value: { type: [String, Array] as PropType<string | string[]>, default: undefined },
    defaultValue: { type: [String, Array] as PropType<string | string[]>, default: undefined },
    inputValue: { type: String, default: undefined },
    defaultInputValue: { type: String, default: undefined },
    open: { type: Boolean, default: undefined },
    defaultOpen: Boolean,
    /** 表单字段名；给了 hidden-input 才带 name 并参与提交 */
    name: { type: String, default: undefined },
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
    variant: { type: String as PropType<ControlVariant>, default: undefined },
    tone: { type: String as PropType<Tone>, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
  },
  // *-change 携带 details 对象，update:* 携带裸值
  emits: {
    'value-change': (_details: PayloadOf<ComboboxProps, 'onValueChange'>) => true,
    'input-value-change': (_details: PayloadOf<ComboboxProps, 'onInputValueChange'>) => true,
    'open-change': (_details: PayloadOf<ComboboxProps, 'onOpenChange'>) => true,
    'update:value': (_value: PayloadOf<ComboboxProps, 'onValueChange'>['value']) => true,
    'update:inputValue': (_inputValue: PayloadOf<ComboboxProps, 'onInputValueChange'>['inputValue']) => true,
    'update:open': (_open: PayloadOf<ComboboxProps, 'onOpenChange'>['open']) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: ComboboxRootSlotProps) => VNode[]
    label?: () => VNode[]
    empty?: () => VNode[]
    item?: (node: ComboboxNodeMeta) => VNode[]
  }>,
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

    return () => h(
      'div',
      ctx.api.value.getRootProps() as Record<string, unknown>,
      slots.default
        ? slots.default({
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
          })
        : props.collection
          ? renderDefaultTree(
              ctx.api.value.collection,
              slots.label?.() ?? (props.label != null ? [props.label] : null),
              slots.empty?.() ?? (props.empty != null ? [props.empty] : null),
              slots.item,
            )
          : [],
    )
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
  props: {
    /**
     * 输入框渲染成哪个标签，默认 input。
     * 写 textarea 即多行宿主：connect 随之撤掉 type、role 与 aria-expanded。
     */
    as: { type: String as PropType<ComboboxInputHost>, default: 'input' },
  },
  setup(props) {
    const ctx = useComboboxContext()
    return () => h(props.as, {
      ...ctx.api.value.getInputProps({ as: props.as }) as Record<string, unknown>,
      ref: (el: unknown) => { ctx.inputRef.value = el as ComboboxInputEl },
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
  // 根是 Teleport，Vue 不会把直通属性合上去，作者写的 class 与 style 得自己接住落到 positioner 上
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    const ctx = useComboboxContext()
    // 搬到 portal 落点：留在原地的话，宿主祖先只要建了层叠上下文就能盖住浮层
    return () => h(Teleport, { to: ctx.portalTarget.value }, [
      h('div', {
        ...mergeProps(ctx.api.value.getPositionerProps() as Record<string, unknown>, attrs),
        ref: (el: unknown) => { ctx.positionerRef.value = el as HTMLElement },
      }, slots.default?.()),
    ])
  },
})

export const XhComboboxContent = defineComponent({
  name: 'XhComboboxContent',
  setup(_, { slots }) {
    const ctx = useComboboxContext()
    return () => h('div', {
      ...ctx.api.value.getContentProps() as Record<string, unknown>,
      // 收起跟着退场闸门走：皮肤刻意没给 content 补 [hidden]{display:none}（补了退场
      // 就一帧都播不出来），所以真正的收起落成内联 display——节点始终留在原地
      style: ctx.visible.value ? undefined : { display: 'none' },
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
    // 缺省交给 connect 回 collection 里查，写死 false 会盖掉数据里的禁用
    disabled: { type: Boolean, default: undefined },
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

export const XhComboboxHiddenInput = defineComponent({
  name: 'XhComboboxHiddenInput',
  setup() {
    const ctx = useComboboxContext()
    // 表单出口，不写这个部件即不参与表单提交
    return () => h('input', ctx.api.value.getHiddenInputProps() as Record<string, unknown>)
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

/**
 * 没写默认插槽时按 collection 铺开的整套结构，作者只交数据。
 * 与手写部件产出的 DOM 完全一致，要改结构就写默认插槽，行为不变。
 * 过滤仍归调用方：collection 就是此刻该显示的那几条候选。
 */
function renderDefaultTree(
  collection: readonly ComboboxNodeMeta[],
  label: (VNode | string)[] | null,
  empty: (VNode | string)[] | null,
  itemSlot?: (node: ComboboxNodeMeta) => VNode[],
): VNode[] {
  return [
    ...(label ? [h(XhComboboxLabel, null, () => label)] : []),
    h(XhComboboxControl, null, () => [
      h(XhComboboxInput),
      h(XhComboboxTrigger),
      h(XhComboboxClearTrigger),
    ]),
    h(XhComboboxPositioner, null, () => [
      h(XhComboboxContent, null, () => collection.map(node =>
        h(XhComboboxItem, { key: node.value, value: node.value }, () => [
          h(XhComboboxItemText, null, () => itemSlot?.(node) ?? node.label),
          h(XhComboboxItemIndicator),
        ]),
      )),
      // 空态节点是 content 的兄弟，不进 role=listbox
      h(XhComboboxEmpty, null, () => empty ?? []),
    ]),
  ]
}
