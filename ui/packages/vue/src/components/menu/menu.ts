import type { Direction, Placement } from '@xihan-ui/core'
import type { MenuNode, MenuNodeMeta, MenuSchema } from '@xihan-ui/headless'
import type { PropType, VNode } from 'vue'
import { defineComponent, h, onBeforeUnmount, ref, watch } from 'vue'
import { provideMenu, useMenuContext } from './context'
import { useMenu } from './use-menu'

type MenuProps = MenuSchema['props']

export const XhMenuRoot = defineComponent({
  name: 'XhMenuRoot',
  // 缺省值由 connect 给出，这里一律 default: undefined
  props: {
    collection: { type: Array as PropType<MenuNode[]>, default: undefined },
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
    return () => (slots.default
      ? slots.default({ open: ctx.api.value.open, setOpen: ctx.api.value.setOpen })
      : props.collection
        ? renderDefaultTree(ctx.api.value.collection, slots.trigger?.() ?? null, slots.item)
        : [])
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
    // 缺省交给 connect 回 collection 里查，写死 false 会盖掉数据里的禁用
    disabled: { type: Boolean, default: undefined },
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

/**
 * 没写默认插槽时按 collection 铺开的整套结构，作者只交数据。
 * 与手写部件产出的 DOM 完全一致，要改结构就写默认插槽，行为不变。
 * 触发器内容归作者，由 trigger 插槽承载；条目内容缺省是 label，可由 item 插槽接管。
 */
function renderDefaultTree(
  collection: readonly MenuNodeMeta[],
  trigger: (VNode | string)[] | null,
  itemSlot?: (node: MenuNodeMeta) => VNode[],
): VNode[] {
  return [
    h(XhMenuTrigger, null, () => trigger ?? []),
    h(XhMenuPositioner, null, () => [
      h(XhMenuContent, null, () => collection.flatMap((node, index) => [
        // 首条上的标记不产出分隔线：菜单开头不留一道空隔
        ...(index > 0 && node.separatorBefore ? [h(XhMenuSeparator, { key: `separator:${node.value}` })] : []),
        h(XhMenuItem, { key: node.value, value: node.value }, () => itemSlot?.(node) ?? node.label),
      ])),
    ]),
  ]
}
