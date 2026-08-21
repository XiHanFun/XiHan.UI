import type { ContextMenuApi, ContextMenuGroupProps, ContextMenuItemProps, ContextMenuNode, ContextMenuNodeMeta, ContextMenuSchema, MenuApi } from '@xihan-ui/headless'
import type { Direction, Placement, Size, Tone } from '@xihan-ui/kernel'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { mergeProps } from '@xihan-ui/kernel'
import { computed, defineComponent, h, mergeProps as mergeVueProps, onBeforeUnmount, ref, Teleport, watch } from 'vue'
import { withXhConfig } from '../../config/config'
import { mergeIntoChild } from '../../runtime/as-child'
import { provideMenu, provideMenuChain, useMenuContext } from '../menu/context'
import { useMenu } from '../menu/use-menu'
import {
  provideContextMenu,
  provideContextMenuChain,
  provideContextMenuGroup,
  provideContextMenuItem,
  provideContextMenuSub,
  useContextMenuChain,
  useContextMenuContext,
  useContextMenuGroupContext,
  useContextMenuItemContext,
  useContextMenuSubContext,
} from './context'
import { useContextMenu } from './use-context-menu'

type ContextMenuProps = ContextMenuSchema['props']

/** 默认插槽的载荷：右键菜单的展开态与锚点坐标，以及开合、按坐标展开的命令。 */
export type ContextMenuRootSlotProps = Pick<ContextMenuApi, 'open' | 'point' | 'setOpen' | 'openAt'>

/** 子菜单默认插槽的载荷：这一层子菜单自己的展开态与开合命令。 */
export type ContextMenuSubSlotProps = Pick<MenuApi, 'open' | 'setOpen'>

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
    translations: { type: Object as PropType<ContextMenuProps['translations']>, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
    longPressDelay: { type: Number, default: undefined },
    tone: { type: String as PropType<Tone>, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
  },
  // open-change 携带 { open }、select 携带 { value }，update:open 携带裸布尔
  emits: {
    'open-change': (_details: PayloadOf<ContextMenuProps, 'onOpenChange'>) => true,
    'select': (_details: PayloadOf<ContextMenuProps, 'onSelect'>) => true,
    'update:open': (_open: PayloadOf<ContextMenuProps, 'onOpenChange'>['open']) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: ContextMenuRootSlotProps) => VNode[]
    trigger?: () => VNode[]
    item?: (node: ContextMenuNodeMeta) => VNode[]
  }>,
  setup(props, { slots, emit, expose }) {
    const notifyOpen: ContextMenuProps['onOpenChange'] = (details) => {
      emit('open-change', details)
      emit('update:open', details.open)
    }
    const notifySelect: ContextMenuProps['onSelect'] = details => emit('select', details)
    const ctx = useContextMenu(withXhConfig('context-menu', props) as ContextMenuProps, notifyOpen, notifySelect)
    provideContextMenu(ctx)
    // 菜单钉在坐标上，坐标只能由 openAt 交进来。默认插槽那条路从载荷里拿，
    // 只交 collection 的那条路没有载荷，所以同一组命令也从实例上暴露一份。
    expose({
      openAt: (x: number, y: number) => ctx.api.value.openAt(x, y),
      setOpen: (open: boolean) => ctx.api.value.setOpen(open),
      get open() {
        return ctx.api.value.open
      },
      get point() {
        return ctx.api.value.point
      },
    })
    // 子菜单任意层级的选中都汇到根：先发根的 select 再关根，各级随父关闭级联收起
    provideContextMenuChain({
      notifySelect: (details) => {
        emit('select', details)
        ctx.api.value.setOpen(false)
      },
    })
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
  props: {
    /** 借用作者的子节点当触发器，不再渲染自己的包裹元素；子节点须恰好一个。 */
    asChild: Boolean,
  },
  setup(props, { slots }) {
    const ctx = useContextMenuContext()
    // 触发区渲染为 div，语义由 connect 打上的 ARIA 属性给出
    return () => {
      const attrs = {
        ...ctx.api.value.getTriggerProps() as Record<string, unknown>,
        ref: (el: unknown) => { ctx.triggerRef.value = el as HTMLElement },
      }
      const children = slots.default?.()
      // asChild：把触发器属性合到作者的节点上，不再自己渲染包裹元素
      if (props.asChild) {
        const merged = mergeIntoChild(children, attrs, 'context-menu')
        if (merged)
          return merged
      }
      return h('div', attrs, children)
    }
  },
})

export const XhContextMenuPositioner = defineComponent({
  name: 'XhContextMenuPositioner',
  // 根是 Teleport，Vue 不会把直通属性合上去，作者写的 class 与 style 得自己接住落到 positioner 上
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    const ctx = useContextMenuContext()
    // 搬到 portal 落点：留在原地的话，宿主祖先只要建了层叠上下文就能盖住浮层
    return () => h(Teleport, { to: ctx.portalTarget.value }, [
      h('div', {
        ...mergeVueProps(ctx.api.value.getPositionerProps() as Record<string, unknown>, attrs),
        ref: (el: unknown) => { ctx.positionerRef.value = el as HTMLElement },
      }, slots.default?.()),
    ])
  },
})

export const XhContextMenuContent = defineComponent({
  name: 'XhContextMenuContent',
  setup(_, { slots }) {
    const ctx = useContextMenuContext()
    return () => h('div', {
      ...ctx.api.value.getContentProps() as Record<string, unknown>,
      // 收起跟着退场闸门走：皮肤刻意没给 content 补 [hidden]{display:none}（补了退场
      // 就一帧都播不出来），所以真正的收起落成内联 display——节点始终留在原地
      style: ctx.visible.value ? undefined : { display: 'none' },
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

/**
 * 右键菜单里的子菜单：子层跑一台 submenu 模式的 menu 机器，触发条目由
 * XhContextMenuSubTrigger 渲染成「父层条目 + 子层触发器」的双重身份。
 * 子层内部用 XhMenu 系部件（再往深嵌套即 menu 套 menu）。本身不渲染节点。
 */
export const XhContextMenuSub = defineComponent({
  name: 'XhContextMenuSub',
  props: {
    /** 它在父右键菜单里的条目身份。 */
    value: { type: String, required: true },
    disabled: { type: Boolean, default: undefined },
    placement: { type: String as PropType<Placement>, default: undefined },
    offset: { type: Number, default: undefined },
    loop: { type: Boolean, default: undefined },
    openOnHover: { type: Boolean, default: undefined },
    hoverOpenDelay: { type: Number, default: undefined },
    /** 文字方向；缺省继承父层。子层被搬到浮层落点，继承不到父层的方向。 */
    dir: { type: String as PropType<Direction>, default: undefined },
    /** 语气；缺省继承父层。子层是浮层落点下的同级节点，CSS 私有槽继承不到。 */
    tone: { type: String as PropType<Tone>, default: undefined },
    /** 尺寸；缺省继承父层，理由同 tone。 */
    size: { type: String as PropType<Size>, default: undefined },
    hoverCloseDelay: { type: Number, default: undefined },
  },
  slots: Object as SlotsType<{
    default?: (props: ContextMenuSubSlotProps) => VNode[]
  }>,
  setup(props, { slots }) {
    const parent = useContextMenuContext()
    const chain = useContextMenuChain()
    const sub = useMenu(
      {
        ...props,
        submenu: true,
        dir: props.dir ?? parent.service.prop('dir'),
        tone: props.tone ?? parent.service.prop('tone'),
        size: props.size ?? parent.service.prop('size'),
      },
      undefined,
      details => chain.notifySelect(details),
    )
    // 子树内的 XhMenu 系部件都归子机器
    provideMenu(sub)
    // 子层里还能再嵌一层 XhMenuSub：那一层要往上找选中汇总的链，
    // 而链只在 XhMenuRoot 里 provide 过，右键菜单这一支得自己接上
    provideMenuChain({ notifySelect: details => chain.notifySelect(details) })
    provideContextMenuSub({ parent, value: props.value, disabled: props.disabled })
    // 父层收起（Escape、外点、选中）时本层跟着收，层层传导
    watch(() => parent.api.value.open, (open) => {
      if (!open)
        sub.api.value.setOpen(false)
    })
    return () => slots.default?.({ open: sub.api.value.open, setOpen: sub.api.value.setOpen })
  },
})

export const XhContextMenuSubTrigger = defineComponent({
  name: 'XhContextMenuSubTrigger',
  setup(_, { slots }) {
    const handle = useContextMenuSubContext()
    const sub = useMenuContext()
    return () => h('div', {
      // 合并序=子先父后：父层的 data-scope/data-part 胜出，父层的方向键与选中照常认它
      ...mergeProps(
        sub.api.value.getSubmenuTriggerProps({ value: handle.value, disabled: handle.disabled }) as Record<string, unknown>,
        handle.parent.api.value.getItemProps({ value: handle.value, disabled: handle.disabled }) as Record<string, unknown>,
      ),
      // 子菜单的定位锚点就是这一条
      ref: (el: unknown) => {
        sub.triggerRef.value = el as HTMLElement
      },
    }, slots.default?.())
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
