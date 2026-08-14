import type { ListboxApi, ListboxItemGroupProps, ListboxItemProps, ListboxNode, ListboxNodeMeta, ListboxSchema, ListboxSelectionMode } from '@xihan-ui/headless'
import type { Direction, Orientation } from '@xihan-ui/kernel'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { computed, defineComponent, h, onBeforeUnmount, ref, watch } from 'vue'
import {
  provideListbox,
  provideListboxItem,
  provideListboxItemGroup,
  useListboxContext,
  useListboxItemContext,
  useListboxItemGroupContext,
} from './context'
import { useListbox } from './use-listbox'

type ListboxProps = ListboxSchema['props']

/** 默认插槽的载荷：选中集合、选择模式与焦点锚点，以及判定选中与整份赋值、单选、切换的命令。 */
export type ListboxRootSlotProps = Pick<
  ListboxApi,
  'value' | 'selectionMode' | 'focusedValue' | 'isSelected' | 'setValue' | 'select' | 'toggle'
>

export const XhListboxRoot = defineComponent({
  name: 'XhListboxRoot',
  // 有 connect 兜底的 prop 一律 default: undefined
  props: {
    collection: { type: Array as PropType<ListboxNode[]>, default: undefined },
    /** 标题文字。给了它就不必再写 label 部件；要放别的内容改用 label 插槽。 */
    label: { type: String, default: undefined },
    value: { type: [String, Array] as PropType<string | string[]>, default: undefined },
    defaultValue: { type: [String, Array] as PropType<string | string[]>, default: undefined },
    multiple: Boolean,
    selectionMode: { type: String as PropType<ListboxSelectionMode>, default: undefined },
    disabled: Boolean,
    loop: { type: Boolean, default: undefined },
    typeahead: { type: Boolean, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
    orientation: { type: String as PropType<Orientation>, default: undefined },
  },
  // value-change 携带 { value }，update:value 携带裸集合；回传值恒为数组，单选时长度 ≤ 1
  emits: {
    'value-change': (_details: PayloadOf<ListboxProps, 'onValueChange'>) => true,
    'update:value': (_value: PayloadOf<ListboxProps, 'onValueChange'>['value']) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: ListboxRootSlotProps) => VNode[]
    label?: () => VNode[]
    item?: (node: ListboxNodeMeta) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notify: ListboxProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const ctx = useListbox(props as ListboxProps, notify)
    provideListbox(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, [
      ...(slots.default
        ? slots.default({
          value: ctx.api.value.value,
          selectionMode: ctx.api.value.selectionMode,
          focusedValue: ctx.api.value.focusedValue,
          isSelected: ctx.api.value.isSelected,
          setValue: ctx.api.value.setValue,
          select: ctx.api.value.select,
          toggle: ctx.api.value.toggle,
        }) ?? []
        : props.collection
          ? renderDefaultTree(
              ctx.api.value.collection,
              slots.label?.() ?? (props.label != null ? [props.label] : null),
              slots.item,
            )
          : []),
    ])
  },
})

export const XhListboxLabel = defineComponent({
  name: 'XhListboxLabel',
  setup(_, { slots }) {
    const ctx = useListboxContext()
    return () => h('span', ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhListboxContent = defineComponent({
  name: 'XhListboxContent',
  setup(_, { slots }) {
    const ctx = useListboxContext()
    return () => h('div', ctx.api.value.getContentProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhListboxItemGroup = defineComponent({
  name: 'XhListboxItemGroup',
  props: {
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useListboxContext()
    const group = computed<ListboxItemGroupProps>(() => ({ value: props.value }))
    provideListboxItemGroup({ group })
    return () => h('div', ctx.api.value.getItemGroupProps(group.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhListboxItemGroupLabel = defineComponent({
  name: 'XhListboxItemGroupLabel',
  setup(_, { slots }) {
    const ctx = useListboxContext()
    const { group } = useListboxItemGroupContext()
    return () => h('span', ctx.api.value.getItemGroupLabelProps(group.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhListboxItem = defineComponent({
  name: 'XhListboxItem',
  props: {
    value: { type: String, required: true },
    // 缺省交给 connect 回 collection 里查，写死 false 会盖掉数据里的禁用
    disabled: { type: Boolean, default: undefined },
  },
  setup(props, { slots }) {
    const ctx = useListboxContext()
    const item = computed<ListboxItemProps>(() => ({ value: props.value, disabled: props.disabled }))
    provideListboxItem({ item })
    // 本条目持有焦点时，value 变更重报焦点条目，卸载时上报列表失焦
    const itemEl = ref<HTMLElement | null>(null)
    watch(() => props.value, (next, prev) => {
      if (next === prev)
        return
      const { service } = ctx
      if (service.getStatus() !== 'Started')
        return
      if (itemEl.value && service.scope.getActiveElement() === itemEl.value)
        service.send({ type: 'ITEM.FOCUS', value: next })
    })
    onBeforeUnmount(() => {
      const { service } = ctx
      if (service.getStatus() !== 'Started')
        return
      // 按「本节点当下正持有焦点」判定，不按 value 比对
      if (itemEl.value && service.scope.getActiveElement() === itemEl.value)
        service.send({ type: 'LIST.BLUR' })
    })
    return () => h(
      'div',
      { ...ctx.api.value.getItemProps(item.value) as Record<string, unknown>, ref: itemEl },
      slots.default?.(),
    )
  },
})

export const XhListboxItemText = defineComponent({
  name: 'XhListboxItemText',
  setup(_, { slots }) {
    const ctx = useListboxContext()
    const { item } = useListboxItemContext()
    return () => h('span', ctx.api.value.getItemTextProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhListboxItemIndicator = defineComponent({
  name: 'XhListboxItemIndicator',
  setup(_, { slots }) {
    const ctx = useListboxContext()
    const { item } = useListboxItemContext()
    return () => h('span', ctx.api.value.getItemIndicatorProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

/**
 * 没写默认插槽时按 collection 铺开的整套结构，作者只交数据。
 * 与手写部件产出的 DOM 完全一致，要改结构（分组、条目外的节点）就写默认插槽。
 */
function renderDefaultTree(
  collection: readonly ListboxNodeMeta[],
  label: (VNode | string)[] | null,
  itemSlot?: (node: ListboxNodeMeta) => VNode[],
): VNode[] {
  return [
    ...(label ? [h(XhListboxLabel, null, () => label)] : []),
    h(XhListboxContent, null, () => collection.map(node =>
      h(XhListboxItem, { key: node.value, value: node.value }, () => [
        h(XhListboxItemText, null, () => itemSlot?.(node) ?? node.label),
        h(XhListboxItemIndicator),
      ]),
    )),
  ]
}
