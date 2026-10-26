/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 tooltip 相关实现。

import type { Direction, Placement, Size, Tone } from '@xihan-ui/core'
import type { KbdPlatform } from '@xihan-ui/core/hotkey'
import type { TooltipApi, TooltipSchema, TooltipTranslations } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { createTooltipGroup } from '@xihan-ui/headless'
import { defineComponent, h, mergeProps } from 'vue'
import { withXhConfig } from '../../config/config'
import { mergeIntoChild } from '../../runtime/as-child'
import { mergePartProps } from '../../runtime/merge-props'
import { XhPortal } from '../../runtime/portal'
import { provideTooltip, provideTooltipGroup, useTooltipContext } from './context'
import { useTooltip } from './use-tooltip'

type TooltipProps = TooltipSchema['props']

/** 默认插槽的载荷：展开状态与开合方法。 */
export type TooltipRootSlotProps = Pick<TooltipApi, 'open' | 'setOpen'>

/**
 * 提示组：子树里的提示归同一组，共用接替窗口、同一时刻只开一个，没写延时的取这里给的缺省。
 * 本身不渲染节点，也不改动子节点的排布。
 */
export const XhTooltipProvider = defineComponent({
  name: 'XhTooltipProvider',
  props: {
    /** 组内提示悬停进入到展开的缺省等待毫秒；提示自己写了就以提示为准。 */
    openDelay: { type: Number },
    /** 组内提示悬停移出到收起的缺省等待毫秒。 */
    closeDelay: { type: Number },
    /** 组内提示的缺省接替窗口毫秒；0 表示组内不接替。 */
    skipDelayDuration: { type: Number },
  },
  setup(props, { slots }) {
    // 组在 Provider 的一生里只建一次；缺省值每次现读，改 props 下一次开合即生效
    provideTooltipGroup(createTooltipGroup(() => ({
      openDelay: props.openDelay,
      closeDelay: props.closeDelay,
      skipDelayDuration: props.skipDelayDuration,
    })))
    return () => slots.default?.()
  },
})

export const XhTooltipRoot = defineComponent({
  name: 'XhTooltipRoot',
  props: {
    open: { type: Boolean, default: undefined },
    defaultOpen: Boolean,
    placement: { type: String as PropType<Placement> },
    offset: { type: Number },
    /** 文字方向；浮层迁移到落点后无法继承作者子树上的方向，需要 RTL 时显式提供。 */
    dir: { type: String as PropType<Direction> },
    openDelay: { type: Number },
    closeDelay: { type: Number },
    /** 跳过等待的窗口毫秒，默认 300：另一个提示开着或刚收起时，指向这一个直接接替、不播进场；0 不参与。 */
    skipDelayDuration: { type: Number },
    disabled: Boolean,
    /** 跟随鼠标：由指针打开的提示锚在指针落点上并随移动更新；触屏与聚焦打开时锚回 trigger。 */
    followCursor: { type: Boolean, default: undefined },
    /** 委托模式：CSS 选择器。trigger 是容器，命中它的元素悬停或键盘聚焦时打开提示并作锚点，文字与快捷键从锚点上读。 */
    delegate: { type: String },
    /** 委托模式下快捷键按哪个平台的写法显示，默认 auto：指向锚点时测一次。 */
    platform: { type: String as PropType<KbdPlatform> },
    tone: { type: String as PropType<Tone> },
    size: { type: String as PropType<Size> },
    translations: { type: Object as PropType<Partial<TooltipTranslations>> },
  },
  // open-change 携带 { open }；update:open 携带裸布尔，支持 v-model:open
  emits: {
    'open-change': (_details: PayloadOf<TooltipProps, 'onOpenChange'>) => true,
    'update:open': (_open: PayloadOf<TooltipProps, 'onOpenChange'>['open']) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: TooltipRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notify: TooltipProps['onOpenChange'] = (details) => {
      emit('open-change', details)
      emit('update:open', details.open)
    }
    const ctx = useTooltip(withXhConfig('tooltip', props) as TooltipProps, notify)
    provideTooltip(ctx)
    return () => slots.default?.({ open: ctx.api.value.open, setOpen: ctx.api.value.setOpen })
  },
})

export const XhTooltipTrigger = defineComponent({
  name: 'XhTooltipTrigger',
  // 直通属性自己合：Vue 默认把作者的处理器排在部件的后面，这里改成作者先跑
  inheritAttrs: false,
  props: {
    /** 借用作者的子节点作为触发器，不再渲染自己的包裹元素；子节点须恰好一个。 */
    asChild: Boolean,
  },
  setup(props, { slots, attrs }) {
    const ctx = useTooltipContext()
    return () => {
      const part = mergePartProps({
        ...ctx.api.value.getTriggerProps(),
        ref: (el: unknown) => { ctx.triggerRef.value = el as HTMLElement },
      }, attrs)
      const children = slots.default?.()
      // asChild：把触发器属性合到作者的节点上，不再自己渲染包裹元素
      if (props.asChild) {
        const merged = mergeIntoChild(children, part, 'tooltip')
        if (merged)
          return merged
      }
      // 委托模式下 trigger 是装着一个个锚点的容器，不是按钮
      return h(ctx.api.value.delegated ? 'div' : 'button', part, children)
    }
  },
})

export const XhTooltipPositioner = defineComponent({
  name: 'XhTooltipPositioner',
  props: {
    /** 本实例的 Portal 容器；优先于应用级配置。 */
    container: { type: Object as PropType<Element> },
  },
  // 根是 Teleport，Vue 不会把直通属性合上去，作者写的 class 与 style 得自己接住落到 positioner 上
  inheritAttrs: false,
  setup(props, { slots, attrs }) {
    const ctx = useTooltipContext()
    // 搬到 portal 落点：留在原地的话，宿主祖先只要建了层叠上下文就能盖住浮层
    return () => h(XhPortal, { to: props.container ?? ctx.portalTarget.value, source: ctx.triggerRef, present: ctx.visible.value }, () => [
      h('div', {
        ...mergeProps(ctx.api.value.getPositionerProps(), attrs),
        ref: (el: unknown) => { ctx.positionerRef.value = el as HTMLElement },
      }, slots.default?.()),
    ])
  },
})

/** 委托模式下的提示文字：缺省显示当前锚点的文字。 */
export const XhTooltipText = defineComponent({
  name: 'XhTooltipText',
  setup(_, { slots }) {
    const ctx = useTooltipContext()
    return () => h('span', ctx.api.value.getTextProps(), slots.default?.() ?? ctx.api.value.text)
  },
})

/** 委托模式下的快捷键：缺省显示当前锚点的快捷键，按平台的写法。 */
export const XhTooltipShortcut = defineComponent({
  name: 'XhTooltipShortcut',
  setup(_, { slots }) {
    const ctx = useTooltipContext()
    return () => h('span', ctx.api.value.getShortcutProps(), slots.default?.() ?? ctx.api.value.shortcut ?? undefined)
  },
})

export const XhTooltipContent = defineComponent({
  name: 'XhTooltipContent',
  setup(_, { slots }) {
    const ctx = useTooltipContext()
    // 委托模式下文字与快捷键由组件铺在作者写的节点（箭头）之后，没有快捷键时不铺 shortcut
    const children = (): unknown => ctx.api.value.delegated
      ? [...(slots.default?.() ?? []), h(XhTooltipText), ctx.api.value.shortcut === null ? null : h(XhTooltipShortcut)]
      : slots.default?.()
    return () => h('div', {
      ...ctx.api.value.getContentProps(),
      // 收起跟着退场闸门走：皮肤给 content 声明了 display 来盖掉 UA 的 [hidden]{display:none}
      // （盒子得先在，退场才播得出来），所以真正的收起落成内联 display
      style: ctx.visible.value ? undefined : { display: 'none' },
      ref: (el: unknown) => { ctx.contentRef.value = el as HTMLElement },
    }, children() as VNode[] | undefined)
  },
})

export const XhTooltipArrow = defineComponent({
  name: 'XhTooltipArrow',
  setup(_, { slots }) {
    const ctx = useTooltipContext()
    return () => h('div', ctx.api.value.getArrowProps(), slots.default?.())
  },
})
