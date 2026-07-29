import type { Direction, Placement } from '@xihan-ui/core'
import type { ContextMenuGroupProps, ContextMenuItemProps, ContextMenuSchema } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { computed, defineComponent, h, onBeforeUnmount, ref, watch } from 'vue'
import {
  provideContextMenu,
  provideContextMenuGroup,
  provideContextMenuItem,
  useContextMenuContext,
  useContextMenuGroupContext,
  useContextMenuItemContext,
} from './context'
import { useContextMenu } from './use-context-menu'

type ContextMenuProps = ContextMenuSchema['props']

export const XhContextMenuRoot = defineComponent({
  name: 'XhContextMenuRoot',
  // 缺省值由 connect 与机器给出，这里一律 default: undefined
  props: {
    open: { type: Boolean, default: undefined },
    defaultOpen: Boolean,
    placement: { type: String as PropType<Placement>, default: undefined },
    offset: { type: Number, default: undefined },
    loop: { type: Boolean, default: undefined },
    typeahead: { type: Boolean, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
    longPressDelay: { type: Number, default: undefined },
  },
  // open-change 携带 { open }、select 携带 { value }，update:open 携带裸布尔
  emits: ['open-change', 'select', 'update:open'],
  setup(props, { slots, emit }) {
    const notifyOpen: ContextMenuProps['onOpenChange'] = (details) => {
      emit('open-change', details)
      emit('update:open', details.open)
    }
    const notifySelect: ContextMenuProps['onSelect'] = details => emit('select', details)
    const ctx = useContextMenu(props as ContextMenuProps, notifyOpen, notifySelect)
    provideContextMenu(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      open: ctx.api.value.open,
      point: ctx.api.value.point,
      setOpen: ctx.api.value.setOpen,
      openAt: ctx.api.value.openAt,
    }))
  },
})

export const XhContextMenuTrigger = defineComponent({
  name: 'XhContextMenuTrigger',
  setup(_, { slots }) {
    const ctx = useContextMenuContext()
    // 触发区渲染为 div，语义由 connect 打上的 ARIA 属性给出
    return () => h('div', {
      ...ctx.api.value.getTriggerProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.triggerRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhContextMenuPositioner = defineComponent({
  name: 'XhContextMenuPositioner',
  setup(_, { slots }) {
    const ctx = useContextMenuContext()
    return () => h('div', {
      ...ctx.api.value.getPositionerProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.positionerRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhContextMenuContent = defineComponent({
  name: 'XhContextMenuContent',
  setup(_, { slots }) {
    const ctx = useContextMenuContext()
    return () => h('div', {
      ...ctx.api.value.getContentProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.contentRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhContextMenuGroup = defineComponent({
  name: 'XhContextMenuGroup',
  props: {
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useContextMenuContext()
    const group = computed<ContextMenuGroupProps>(() => ({ value: props.value }))
    provideContextMenuGroup({ group })
    return () => h('div', ctx.api.value.getGroupProps(group.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhContextMenuGroupLabel = defineComponent({
  name: 'XhContextMenuGroupLabel',
  setup(_, { slots }) {
    const ctx = useContextMenuContext()
    const { group } = useContextMenuGroupContext()
    return () => h('span', ctx.api.value.getGroupLabelProps(group.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhContextMenuItem = defineComponent({
  name: 'XhContextMenuItem',
  props: {
    value: { type: String, required: true },
    disabled: Boolean,
  },
  setup(props, { slots }) {
    const ctx = useContextMenuContext()
    const item = computed<ContextMenuItemProps>(() => ({ value: props.value, disabled: props.disabled }))
    provideContextMenuItem({ item })
    // 本条目持有焦点时，value 变更按新值重报焦点条目，卸载时上报焦点丢失
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
      // 根已停机时不再送事件
      if (service.getStatus() !== 'Started')
        return
      // 按「本节点当下正持有焦点」判定，不按 value 比对
      if (itemEl.value && service.scope.getActiveElement() === itemEl.value)
        service.send({ type: 'ITEM.LOST' })
    })
    return () => h(
      'div',
      { ...ctx.api.value.getItemProps(item.value) as Record<string, unknown>, ref: itemEl },
      slots.default?.(),
    )
  },
})

export const XhContextMenuItemText = defineComponent({
  name: 'XhContextMenuItemText',
  setup(_, { slots }) {
    const ctx = useContextMenuContext()
    const { item } = useContextMenuItemContext()
    return () => h('span', ctx.api.value.getItemTextProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhContextMenuItemIndicator = defineComponent({
  name: 'XhContextMenuItemIndicator',
  setup(_, { slots }) {
    const ctx = useContextMenuContext()
    const { item } = useContextMenuItemContext()
    return () => h('span', ctx.api.value.getItemIndicatorProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhContextMenuSeparator = defineComponent({
  name: 'XhContextMenuSeparator',
  setup() {
    const ctx = useContextMenuContext()
    return () => h('div', ctx.api.value.getSeparatorProps() as Record<string, unknown>)
  },
})

export const XhContextMenuArrow = defineComponent({
  name: 'XhContextMenuArrow',
  setup() {
    const ctx = useContextMenuContext()
    return () => h('div', ctx.api.value.getArrowProps() as Record<string, unknown>)
  },
})
