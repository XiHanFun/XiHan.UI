/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 navigation menu 相关实现。

import type { Direction, Orientation, Size, Tone } from '@xihan-ui/core'
import type { PresenceHandle } from '@xihan-ui/core/presence'
import type { NavigationMenuApi, NavigationMenuNode, NavigationMenuNodeMeta, NavigationMenuSchema, NavigationMenuTranslations, StructureNode } from '@xihan-ui/headless'
import type { PropType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { navigationMenuStructure } from '@xihan-ui/headless'
import { defineComponent, h, nextTick, onMounted, ref, useId } from 'vue'
import { withXhConfig } from '../../config/config'
import { mergeIntoChild } from '../../runtime/as-child'
import { mergePartProps } from '../../runtime/merge-props'
import { slotPaints } from '../../runtime/slot-content'
import { renderStructure } from '../../runtime/structure'
import { useOverlayExit } from '../../runtime/use-overlay-exit'
import { provideNavigationMenu, useNavigationMenuContext } from './context'
import { useNavigationMenu } from './use-navigation-menu'

type NavigationMenuProps = NavigationMenuSchema['props']

/** 根节点渲染为 nav，收起的三条出口（指针离开、焦点离场、Escape）在这一层处理 */
export const XhNavigationMenuRoot = defineComponent({
  name: 'XhNavigationMenuRoot',
  // 缺省值由机器与 connect 决定；普通类型省略 default，Boolean 显式保留 undefined
  props: {
    collection: { type: Array as PropType<NavigationMenuNode[]> },
    value: { type: String as PropType<string | null> },
    defaultValue: { type: String as PropType<string | null> },
    orientation: { type: String as PropType<Orientation> },
    delayDuration: { type: Number },
    skipDelayDuration: { type: Number },
    dir: { type: String as PropType<Direction> },
    loop: { type: Boolean, default: undefined },
    disabled: { type: Boolean, default: undefined },
    translations: { type: Object as PropType<Partial<NavigationMenuTranslations>> },
    tone: { type: String as PropType<Tone> },
    size: { type: String as PropType<Size> },
  },
  // value-change 携带 { value }，update:value 携带裸值以支持 v-model:value
  emits: {
    'value-change': (_details: PayloadOf<NavigationMenuProps, 'onValueChange'>) => true,
    'update:value': (_value: PayloadOf<NavigationMenuProps, 'onValueChange'>['value']) => true,
  },
  setup(props, { slots, emit }) {
    const notify: NavigationMenuProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const ctx = useNavigationMenu(withXhConfig('navigation-menu', props) as NavigationMenuProps, notify)
    provideNavigationMenu(ctx)
    return () => {
      // 默认插槽里有真内容就照旧交给作者；只剩注释或空白时当没写，照标准结构铺开
      const authored = slots.default?.()
      const children = slotPaints(authored)
        ? authored
        : renderDefaultStructure(ctx.api.value, slots.panel)
      return h('nav', {
        ...ctx.api.value.getRootProps() as Record<string, unknown>,
        ref: (el: unknown) => { ctx.rootRef.value = el as HTMLElement },
      }, children)
    }
  },
})

// 用 ul 而非 div：站点导航是一组并列的去处，读屏会念"列表，共 n 项"。
export const XhNavigationMenuList = defineComponent({
  name: 'XhNavigationMenuList',
  setup(_, { slots }) {
    const ctx = useNavigationMenuContext()
    return () => h('ul', {
      ...ctx.api.value.getListProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.listRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

/** 一项渲染为一个 li；面板 content 写在同一个 li 内、紧跟 trigger 之后 */
export const XhNavigationMenuItem = defineComponent({
  name: 'XhNavigationMenuItem',
  setup(_, { slots }) {
    const ctx = useNavigationMenuContext()
    return () => h('li', ctx.api.value.getItemProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhNavigationMenuTrigger = defineComponent({
  name: 'XhNavigationMenuTrigger',
  props: {
    value: { type: String, required: true },
    // 缺省交给 connect 回 collection 里查，写死 false 会盖掉数据里的禁用
    disabled: { type: Boolean, default: undefined },
  },
  setup(props, { slots }) {
    const ctx = useNavigationMenuContext()
    return () => h(
      'button',
      ctx.api.value.getTriggerProps({ value: props.value, disabled: props.disabled }) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

// 面板常挂，靠 hidden 显隐，不做懒挂载
/** 入口中表示下方还有面板的标记，展开时转向；身份与所在 trigger 同一份声明 */
export const XhNavigationMenuTriggerIndicator = defineComponent({
  name: 'XhNavigationMenuTriggerIndicator',
  props: {
    value: { type: String, required: true },
    disabled: { type: Boolean, default: undefined },
  },
  setup(props, { slots }) {
    const ctx = useNavigationMenuContext()
    return () => h(
      'span',
      ctx.api.value.getTriggerIndicatorProps({ value: props.value, disabled: props.disabled }) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

export const XhNavigationMenuContent = defineComponent({
  name: 'XhNavigationMenuContent',
  props: {
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useNavigationMenuContext()
    // 一个面板一份退场闸门：它们各开各的、动画各跑各的，一份管不过来。
    // 开合判据直接取 connect 这一帧的产出，不另起一套——两边各判一次迟早会说岔
    const contentRef = ref<HTMLElement | null>(null)
    let presence: PresenceHandle | null = null
    const visible = useOverlayExit({
      config: ctx.config,
      isOpen: () => ctx.api.value.isOpen(props.value),
      contentRef,
      onPresence: (next) => {
        const previous = presence
        presence = next
        if (ctx.service.getStatus() !== 'Started')
          return
        if (next) {
          ctx.service.send({ type: 'PRESENCE.SET', value: props.value, presence: next, connected: true })
        }
        else if (previous) {
          ctx.service.send({ type: 'PRESENCE.SET', value: props.value, presence: previous, connected: false })
        }
      },
    })
    // setup 期 Presence 早于根机器的 onMounted；挂载后补报一次，确保首帧句柄已入 Headless 表。
    onMounted(() => {
      // 子组件 mounted 早于父级根机器启动，再让出一次提交队列才可安全送事件。
      void nextTick(() => {
        if (presence && ctx.service.getStatus() === 'Started')
          ctx.service.send({ type: 'PRESENCE.SET', value: props.value, presence, connected: true })
      })
    })
    return () => h(
      'div',
      {
        ...ctx.api.value.getContentProps({ value: props.value }) as Record<string, unknown>,
        // 收起跟着闸门走：皮肤刻意没给 content 补 [hidden]{display:none}（补了退场就一帧都
        // 播不出来），所以真正的收起落成内联 display
        style: visible.value ? undefined : { display: 'none' },
        ref: (el: unknown) => { contentRef.value = el as HTMLElement | null },
      },
      slots.default?.(),
    )
  },
})

/** 面板里一枝子级的开关：展开时紧跟其后的 XhNavigationMenuBranchContent 露出来 */
export const XhNavigationMenuBranchTrigger = defineComponent({
  name: 'XhNavigationMenuBranchTrigger',
  props: {
    value: { type: String, required: true },
    // 缺省交给 connect 回 collection 里查，写死 false 会盖掉数据里的禁用
    disabled: { type: Boolean, default: undefined },
  },
  setup(props, { slots }) {
    const ctx = useNavigationMenuContext()
    return () => h(
      'button',
      ctx.api.value.getBranchTriggerProps({ value: props.value, disabled: props.disabled }) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

/** 子级开关里的展开方向标记，展开时转向；身份与所在的开关同一份声明 */
export const XhNavigationMenuBranchIndicator = defineComponent({
  name: 'XhNavigationMenuBranchIndicator',
  props: {
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useNavigationMenuContext()
    return () => h(
      'span',
      ctx.api.value.getBranchIndicatorProps({ value: props.value }) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

/** 一枝子级的容器，写在面板里、紧跟自己的开关之后；收着时 hidden */
export const XhNavigationMenuBranchContent = defineComponent({
  name: 'XhNavigationMenuBranchContent',
  props: {
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useNavigationMenuContext()
    return () => h(
      'div',
      ctx.api.value.getBranchContentProps({ value: props.value }) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

/** 面板内的链接项：href 由作者写，点击不拦截，只收起导航 */
export const XhNavigationMenuLink = defineComponent({
  name: 'XhNavigationMenuLink',
  // 直通属性自己合：作者的处理器排在部件前面，asChild 时连同部件属性一起落到作者的链接上
  inheritAttrs: false,
  props: {
    current: Boolean,
    /** 借用作者的子节点（如路由链接）作为链接，不再渲染自己的 `<a>`；子节点须恰好一个。 */
    asChild: Boolean,
  },
  setup(props, { slots, attrs }) {
    const ctx = useNavigationMenuContext()
    // 链接身份：按压通道按它记按住的那一条，按实例生成，作者不必提供
    const value = useId()
    return () => {
      const part = mergePartProps(ctx.api.value.getLinkProps({ value, current: props.current }) as Record<string, unknown>, attrs)
      const children = slots.default?.()
      if (props.asChild)
        return mergeIntoChild(children, part, 'navigation-menu', { applyAnatomy: true })
      return h('a', part, children)
    }
  },
})

/** 指示条容器，位置由状态机计算后写入内联样式；渲染为 li 以 list 为定位参照系 */
export const XhNavigationMenuIndicator = defineComponent({
  name: 'XhNavigationMenuIndicator',
  setup() {
    const ctx = useNavigationMenuContext()
    return () => h('li', ctx.api.value.getIndicatorProps() as Record<string, unknown>)
  },
})

/** 可选的共享面板外壳，放在 root 内、list 之后 */
export const XhNavigationMenuViewport = defineComponent({
  name: 'XhNavigationMenuViewport',
  setup(_, { slots }) {
    const ctx = useNavigationMenuContext()
    return () => h('div', ctx.api.value.getViewportProps() as Record<string, unknown>, slots.default?.())
  },
})

/** 标准结构里各部件对应的组件。 */
const NAVIGATION_MENU_PARTS = {
  'list': XhNavigationMenuList,
  'item': XhNavigationMenuItem,
  'trigger': XhNavigationMenuTrigger,
  'content': XhNavigationMenuContent,
  'branch-trigger': XhNavigationMenuBranchTrigger,
  'branch-indicator': XhNavigationMenuBranchIndicator,
  'branch-content': XhNavigationMenuBranchContent,
  'link': XhNavigationMenuLink,
  'indicator': XhNavigationMenuIndicator,
}

/**
 * 未写默认插槽时照 navigationMenuStructure 铺开的整套结构，与 Web Components 不写部件时元素生成的节点出自同一份。
 * 面板内容给了 panel 插槽就由它提供，否则按这一项的 children 铺链接与子级。
 */
function renderDefaultStructure(api: NavigationMenuApi, panel: ((node: NavigationMenuNodeMeta) => VNode[]) | undefined): VNode[] {
  const nodes = navigationMenuStructure(api, { slotted: name => name === 'panel' && panel != null })
  return renderStructure(nodes, NAVIGATION_MENU_PARTS, (node: StructureNode) => {
    const meta = node.data as NavigationMenuNodeMeta | undefined
    return node.slot?.name === 'panel' && meta ? panel?.(meta) : undefined
  })
}
