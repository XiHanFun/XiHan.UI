import type { Direction, Placement } from '@xihan-ui/core'
import type { MenuSchema } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { defineComponent, h, onBeforeUnmount, ref, watch } from 'vue'
import { provideMenu, useMenuContext } from './context'
import { useMenu } from './use-menu'

type MenuProps = MenuSchema['props']

export const XhMenuRoot = defineComponent({
  name: 'XhMenuRoot',
  // 缺省值由 connect 给出，这里一律 default: undefined
  props: {
    open: { type: Boolean, default: undefined },
    defaultOpen: Boolean,
    placement: { type: String as PropType<Placement>, default: undefined },
    offset: { type: Number, default: undefined },
    loop: { type: Boolean, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
    tone: { type: String, default: undefined },
    size: { type: String, default: undefined },
  },
  // open-change 携带 { open }、select 携带 { value }，update:open 携带裸布尔
  emits: ['open-change', 'select', 'update:open'],
  setup(props, { slots, emit }) {
    const notifyOpen: MenuProps['onOpenChange'] = (details) => {
      emit('open-change', details)
      emit('update:open', details.open)
    }
    const notifySelect: MenuProps['onSelect'] = details => emit('select', details)
    const ctx = useMenu(props as MenuProps, notifyOpen, notifySelect)
    provideMenu(ctx)
    return () => slots.default?.({ open: ctx.api.value.open, setOpen: ctx.api.value.setOpen })
  },
})

export const XhMenuTrigger = defineComponent({
  name: 'XhMenuTrigger',
  setup(_, { slots }) {
    const ctx = useMenuContext()
    return () => h('button', {
      ...ctx.api.value.getTriggerProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.triggerRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhMenuPositioner = defineComponent({
  name: 'XhMenuPositioner',
  setup(_, { slots }) {
    const ctx = useMenuContext()
    return () => h('div', {
      ...ctx.api.value.getPositionerProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.positionerRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhMenuContent = defineComponent({
  name: 'XhMenuContent',
  setup(_, { slots }) {
    const ctx = useMenuContext()
    return () => h('div', {
      ...ctx.api.value.getContentProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.contentRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhMenuItem = defineComponent({
  name: 'XhMenuItem',
  props: {
    value: { type: String, required: true },
    disabled: Boolean,
  },
  setup(props, { slots }) {
    const ctx = useMenuContext()
    // 本条目持有焦点时，value 变更按新值重报焦点条目，卸载时上报焦点丢失
    const itemEl = ref<HTMLElement | null>(null)
    watch(() => props.value, (next, prev) => {
      if (next === prev)
        return
      const svc = ctx.service
      if (svc.getStatus() !== 'Started')
        return
      if (itemEl.value && svc.scope.getActiveElement() === itemEl.value)
        svc.send({ type: 'ITEM.FOCUS', value: next })
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
      { ...ctx.api.value.getItemProps({ value: props.value, disabled: props.disabled }) as Record<string, unknown>, ref: itemEl },
      slots.default?.(),
    )
  },
})

export const XhMenuSeparator = defineComponent({
  name: 'XhMenuSeparator',
  setup() {
    const ctx = useMenuContext()
    return () => h('div', ctx.api.value.getSeparatorProps() as Record<string, unknown>)
  },
})

export const XhMenuArrow = defineComponent({
  name: 'XhMenuArrow',
  setup() {
    const ctx = useMenuContext()
    return () => h('div', ctx.api.value.getArrowProps() as Record<string, unknown>)
  },
})
