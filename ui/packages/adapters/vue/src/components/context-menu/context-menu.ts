import type { ContextMenuGroupProps, ContextMenuItemProps, ContextMenuNode, ContextMenuNodeMeta, ContextMenuSchema } from '@xihan-ui/headless'
import type { Direction, Placement, Size, Tone } from '@xihan-ui/kernel'
import type { PropType, VNode } from 'vue'
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
    collection: { type: Array as PropType<ContextMenuNode[]>, default: undefined },
    open: { type: Boolean, default: undefined },
    defaultOpen: Boolean,
    placement: { type: String as PropType<Placement>, default: undefined },
    offset: { type: Number, default: undefined },
    loop: { type: Boolean, default: undefined },
    typeahead: { type: Boolean, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
    longPressDelay: { type: Number, default: undefined },
    tone: { type: String as PropType<Tone>, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
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
    return () => h(
      'div',
      ctx.api.value.getRootProps() as Record<string, unknown>,
      slots.default
        ? slots.default({
            open: ctx.api.value.open,
            point: ctx.api.value.point,
            setOpen: ctx.api.value.setOpen,
            openAt: ctx.api.value.openAt,
          })
        : props.collection
          ? renderDefaultTree(ctx.api.value.collection, slots.trigger?.() ?? null, slots.item)
          : [],
    )
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
    // 缺省交给 connect 回 collection 里查，写死 false 会盖掉数据里的禁用
    disabled: { type: Boolean, default: undefined },
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

/** 一段连续的同组条目；不分组的条目各自单独成段。 */
type NodeRun = [ContextMenuNodeMeta, ...ContextMenuNodeMeta[]]

/**
 * 没写默认插槽时按 collection 铺开的整套结构，作者只交数据。
 * 与手写部件产出的 DOM 完全一致，要改结构就写默认插槽，行为不变。
 * 触发区里放什么是作者的事，由 trigger 插槽给出。
 */
function renderDefaultTree(
  collection: readonly ContextMenuNodeMeta[],
  trigger: (VNode | string)[] | null,
  itemSlot?: (node: ContextMenuNodeMeta) => VNode[],
): VNode[] {
  return [
    h(XhContextMenuTrigger, null, () => trigger ?? []),
    h(XhContextMenuPositioner, null, () => [
      h(XhContextMenuContent, null, () => renderNodes(collection, itemSlot)),
    ]),
  ]
}

/** 相邻同 group 的条目并成一段，没写 group 的各自成段。 */
function groupRuns(collection: readonly ContextMenuNodeMeta[]): NodeRun[] {
  const runs: NodeRun[] = []
  for (const meta of collection) {
    const last = runs.at(-1)
    if (last && meta.group != null && last[0].group === meta.group)
      last.push(meta)
    else
      runs.push([meta])
  }
  return runs
}

/** content 的内容：分组段铺成 group，段首的分隔线落在 group 外面。 */
function renderNodes(
  collection: readonly ContextMenuNodeMeta[],
  itemSlot?: (node: ContextMenuNodeMeta) => VNode[],
): VNode[] {
  return groupRuns(collection).flatMap((run, runIndex) => {
    const head = run[0]
    // 首条上的标记不产出分隔线：菜单开头不留一道空隔
    const lead = runIndex > 0 && head.separatorBefore
      ? [h(XhContextMenuSeparator, { key: `separator:${head.value}` })]
      : []
    if (head.group == null)
      return [...lead, renderItem(head, itemSlot)]
    const groupLabel = run.find(node => node.groupLabel != null)?.groupLabel ?? null
    return [
      ...lead,
      h(XhContextMenuGroup, { key: `group:${head.group}`, value: head.group }, () => [
        ...(groupLabel != null ? [h(XhContextMenuGroupLabel, null, () => groupLabel)] : []),
        ...run.flatMap((node, index) => [
          ...(index > 0 && node.separatorBefore ? [h(XhContextMenuSeparator, { key: `separator:${node.value}` })] : []),
          renderItem(node, itemSlot),
        ]),
      ]),
    ]
  })
}

/** 单个条目：标记位排在文字前面，没给标记位就不铺那个部件。 */
function renderItem(
  meta: ContextMenuNodeMeta,
  itemSlot?: (node: ContextMenuNodeMeta) => VNode[],
): VNode {
  return h(XhContextMenuItem, { key: meta.value, value: meta.value }, () => [
    ...(meta.indicator != null ? [h(XhContextMenuItemIndicator, null, () => meta.indicator)] : []),
    h(XhContextMenuItemText, null, () => itemSlot?.(meta) ?? meta.label),
  ])
}
