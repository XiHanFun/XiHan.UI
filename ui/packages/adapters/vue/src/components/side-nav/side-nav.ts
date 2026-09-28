/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 side nav 相关实现。

import type { Size, Tone } from '@xihan-ui/core'
import type { PresenceHandle } from '@xihan-ui/core/presence'
import type { SideNavApi, SideNavFilter, SideNavNode, SideNavSchema } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { withXhConfig } from '../../config/config'
import { mergeIntoChild } from '../../runtime/as-child'
import { mergePartProps } from '../../runtime/merge-props'
import { XhPortal } from '../../runtime/portal'
import { useOverlayExit } from '../../runtime/use-overlay-exit'
import { provideSideNav, provideSideNavGroup, provideSideNavItem, provideSideNavNode, useSideNavContext, useSideNavGroupContext, useSideNavItemContext, useSideNavNodeContext } from './context'
import { useSideNav } from './use-side-nav'

type SideNavProps = SideNavSchema['props']

/** 默认插槽的载荷：选中项、展开集合、折叠与浮层状态、检索词与搜索状态、逐节点的状态判定，以及选中、展开、折叠、弹出、改写检索词等命令。 */
export type SideNavRootSlotProps = Pick<
  SideNavApi,
  | 'value'
  | 'expandedValue'
  | 'collapsed'
  | 'popoutValue'
  | 'isSelected'
  | 'isExpanded'
  | 'isActiveBranch'
  | 'select'
  | 'setValue'
  | 'setExpandedValue'
  | 'expand'
  | 'collapse'
  | 'openPopout'
  | 'closePopout'
  | 'inputValue'
  | 'setInputValue'
  | 'searching'
>

export const XhSideNavRoot = defineComponent({
  name: 'XhSideNavRoot',
  // 缺省值由 connect 与机器给出；普通类型省略 default，Boolean 显式保留 undefined
  props: {
    collection: { type: Array as PropType<SideNavNode[]> },
    value: { type: String as PropType<string | null> },
    defaultValue: { type: String as PropType<string | null> },
    expandedValue: { type: Array as PropType<string[]> },
    defaultExpandedValue: { type: Array as PropType<string[]> },
    accordion: Boolean,
    collapsed: { type: Boolean, default: undefined },
    collapsedPopout: { type: Boolean, default: undefined },
    disabled: Boolean,
    loop: { type: Boolean, default: undefined },
    dir: { type: String as PropType<SideNavProps['dir']> },
    tone: { type: String as PropType<Tone> },
    size: { type: String as PropType<Size> },
    /** 搜索框的匹配规则；缺省为标签（缺省退回 value）大小写不敏感包含。 */
    filter: { type: Function as PropType<SideNavFilter> },
    translations: { type: Object as PropType<SideNavProps['translations']> },
  },
  // *-change 携带 details 对象，update:* 携带裸值，支持 v-model:value 与 v-model:expanded-value
  emits: {
    'value-change': (_details: PayloadOf<SideNavProps, 'onValueChange'>) => true,
    'update:value': (_value: PayloadOf<SideNavProps, 'onValueChange'>['value']) => true,
    'expanded-value-change': (_details: PayloadOf<SideNavProps, 'onExpandedValueChange'>) => true,
    'update:expandedValue': (_value: PayloadOf<SideNavProps, 'onExpandedValueChange'>['value']) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: SideNavRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const ctx = useSideNav(withXhConfig('side-nav', props) as SideNavProps, {
      onValueChange: (details) => {
        emit('value-change', details)
        emit('update:value', details.value)
      },
      onExpandedValueChange: (details) => {
        emit('expanded-value-change', details)
        emit('update:expandedValue', details.value)
      },
    })
    provideSideNav(ctx)
    // 经插槽暴露状态与命令，供折叠开关这类外部控件使用
    return () => h('nav', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      value: ctx.api.value.value,
      expandedValue: ctx.api.value.expandedValue,
      collapsed: ctx.api.value.collapsed,
      popoutValue: ctx.api.value.popoutValue,
      isSelected: ctx.api.value.isSelected,
      isExpanded: ctx.api.value.isExpanded,
      isActiveBranch: ctx.api.value.isActiveBranch,
      select: ctx.api.value.select,
      setValue: ctx.api.value.setValue,
      setExpandedValue: ctx.api.value.setExpandedValue,
      expand: ctx.api.value.expand,
      collapse: ctx.api.value.collapse,
      openPopout: ctx.api.value.openPopout,
      closePopout: ctx.api.value.closePopout,
      inputValue: ctx.api.value.inputValue,
      setInputValue: ctx.api.value.setInputValue,
      searching: ctx.api.value.searching,
    }))
  },
})

export const XhSideNavList = defineComponent({
  name: 'XhSideNavList',
  setup(_, { slots }) {
    const ctx = useSideNavContext()
    return () => h('ul', ctx.api.value.getListProps() as Record<string, unknown>, slots.default?.())
  },
})

/** 搜索框：放在 list 之前，输入即按标签过滤导航树。 */
export const XhSideNavInput = defineComponent({
  name: 'XhSideNavInput',
  setup() {
    const ctx = useSideNavContext()
    return () => h('input', ctx.api.value.getInputProps() as Record<string, unknown>)
  },
})

/** 搜索一条都没命中时露面的占位；没写内容时显示 translations.noMatch。 */
export const XhSideNavEmpty = defineComponent({
  name: 'XhSideNavEmpty',
  setup(_, { slots }) {
    const ctx = useSideNavContext()
    return () => h('div', ctx.api.value.getEmptyProps() as Record<string, unknown>, slots.default?.() ?? ctx.api.value.translations.noMatch)
  },
})

/** 把一个值登记进所在分组，值变了换一条，卸下时撤销。登记写的是分组的成员表，回调不追踪它，免得自己触发自己。 */
function joinGroup(value: () => string): void {
  const join = useSideNavGroupContext()
  if (!join)
    return
  watch(value, (next, _, onCleanup) => onCleanup(join(next)), { immediate: true })
}

// 叶子行的列表项：列表容器是 ul，链接得裹在 li 里才是它合法的直接子节点。
// 身份取它包着的那条链接报上来的值：搜索时没命中就整行收起
export const XhSideNavItem = defineComponent({
  name: 'XhSideNavItem',
  setup(_, { slots }) {
    const ctx = useSideNavContext()
    const linkValue = shallowRef<string | null>(null)
    provideSideNavItem((value) => {
      linkValue.value = value
    })
    return () => h('li', ctx.api.value.getItemProps({ value: linkValue.value ?? undefined }) as Record<string, unknown>, slots.default?.())
  },
})

export const XhSideNavGroup = defineComponent({
  name: 'XhSideNavGroup',
  props: {
    /** 分组身份，与 group-label 依靠它配对。 */
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useSideNavContext()
    // 成员由组里的链接与分支挂上时登记：搜索时一个成员都没命中就整组收起
    const members = shallowRef<readonly string[]>([])
    provideSideNavGroup((value) => {
      members.value = [...members.value, value]
      return () => {
        const at = members.value.indexOf(value)
        if (at !== -1)
          members.value = members.value.filter((_, i) => i !== at)
      }
    })
    return () => h('li', ctx.api.value.getGroupProps({ value: props.value, members: members.value }) as Record<string, unknown>, slots.default?.())
  },
})

export const XhSideNavGroupLabel = defineComponent({
  name: 'XhSideNavGroupLabel',
  props: {
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useSideNavContext()
    return () => h('div', ctx.api.value.getGroupLabelProps({ value: props.value }) as Record<string, unknown>, slots.default?.())
  },
})

export const XhSideNavBranch = defineComponent({
  name: 'XhSideNavBranch',
  props: {
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useSideNavContext()
    provideSideNavNode(props)
    joinGroup(() => props.value)
    return () => h('li', ctx.api.value.getBranchProps({ value: props.value }) as Record<string, unknown>, slots.default?.())
  },
})

export const XhSideNavBranchTrigger = defineComponent({
  name: 'XhSideNavBranchTrigger',
  setup(_, { slots }) {
    const ctx = useSideNavContext()
    const node = useSideNavNodeContext()
    return () => h('button', ctx.api.value.getBranchTriggerProps({ value: node.value }) as Record<string, unknown>, slots.default?.())
  },
})

export const XhSideNavBranchText = defineComponent({
  name: 'XhSideNavBranchText',
  setup(_, { slots }) {
    const ctx = useSideNavContext()
    return () => h('span', ctx.api.value.getBranchTextProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhSideNavBranchIndicator = defineComponent({
  name: 'XhSideNavBranchIndicator',
  setup(_, { slots }) {
    const ctx = useSideNavContext()
    const node = useSideNavNodeContext()
    return () => h('span', ctx.api.value.getBranchIndicatorProps({ value: node.value }) as Record<string, unknown>, slots.default?.())
  },
})

export const XhSideNavBranchContent = defineComponent({
  name: 'XhSideNavBranchContent',
  props: {
    /** 本分支弹层的 Portal 容器；优先于应用级配置。 */
    container: { type: Object as PropType<Element> },
  },
  setup(props, { slots }) {
    const ctx = useSideNavContext()
    const node = useSideNavNodeContext()
    // 一个弹出面板一份退场闸门：退场动画挂在面板上，从它身上探测。
    // 开合判据直接取 connect 这一帧的产出，不另起一套
    const panelRef = ref<HTMLElement | null>(null)
    let presence: PresenceHandle | null = null
    const visible = useOverlayExit({
      config: ctx.config,
      isOpen: () => (ctx.api.value.getPopoutPositionerProps({ value: node.value }) as Record<string, unknown>).hidden !== true,
      contentRef: panelRef,
      onPresence: (next) => {
        const previous = presence
        presence = next
        if (ctx.service.getStatus() !== 'Started')
          return
        if (next)
          ctx.service.send({ type: 'PRESENCE.SET', value: node.value, presence: next, connected: true })
        else if (previous)
          ctx.service.send({ type: 'PRESENCE.SET', value: node.value, presence: previous, connected: false })
      },
    })
    onMounted(() => {
      void nextTick(() => {
        if (presence && ctx.service.getStatus() === 'Started')
          ctx.service.send({ type: 'PRESENCE.SET', value: node.value, presence, connected: true })
      })
    })
    return () => {
      if (!ctx.api.value.isPopoutPanel(node.value)) {
        // 平铺分支没有定位层，原地渲染
        return h('ul', ctx.api.value.getBranchContentProps({ value: node.value }) as Record<string, unknown>, slots.default?.())
      }
      // 折叠态的弹出面板：定位层搬到浮层落点，逃开祖先的层叠上下文。
      // 收起跟着退场闸门走：定位层与面板的 hidden 都押后到退场动画播完
      const hidden = !visible.value || undefined
      const content = h('ul', {
        ...ctx.api.value.getBranchContentProps({ value: node.value }) as Record<string, unknown>,
        hidden,
        ref: (el: unknown) => { panelRef.value = el as HTMLElement | null },
      }, slots.default?.())
      return h(XhPortal, { to: props.container ?? ctx.portalTarget.value }, () => [
        h('div', {
          ...ctx.api.value.getPopoutPositionerProps({ value: node.value }) as Record<string, unknown>,
          hidden,
        }, [content]),
      ])
    }
  },
})

export const XhSideNavLinkText = defineComponent({
  name: 'XhSideNavLinkText',
  setup(_, { slots }) {
    const ctx = useSideNavContext()
    return () => h('span', ctx.api.value.getLinkTextProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhSideNavLink = defineComponent({
  name: 'XhSideNavLink',
  // 直通属性自己合：作者的处理器排在部件前面，asChild 时连同部件属性一起落到作者的链接上
  inheritAttrs: false,
  props: {
    value: { type: String, required: true },
    /** 借用作者的子节点（如路由链接）作为链接，不再渲染自己的 `<a>`；子节点须恰好一个。 */
    asChild: Boolean,
  },
  setup(props, { slots, attrs }) {
    const ctx = useSideNavContext()
    // 身份报给外面的列表项与分组：搜索时它们据此决定整行、整组收不收
    const reportItem = useSideNavItemContext()
    if (reportItem) {
      watch(() => props.value, next => reportItem(next), { immediate: true })
      onBeforeUnmount(() => reportItem(null))
    }
    joinGroup(() => props.value)
    return () => {
      const part = mergePartProps(ctx.api.value.getLinkProps({ value: props.value }) as Record<string, unknown>, attrs)
      const children = slots.default?.()
      if (props.asChild)
        return mergeIntoChild(children, part, 'side-nav', { applyAnatomy: true })
      return h('a', part, children)
    }
  },
})
