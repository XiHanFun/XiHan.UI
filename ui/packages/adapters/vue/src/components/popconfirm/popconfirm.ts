/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 popconfirm 相关实现。

import type { Direction, Placement, Size, VirtualAnchor } from '@xihan-ui/core'
import type { PopconfirmApi, PopconfirmConfirmErrorDetails, PopconfirmNotifiers, PopconfirmOverlayProps, PopconfirmProps, PopconfirmStructureOptions, PopconfirmTranslations } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import type { PropsOf } from '../../runtime/props-of'
import { popconfirmStructure } from '@xihan-ui/headless'
import { defineComponent, h, mergeProps } from 'vue'
import { withXhConfig } from '../../config/config'
import { mergeIntoChild } from '../../runtime/as-child'
import { mergePartProps } from '../../runtime/merge-props'
import { XhPortal } from '../../runtime/portal'
import { renderStructure } from '../../runtime/structure'
import { useDescriptionPart, useTitleDescriptionPart } from '../../runtime/title-description'
import { useOverlayScrollbars } from '../../runtime/use-overlay-scrollbars'
import { providePopconfirm, usePopconfirmContext } from './context'
import { usePopconfirm } from './use-popconfirm'

/** 默认插槽的载荷：开合、确认事务状态与三个动作。 */
export type PopconfirmRootSlotProps = Pick<
  PopconfirmApi,
  'open' | 'pending' | 'actionError' | 'setOpen' | 'confirm' | 'cancel'
>

export const XhPopconfirmRoot = defineComponent({
  name: 'XhPopconfirmRoot',
  props: {
    open: { type: Boolean, default: undefined },
    defaultOpen: Boolean,
    placement: { type: String as PropType<Placement> },
    offset: { type: Number },
    /** 交叉轴上再挪多少（px），缺省 0；正值往结束方向，RTL 下行内轴往左。 */
    crossOffset: { type: Number },
    /** 空间不足时翻到对侧，默认 true；false 时守着 placement 那一侧。 */
    flip: { type: Boolean, default: undefined },
    /** 碰撞边界：浮层只在这块区域与视口的交集里摆。收元素或带 getBoundingClientRect() 的对象。 */
    boundary: { type: Object as PropType<Element | VirtualAnchor | null> },
    /** 文字方向；浮层迁移到落点后无法继承作者子树上的方向，需要 RTL 时显式提供。 */
    dir: { type: String as PropType<Direction> },
    closeOnEscape: { type: Boolean, default: true },
    closeOnInteractOutside: { type: Boolean, default: true },
    /** 展开后先聚焦到 content 内匹配该选择器的元素；没给或不匹配时落到第一个可聚焦元素（标准结构里是取消钮）。 */
    initialFocus: { type: String },
    /** 收起时把焦点归还给 trigger，默认 true。 */
    restoreFocus: { type: Boolean, default: undefined },
    /** 第一次打开时才挂载 content 里的内容，默认 false。 */
    lazyMount: { type: Boolean, default: undefined },
    /** 收起动画播完后卸载 content 里的内容，默认 false；下次打开重新挂载。 */
    unmountOnExit: { type: Boolean, default: undefined },
    /** 标准结构里两颗钮的缺省文字。 */
    translations: { type: Object as PropType<Partial<PopconfirmTranslations>> },
    // —— 不写默认插槽时的标准结构（popconfirmStructure）——
    /** 触发按钮的文字；trigger 插槽有内容时以插槽为准。 */
    triggerText: { type: String },
    /** 标题文字；title 插槽有内容时以插槽为准。 */
    title: { type: String },
    /** 说明文字；description 插槽有内容时以插槽为准。 */
    description: { type: String },
    /** 确认钮的文字，缺省取语言包。 */
    confirmText: { type: String },
    /** 取消钮的文字，缺省取语言包。 */
    cancelText: { type: String },
    /** 不可打开：触发器转原生 disabled，展开途中转为禁用即收起。 */
    disabled: { type: Boolean, default: undefined },
    size: { type: String as PropType<Size> },
    /**
     * 确认回调使用函数 prop 而非 emit：emit 无法获取监听函数的返回值，而异步门正需要它：
     * 返回 thenable 即挂起（浮层等待兑现后再收起、确认按钮显示加载），拒绝则保持打开并触发 confirm-error。
     * 模板中照常写 @confirm，Vue 会把它落到该 prop 上。
     */
    onConfirm: { type: Function as PropType<PopconfirmNotifiers['onConfirm']> },
  },
  // open-change 携带 { open }，update:open 携带裸布尔；cancel-press 不带载荷
  emits: {
    'open-change': (_details: PayloadOf<PopconfirmProps, 'onOpenChange'>) => true,
    'update:open': (_open: PayloadOf<PopconfirmProps, 'onOpenChange'>['open']) => true,
    'confirm-error': (_details: PopconfirmConfirmErrorDetails) => true,
    'cancel-press': () => true,
    'exit-complete': () => true,
  },
  slots: Object as SlotsType<{
    default?: (props: PopconfirmRootSlotProps) => VNode[]
    /** 触发按钮的内容，压过 trigger-text。 */
    trigger?: () => VNode[]
    /** 标题，压过 title。 */
    title?: () => VNode[]
    /** 说明，压过 description。 */
    description?: () => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notify: PopconfirmNotifiers = {
      onOpenChange: (details) => {
        emit('open-change', details)
        emit('update:open', details.open)
      },
      onConfirm: () => props.onConfirm?.(),
      onConfirmError: details => emit('confirm-error', details),
      onCancelPress: () => { emit('cancel-press') },
      onExitComplete: () => { emit('exit-complete') },
    }
    // 全局配置只取文案：两颗钮的缺省文字在标准结构里读，渲染期读这份代理
    const configured = withXhConfig('popconfirm', props)
    const ctx = usePopconfirm(props as PopconfirmOverlayProps, notify)
    providePopconfirm(ctx)
    return () => h('div', ctx.api.value.getRootProps(), slots.default
      ? slots.default({
          open: ctx.api.value.open,
          pending: ctx.api.value.pending,
          actionError: ctx.api.value.actionError,
          setOpen: ctx.api.value.setOpen,
          confirm: ctx.api.value.confirm,
          cancel: ctx.api.value.cancel,
        })
      : renderDefaultStructure({
          triggerText: props.triggerText,
          title: props.title,
          description: props.description,
          confirmText: props.confirmText,
          cancelText: props.cancelText,
          translations: configured.translations,
        }, { trigger: slots.trigger, title: slots.title, description: slots.description }))
  },
})

export const XhPopconfirmTrigger = defineComponent({
  name: 'XhPopconfirmTrigger',
  // 直通属性自己合：Vue 默认把作者的处理器排在部件的后面，这里改成作者先跑
  inheritAttrs: false,
  props: {
    /** 借用作者的子节点作为触发器，不再渲染自己的包裹元素；子节点须恰好一个。 */
    asChild: Boolean,
  },
  setup(props, { slots, attrs }) {
    const ctx = usePopconfirmContext()
    return () => {
      const part = mergePartProps({
        ...ctx.api.value.getTriggerProps(),
        ref: (el: unknown) => { ctx.triggerRef.value = el as HTMLElement },
      }, attrs)
      const children = slots.default?.()
      // asChild：把触发器属性合到作者的节点上，不再自己渲染包裹元素
      if (props.asChild) {
        const merged = mergeIntoChild(children, part, 'popconfirm')
        if (merged)
          return merged
      }
      return h('button', part, children)
    }
  },
})

export const XhPopconfirmPositioner = defineComponent({
  name: 'XhPopconfirmPositioner',
  props: {
    /** 本实例的 Portal 容器；优先于应用级配置。 */
    container: { type: Object as PropType<Element> },
  },
  // 根是 Teleport，Vue 不会把直通属性合上去，作者写的 class 与 style 得自己接住落到 positioner 上
  inheritAttrs: false,
  setup(props, { slots, attrs }) {
    const ctx = usePopconfirmContext()
    // 面板内容的自绘条：与 content 同级、绝对定位不占布局，壳是这层已经 fixed 的 positioner；浮层里走 4px 档
    const bars = useOverlayScrollbars({ present: () => ctx.visible.value, scrollable: () => ctx.contentRef.value, props: { size: 'sm' } })
    // 定位层搬到 portal 落点，逃开祖先的层叠上下文
    return () => h(XhPortal, { to: props.container ?? ctx.portalTarget.value, source: ctx.triggerRef, present: ctx.visible.value }, () => [
      h('div', {
        ...mergeProps(ctx.api.value.getPositionerProps(), attrs),
        ref: (el: unknown) => { ctx.positionerRef.value = el as HTMLElement },
      }, [...(slots.default?.() ?? []), ...bars.render()]),
    ])
  },
})

export const XhPopconfirmContent = defineComponent({
  name: 'XhPopconfirmContent',
  setup(_, { slots }) {
    const ctx = usePopconfirmContext()
    return () => h('div', {
      ...ctx.api.value.getContentProps(),
      // 收起跟着退场闸门走：hidden 与内联 display 都等退场播完才落。宿主的
      // [hidden]{display:none!important}（Tailwind preflight、VitePress 默认主题）压得过皮肤，hidden 跟着开合走退场就一帧都播不出来
      hidden: !ctx.visible.value || undefined,
      style: ctx.visible.value ? undefined : { display: 'none' },
      ref: (el: unknown) => { ctx.contentRef.value = el as HTMLElement },
    }, ctx.api.value.isContentMounted(ctx.visible.value) ? slots.default?.() : undefined)
  },
})

export const XhPopconfirmTitle = defineComponent({
  name: 'XhPopconfirmTitle',
  setup(_, { slots }) {
    const ctx = usePopconfirmContext()
    useTitleDescriptionPart(ctx.presence, 'title')
    return () => h('h2', ctx.api.value.getTitleProps(), slots.default?.())
  },
})

export const XhPopconfirmDescription = defineComponent({
  name: 'XhPopconfirmDescription',
  setup(_, { slots }) {
    const ctx = usePopconfirmContext()
    // 读不出一句话的说明不进描述链
    const el = useDescriptionPart(ctx.presence)
    return () => h('p', { ...ctx.api.value.getDescriptionProps(), ref: el }, slots.default?.())
  },
})

export const XhPopconfirmConfirmTrigger = defineComponent({
  name: 'XhPopconfirmConfirmTrigger',
  setup(_, { slots }) {
    const ctx = usePopconfirmContext()
    return () => h('button', ctx.api.value.getConfirmTriggerProps(), slots.default?.())
  },
})

export const XhPopconfirmCancelTrigger = defineComponent({
  name: 'XhPopconfirmCancelTrigger',
  setup(_, { slots }) {
    const ctx = usePopconfirmContext()
    return () => h('button', ctx.api.value.getCancelTriggerProps(), slots.default?.())
  },
})

export const XhPopconfirmArrow = defineComponent({
  name: 'XhPopconfirmArrow',
  setup() {
    const ctx = usePopconfirmContext()
    return () => h('div', ctx.api.value.getArrowProps())
  },
})

/** 标准结构里各部件对应的组件。 */
const POPCONFIRM_PARTS = {
  'trigger': XhPopconfirmTrigger,
  'positioner': XhPopconfirmPositioner,
  'content': XhPopconfirmContent,
  'title': XhPopconfirmTitle,
  'description': XhPopconfirmDescription,
  'cancel-trigger': XhPopconfirmCancelTrigger,
  'confirm-trigger': XhPopconfirmConfirmTrigger,
  'arrow': XhPopconfirmArrow,
}

type PopconfirmSectionSlots = Readonly<Partial<Record<'trigger' | 'title' | 'description', () => VNode[]>>>

/**
 * 未写默认插槽时铺开的整套结构：照 headless 的 popconfirmStructure 渲，与 Web Components 不写部件时元素生成的节点出自同一份。
 * 触发器、标题与说明取文字或同名插槽，取消与确认两颗钮的文字缺省取语言包。
 */
function renderDefaultStructure(text: Omit<PopconfirmStructureOptions, 'slotted'>, sections: PopconfirmSectionSlots): VNode[] {
  const nodes = popconfirmStructure({ ...text, slotted: name => sections[name as keyof PopconfirmSectionSlots] != null })
  return renderStructure(nodes, POPCONFIRM_PARTS, node => (node.slot ? sections[node.slot.name as keyof PopconfirmSectionSlots]?.() : undefined))
}

// 各组件接受的 props，与 React 同名
export type XhPopconfirmArrowProps = PropsOf<typeof XhPopconfirmArrow>
export type XhPopconfirmCancelTriggerProps = PropsOf<typeof XhPopconfirmCancelTrigger>
export type XhPopconfirmConfirmTriggerProps = PropsOf<typeof XhPopconfirmConfirmTrigger>
export type XhPopconfirmContentProps = PropsOf<typeof XhPopconfirmContent>
export type XhPopconfirmDescriptionProps = PropsOf<typeof XhPopconfirmDescription>
export type XhPopconfirmPositionerProps = PropsOf<typeof XhPopconfirmPositioner>
export type XhPopconfirmRootProps = PropsOf<typeof XhPopconfirmRoot>
export type XhPopconfirmTitleProps = PropsOf<typeof XhPopconfirmTitle>
export type XhPopconfirmTriggerProps = PropsOf<typeof XhPopconfirmTrigger>
