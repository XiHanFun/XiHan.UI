/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context menu 相关实现。

import type { Direction, Placement, Size, Tone } from '@xihan-ui/core'
import type { ContextMenuApi, ContextMenuGroupProps, ContextMenuItemProps, ContextMenuNode, ContextMenuNodeMeta, ContextMenuSchema, MenuApi } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { groupAdjacentRuns, mergeProps } from '@xihan-ui/core'
import { computed, defineComponent, h, mergeProps as mergeVueProps, onBeforeUnmount, ref, watch } from 'vue'
import { withXhConfig } from '../../config/config'
import { mergeIntoChild } from '../../runtime/as-child'
import { mergePartProps } from '../../runtime/merge-props'
import { XhPortal } from '../../runtime/portal'
import { useScrollbars } from '../../runtime/use-scrollbars'
import { provideMenu, useMenuContext } from '../menu/context'
import { useMenuWithParent } from '../menu/use-menu'
import {
  provideContextMenu,
  provideContextMenuGroup,
  provideContextMenuItem,
  provideContextMenuSub,
  useContextMenuContext,
  useContextMenuGroupContext,
  useContextMenuItemContext,
  useContextMenuSubContext,
} from './context'
import { useContextMenu } from './use-context-menu'

type ContextMenuProps = ContextMenuSchema['props']

/** 默认插槽的载荷：右键菜单的展开态与锚点坐标，以及开合、按坐标展开的命令。 */
export type ContextMenuRootSlotProps = Pick<ContextMenuApi, 'open' | 'point' | 'setOpen' | 'openAt'>

/** 子菜单默认插槽的载荷：该层子菜单自己的展开态与开合命令。 */
export type ContextMenuSubSlotProps = Pick<MenuApi, 'open' | 'setOpen'>

/** 代铺条目时可逐槽接管的三个插槽；三个都不写即完全按数据铺。 */
export interface ContextMenuItemSlots {
  /** 只填条目的文字槽，其余槽照旧由数据铺。 */
  item?: (node: ContextMenuNodeMeta) => VNode[]
  /** 只接管行首那一格，其余槽照旧由数据铺。 */
  ['item-prefix']?: (node: ContextMenuNodeMeta) => VNode[]
  /** 只接管行尾那一格（计数、徽标、次级图标），其余槽照旧由数据铺。 */
  ['item-suffix']?: (node: ContextMenuNodeMeta) => VNode[]
}

export const XhContextMenuRoot = defineComponent({
  name: 'XhContextMenuRoot',
  // 缺省值由 connect 与机器给出；普通类型省略 default，Boolean 显式保留 undefined
  props: {
    collection: { type: Array as PropType<ContextMenuNode[]> },
    open: { type: Boolean, default: undefined },
    defaultOpen: Boolean,
    placement: { type: String as PropType<Placement> },
    offset: { type: Number },
    loop: { type: Boolean, default: undefined },
    typeahead: { type: Boolean, default: undefined },
    translations: { type: Object as PropType<ContextMenuProps['translations']> },
    dir: { type: String as PropType<Direction> },
    longPressDelay: { type: Number },
    tone: { type: String as PropType<Tone> },
    size: { type: String as PropType<Size> },
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
    'item-prefix'?: (node: ContextMenuNodeMeta) => VNode[]
    'item-suffix'?: (node: ContextMenuNodeMeta) => VNode[]
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
          ? renderDefaultTree(ctx.api.value.collection, slots.trigger?.() ?? null, { 'item': slots.item, 'item-prefix': slots['item-prefix'], 'item-suffix': slots['item-suffix'] })
          : [],
    )
  },
})

export const XhContextMenuTrigger = defineComponent({
  name: 'XhContextMenuTrigger',
  // 直通属性自己合：Vue 默认把作者的处理器排在部件的后面，这里改成作者先跑
  inheritAttrs: false,
  props: {
    /** 借用作者的子节点作为触发器，不再渲染自己的包裹元素；子节点须恰好一个。 */
    asChild: Boolean,
  },
  setup(props, { slots, attrs }) {
    const ctx = useContextMenuContext()
    // 触发区渲染为 div，语义由 connect 打上的 ARIA 属性给出
    return () => {
      const part = mergePartProps({
        ...ctx.api.value.getTriggerProps() as Record<string, unknown>,
        ref: (el: unknown) => { ctx.triggerRef.value = el as HTMLElement },
      }, attrs)
      const children = slots.default?.()
      // asChild：把触发器属性合到作者的节点上，不再自己渲染包裹元素
      if (props.asChild) {
        const merged = mergeIntoChild(children, part, 'context-menu')
        if (merged)
          return merged
      }
      return h('div', part, children)
    }
  },
})

export const XhContextMenuPositioner = defineComponent({
  name: 'XhContextMenuPositioner',
  props: {
    /** 本实例的 Portal 容器；优先于应用级配置。 */
    container: { type: Object as PropType<Element> },
  },
  // 根是 Teleport，Vue 不会把直通属性合上去，作者写的 class 与 style 得自己接住落到 positioner 上
  inheritAttrs: false,
  setup(props, { slots, attrs }) {
    const ctx = useContextMenuContext()
    // 条目列表的自绘条：与 content 同级、绝对定位不占布局，壳是这层已经 fixed 的 positioner
    // 浮层里的条子走 4px 档
    const bars = useScrollbars({ scrollable: () => ctx.contentRef.value, props: { size: 'sm' } })
    // 搬到 portal 落点：留在原地的话，宿主祖先只要建了层叠上下文就能盖住浮层
    return () => h(XhPortal, { to: props.container ?? ctx.portalTarget.value, source: ctx.triggerRef }, () => [
      h('div', {
        ...mergeVueProps(ctx.api.value.getPositionerProps() as Record<string, unknown>, attrs),
        ref: (el: unknown) => { ctx.positionerRef.value = el as HTMLElement },
      }, [...(slots.default?.() ?? []), ...bars.render()]),
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
 * 右键菜单中的子菜单：子层运行一台 submenu 模式的 menu 状态机，触发条目由
 * XhContextMenuSubTrigger 渲染为父层条目与子层触发器的双重身份。
 * 子层内部使用 XhMenu 系部件（再往深嵌套即 menu 嵌套 menu）。本身不渲染节点。
 */
export const XhContextMenuSub = defineComponent({
  name: 'XhContextMenuSub',
  props: {
    /** 它在父右键菜单中的条目身份。 */
    value: { type: String, required: true },
    disabled: { type: Boolean, default: undefined },
    placement: { type: String as PropType<Placement> },
    offset: { type: Number },
    loop: { type: Boolean, default: undefined },
    openOnHover: { type: Boolean, default: undefined },
    hoverOpenDelay: { type: Number },
    /** 文字方向；默认继承父层。子层被迁移到浮层落点，无法继承父层的方向。 */
    dir: { type: String as PropType<Direction> },
    /** 语气；默认继承父层。子层是浮层落点下的同级节点，CSS 私有槽无法继承。 */
    tone: { type: String as PropType<Tone> },
    /** 尺寸；默认继承父层，理由同 tone。 */
    size: { type: String as PropType<Size> },
    hoverCloseDelay: { type: Number },
  },
  slots: Object as SlotsType<{
    default?: (props: ContextMenuSubSlotProps) => VNode[]
  }>,
  setup(props, { slots }) {
    const parent = useContextMenuContext()
    const sub = useMenuWithParent(
      {
        ...props,
        submenu: true,
        dir: props.dir ?? parent.service.prop('dir'),
        tone: props.tone ?? parent.service.prop('tone'),
        size: props.size ?? parent.service.prop('size'),
      },
      undefined,
      parent.tree,
    )
    // 子树内的 XhMenu 系部件都归子机器
    provideMenu(sub)
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

/** 条目中的副文本，排在文字下一行 */
export const XhContextMenuItemDescription = defineComponent({
  name: 'XhContextMenuItemDescription',
  setup(_, { slots }) {
    const ctx = useContextMenuContext()
    const { item } = useContextMenuItemContext()
    return () => h('span', ctx.api.value.getItemDescriptionProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

/** 条目中的快捷键提示，贴行尾；纯装饰，读屏从条目文字取意 */
export const XhContextMenuItemShortcut = defineComponent({
  name: 'XhContextMenuItemShortcut',
  setup(_, { slots }) {
    const ctx = useContextMenuContext()
    const { item } = useContextMenuItemContext()
    return () => h('span', ctx.api.value.getItemShortcutProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

/** 条目行尾的作者内容（计数、徽标、次级图标）；家族只管落位，不规定字号与颜色 */
export const XhContextMenuItemSuffix = defineComponent({
  name: 'XhContextMenuItemSuffix',
  setup(_, { slots }) {
    const ctx = useContextMenuContext()
    const { item } = useContextMenuItemContext()
    return () => h('span', ctx.api.value.getItemSuffixProps(item.value) as Record<string, unknown>, slots.default?.())
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
/**
 * 未写默认插槽时按 collection 铺开的整套结构，作者只提供数据。
 * 与手写部件产出的 DOM 完全一致，需要修改结构时写默认插槽，行为不变。
 * 触发区中放置的内容由作者决定，经 trigger 插槽给出。
 */
function renderDefaultTree(
  collection: readonly ContextMenuNodeMeta[],
  trigger: (VNode | string)[] | null,
  itemSlots: ContextMenuItemSlots,
): VNode[] {
  return [
    h(XhContextMenuTrigger, null, () => trigger ?? []),
    h(XhContextMenuPositioner, null, () => [
      h(XhContextMenuContent, null, () => renderNodes(collection, itemSlots)),
    ]),
  ]
}

/** content 的内容：分组段铺为 group，段首的分隔线落在 group 外面。 */
function renderNodes(
  collection: readonly ContextMenuNodeMeta[],
  itemSlots: ContextMenuItemSlots,
): VNode[] {
  return groupAdjacentRuns(collection, node => node.group).flatMap((run, runIndex) => {
    const head = run[0]
    // 首条上的标记不产出分隔线：菜单开头不留一道空隔
    const lead = runIndex > 0 && head.separatorBefore
      ? [h(XhContextMenuSeparator, { key: `separator:${head.value}` })]
      : []
    if (head.group == null)
      return [...lead, renderItem(head, itemSlots)]
    const groupLabel = run.find(node => node.groupLabel != null)?.groupLabel ?? null
    return [
      ...lead,
      h(XhContextMenuGroup, { key: `group:${head.group}`, value: head.group }, () => [
        ...(groupLabel != null ? [h(XhContextMenuGroupLabel, null, () => groupLabel)] : []),
        ...run.flatMap((node, index) => [
          ...(index > 0 && node.separatorBefore ? [h(XhContextMenuSeparator, { key: `separator:${node.value}` })] : []),
          renderItem(node, itemSlots),
        ]),
      ]),
    ]
  })
}

/**
 * 单个条目：标记位排在文字前面，未提供标记位时不铺该部件。
 * `item-prefix` / `item-suffix` 插槽各接管首尾一格，其余槽照旧由数据铺；
 * 行首那一格与数据里的 `indicator` 同一个部件，插槽在场时以它为准。
 */
function renderItem(
  meta: ContextMenuNodeMeta,
  itemSlots: ContextMenuItemSlots,
): VNode {
  const prefix = itemSlots['item-prefix']
  const suffix = itemSlots['item-suffix']
  return h(XhContextMenuItem, { key: meta.value, value: meta.value }, () => [
    ...(prefix
      ? [h(XhContextMenuItemIndicator, null, () => prefix(meta))]
      : meta.indicator != null ? [h(XhContextMenuItemIndicator, null, () => meta.indicator)] : []),
    h(XhContextMenuItemText, null, () => itemSlots.item?.(meta) ?? meta.label),
    ...(meta.description != null ? [h(XhContextMenuItemDescription, null, () => meta.description)] : []),
    ...(meta.shortcut != null ? [h(XhContextMenuItemShortcut, null, () => meta.shortcut)] : []),
    ...(suffix ? [h(XhContextMenuItemSuffix, null, () => suffix(meta))] : []),
  ])
}
