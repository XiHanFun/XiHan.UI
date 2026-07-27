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
  // 全部 default: undefined —— 缺省值的唯一事实源在 connect 与机器（loop / typeahead 尤其：
  // 裸 Boolean 声明会把缺省压成 false，回绕与连打就默默关掉了）
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
  // open-change 携带 { open }、select 携带 { value }；update:open 携带裸布尔，支持 v-model:open
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
    // 触发区是一块普通内容区域，不是按钮：渲染成 div，语义全靠 connect 打上的 ARIA 属性
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
    // 承载焦点的条目被移出 DOM 时浏览器不派 focusout，锚点会停在一个已消失的值上：
    // 没有条目认领 tabindex=0、方向键也失去起点。卸载前如实上报，机器就地重挑锚点。
    // v-for 不带 key 时 Vue 会就地复用节点：被删的是"最后一个组件实例"，
    // 而持有焦点的那个 DOM 节点还在、value 却被改成了别的条目。此时锚点仍指着旧值、
    // 已无人认领，键盘就此失灵。自己正持有焦点且 value 变了，就按新值重报一次。
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
      // 整组一起卸载时根先停机，此刻无焦点可言（送事件还会在 dev 下抛）
      if (service.getStatus() !== 'Started')
        return
      // 判据是「本节点当下正持有焦点」，不是「值对得上」：v-for 就地复用时
      // 被卸载的是末位实例、它的 value 可能恰好等于刚纠正过的锚点，按值判会把好端端的锚点清掉
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
