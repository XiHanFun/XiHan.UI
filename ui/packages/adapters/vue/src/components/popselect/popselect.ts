import type { PopselectItemProps, PopselectNode, PopselectNodeMeta } from '@xihan-ui/headless'
import type { Direction, Placement } from '@xihan-ui/kernel'
import type { PropType, VNode } from 'vue'
import type { PopselectNotifiers, PopselectRootProps } from './use-popselect'
import { computed, defineComponent, h, onBeforeUnmount, ref, watch } from 'vue'
import { providePopselect, providePopselectItem, usePopselectContext, usePopselectItemContext } from './context'
import { usePopselect } from './use-popselect'

export const XhPopselectRoot = defineComponent({
  name: 'XhPopselectRoot',
  // 有 connect 或机器兜底的 prop 一律 default: undefined
  props: {
    collection: { type: Array as PropType<PopselectNode[]>, default: undefined },
    value: { type: [String, Array] as PropType<string | string[]>, default: undefined },
    defaultValue: { type: [String, Array] as PropType<string | string[]>, default: undefined },
    multiple: Boolean,
    disabled: Boolean,
    loop: { type: Boolean, default: undefined },
    typeahead: { type: Boolean, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
    open: { type: Boolean, default: undefined },
    defaultOpen: Boolean,
    placement: { type: String as PropType<Placement>, default: undefined },
    offset: { type: Number, default: undefined },
    closeOnEscape: { type: Boolean, default: undefined },
    closeOnInteractOutside: { type: Boolean, default: undefined },
    variant: { type: String, default: undefined },
    tone: { type: String, default: undefined },
    size: { type: String, default: undefined },
  },
  // *-change 携带 details 对象，update:* 携带裸值；回传的选中值恒为数组，单选时长度 ≤ 1
  emits: ['value-change', 'open-change', 'update:value', 'update:open'],
  setup(props, { slots, emit }) {
    const notify: PopselectNotifiers = {
      onValueChange: (details) => {
        emit('value-change', details)
        emit('update:value', details.value)
      },
      onOpenChange: (details) => {
        emit('open-change', details)
        emit('update:open', details.open)
      },
    }
    const ctx = usePopselect(props as PopselectRootProps, notify)
    providePopselect(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      open: ctx.api.value.open,
      value: ctx.api.value.value,
      collection: ctx.api.value.collection,
      focusedValue: ctx.api.value.focusedValue,
      isSelected: ctx.api.value.isSelected,
      setOpen: ctx.api.value.setOpen,
      setValue: ctx.api.value.setValue,
      select: ctx.api.value.select,
    }))
  },
})

export const XhPopselectTrigger = defineComponent({
  name: 'XhPopselectTrigger',
  setup(_, { slots }) {
    const ctx = usePopselectContext()
    return () => h('button', {
      ...ctx.api.value.getTriggerProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.triggerRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhPopselectPositioner = defineComponent({
  name: 'XhPopselectPositioner',
  setup(_, { slots }) {
    const ctx = usePopselectContext()
    return () => h('div', {
      ...ctx.api.value.getPositionerProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.positionerRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhPopselectContent = defineComponent({
  name: 'XhPopselectContent',
  setup(_, { slots }) {
    const ctx = usePopselectContext()
    return () => h('div', {
      ...ctx.api.value.getContentProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.contentRef.value = el as HTMLElement },
    }, slots.default?.() ?? renderItems(ctx.api.value.collection, slots.item))
  },
})

export const XhPopselectItem = defineComponent({
  name: 'XhPopselectItem',
  props: {
    value: { type: String, required: true },
    // 缺省交给 connect 回 collection 里查，写死 false 会盖掉数据里的禁用
    disabled: { type: Boolean, default: undefined },
  },
  setup(props, { slots }) {
    const ctx = usePopselectContext()
    const item = computed<PopselectItemProps>(() => ({ value: props.value, disabled: props.disabled }))
    providePopselectItem({ item })
    // 本条目持有焦点时，value 变更重报焦点条目，卸载时上报列表失焦
    const itemEl = ref<HTMLElement | null>(null)
    watch(() => props.value, (next, prev) => {
      if (next === prev)
        return
      const { listbox } = ctx
      if (listbox.getStatus() !== 'Started')
        return
      if (itemEl.value && listbox.scope.getActiveElement() === itemEl.value)
        listbox.send({ type: 'ITEM.FOCUS', value: next })
    })
    onBeforeUnmount(() => {
      const { listbox } = ctx
      if (listbox.getStatus() !== 'Started')
        return
      // 按「本节点当下正持有焦点」判定，不按 value 比对
      if (itemEl.value && listbox.scope.getActiveElement() === itemEl.value)
        listbox.send({ type: 'LIST.BLUR' })
    })
    return () => h(
      'div',
      { ...ctx.api.value.getItemProps(item.value) as Record<string, unknown>, ref: itemEl },
      slots.default?.(),
    )
  },
})

export const XhPopselectItemText = defineComponent({
  name: 'XhPopselectItemText',
  setup(_, { slots }) {
    const ctx = usePopselectContext()
    const { item } = usePopselectItemContext()
    return () => h('span', ctx.api.value.getItemTextProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhPopselectItemIndicator = defineComponent({
  name: 'XhPopselectItemIndicator',
  setup(_, { slots }) {
    const ctx = usePopselectContext()
    const { item } = usePopselectItemContext()
    return () => h('span', ctx.api.value.getItemIndicatorProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

/**
 * 浮层里没写默认插槽时按 collection 铺开的条目，作者只交数据。
 * 与手写部件产出的 DOM 完全一致，要在条目之外放别的节点就写默认插槽。
 */
function renderItems(
  collection: readonly PopselectNodeMeta[],
  itemSlot?: (node: PopselectNodeMeta) => VNode[],
): VNode[] {
  return collection.map(node =>
    h(XhPopselectItem, { key: node.value, value: node.value }, () => [
      h(XhPopselectItemText, null, () => itemSlot?.(node) ?? node.label),
      h(XhPopselectItemIndicator),
    ]),
  )
}
