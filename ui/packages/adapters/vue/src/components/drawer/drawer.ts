/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 drawer 相关实现。

import type { OverlayBackdropVariant, Size } from '@xihan-ui/core'
import type { DrawerActionIntents, DrawerApi, DrawerConfirmErrorDetails, DrawerSchema, DrawerSide, DrawerStructureActions } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { drawerStructure, withoutPanelShell } from '@xihan-ui/headless'
import { defineComponent, h, mergeProps } from 'vue'
import { withXhConfig } from '../../config/config'
import { mergeIntoChild } from '../../runtime/as-child'
import { mergePartProps } from '../../runtime/merge-props'
import { XhPortal } from '../../runtime/portal'
import { renderStructure } from '../../runtime/structure'
import { useDescriptionPart, useTitleDescriptionPart } from '../../runtime/title-description'
import { OVERLAY_STOWED_PROPS } from '../../runtime/use-overlay-exit'
import { provideDrawer, useDrawerContext } from './context'
import { useDrawer } from './use-drawer'

type DrawerProps = DrawerSchema['props']

/** 默认插槽的载荷：展开状态、已解析的滑出边，与开合命令。 */
export type DrawerRootSlotProps = Pick<DrawerApi, 'open' | 'side' | 'setOpen'>

export const XhDrawerRoot = defineComponent({
  name: 'XhDrawerRoot',
  props: {
    // 缺省值由 connect 给出；普通类型省略 default，Boolean 显式保留 undefined
    open: { type: Boolean, default: undefined },
    defaultOpen: Boolean,
    modal: { type: Boolean, default: undefined },
    side: { type: String as PropType<DrawerSide> },
    role: { type: String as PropType<'dialog' | 'alertdialog'> },
    closeOnEscape: { type: Boolean, default: undefined },
    closeOnInteractOutside: { type: Boolean, default: undefined },
    restoreFocus: { type: Boolean, default: undefined },
    size: { type: String as PropType<Size> },
    variant: { type: String as PropType<OverlayBackdropVariant> },
    /**
     * 挂载的容器（CSS 选择器或元素）。提供后即为局部抽屉：
     * 浮层迁移进该容器，遮罩与定位层从 fixed 换为 absolute，只覆盖它而不是整屏。
     *
     * 该容器要自带 position（relative 等），否则 absolute 会向上找到其他定位祖先。
     * 未提供时查询全局配置的 portalContainer，再没有才落到 body。
     */
    container: { type: [String, Object] as PropType<string | Element> },
    /**
     * 只把绘制方式改为局部（遮罩与定位层从 fixed 换为 absolute），不改变迁移位置。
     * 提供 container 后默认为真，不必再写一遍；两个都未提供即铺满视口。
     */
    contained: { type: Boolean, default: undefined },
    /** 可调厚度：朝向页面那条边上的把手拖动或用方向键推。 */
    resizable: { type: Boolean, default: undefined },
    /** 受控厚度（像素），支持 v-model:panel-size；未提供即非受控。 */
    panelSize: { type: Number },
    defaultPanelSize: { type: Number },
    minPanelSize: { type: Number },
    maxPanelSize: { type: Number },
    /** 收起动画播完后卸载内容，默认 true；false 时第一次打开才挂载、此后收起只隐藏，再打开不重挂。 */
    unmountOnExit: { type: Boolean, default: undefined },
    translations: { type: Object as PropType<DrawerProps['translations']> },
    // —— 不写默认插槽时的标准结构（drawerStructure）——
    /** 触发按钮的文字；trigger 插槽有内容时以插槽为准。两者都没有时不铺触发器，开合交给 v-model:open。 */
    triggerText: { type: String },
    /** 标题文字；title 插槽有内容时以插槽为准。 */
    title: { type: String },
    /** 说明文字；description 插槽有内容时以插槽为准。 */
    description: { type: String },
    /** 页脚铺哪几颗钮：confirm（取消 + 确定，缺省）、alert（只有确定）、none；footer 插槽有内容时整段归作者。 */
    actions: { type: String as PropType<DrawerStructureActions> },
    /** 确定钮的文字，缺省取语言包。 */
    confirmText: { type: String },
    /** 取消钮的文字，缺省取语言包。 */
    cancelText: { type: String },
    /**
     * 点了确定钮。返回 thenable 即挂起：抽屉等它兑现才收起、确定钮转圈，拒绝则留在原地并触发 confirm-error。
     * 模板里照常写 @confirm，Vue 会把它落到这个 prop 上。
     */
    onConfirm: { type: Function as PropType<DrawerActionIntents['onConfirm']> },
  },
  // open-change 携带 { open }，update:open 携带裸布尔；panel-size-change 携带 { panelSize }
  emits: {
    'open-change': (_details: PayloadOf<DrawerProps, 'onOpenChange'>) => true,
    'update:open': (_open: PayloadOf<DrawerProps, 'onOpenChange'>['open']) => true,
    'exit-complete': () => true,
    'panel-size-change': (_details: PayloadOf<DrawerProps, 'onPanelSizeChange'>) => true,
    'update:panelSize': (_size: PayloadOf<DrawerProps, 'onPanelSizeChange'>['panelSize']) => true,
    'confirm-error': (_details: DrawerConfirmErrorDetails) => true,
    'cancel-press': () => true,
  },
  slots: Object as SlotsType<{
    default?: (props: DrawerRootSlotProps) => VNode[]
    /** 触发按钮的内容，压过 trigger-text。 */
    trigger?: () => VNode[]
    /** 标题，压过 title。 */
    title?: () => VNode[]
    /** 说明，压过 description。 */
    description?: () => VNode[]
    /** 正文：面板里唯一会滚动的段。 */
    body?: () => VNode[]
    /** 整段页脚：写了它，取消与确定两颗钮不再代铺。 */
    footer?: () => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notify: DrawerProps['onOpenChange'] = (details) => {
      emit('open-change', details)
      emit('update:open', details.open)
    }
    // 容器一处给定，两件事都从它派生：contained 交给机器（皮肤据此把遮罩与定位层
    // 从 fixed 换成 absolute），同一个值又是 Teleport 的落点，两边不会各说各话
    const notifySize: DrawerProps['onPanelSizeChange'] = (details) => {
      emit('panel-size-change', details)
      emit('update:panelSize', details.panelSize)
    }
    const config = withXhConfig('drawer', props)
    const ctx = useDrawer(config as DrawerProps, notify, () => props.container, () => emit('exit-complete'), notifySize, {
      onConfirm: () => props.onConfirm?.(),
      onConfirmError: details => emit('confirm-error', details),
      onCancelPress: () => emit('cancel-press'),
    })
    provideDrawer(ctx)
    // root 是真实节点，content 会被 portal 到 body，data-side 挂在这里供页面内的部分读取
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default
      ? slots.default({
          open: ctx.api.value.open,
          side: ctx.api.value.side,
          setOpen: ctx.api.value.setOpen,
        })
      : renderDefaultStructure({
          triggerText: props.triggerText,
          title: props.title,
          description: props.description,
          actions: props.actions,
          confirmText: props.confirmText,
          cancelText: props.cancelText,
          resizable: props.resizable,
          translations: config.translations,
        }, { trigger: slots.trigger, title: slots.title, description: slots.description, body: slots.body, footer: slots.footer }))
  },
})

export const XhDrawerTrigger = defineComponent({
  name: 'XhDrawerTrigger',
  // 直通属性自己合：Vue 默认把作者的处理器排在部件的后面，这里改成作者先跑
  inheritAttrs: false,
  props: {
    /** 借用作者的子节点作为触发器，不再渲染自己的包裹元素；子节点须恰好一个。 */
    asChild: Boolean,
  },
  setup(props, { slots, attrs }) {
    const ctx = useDrawerContext()
    return () => {
      const part = mergePartProps(ctx.api.value.getTriggerProps() as Record<string, unknown>, attrs)
      const children = slots.default?.()
      // asChild：把触发器属性合到作者的节点上，不再自己渲染包裹元素
      if (props.asChild) {
        const merged = mergeIntoChild(children, part, 'drawer')
        if (merged)
          return merged
      }
      return h('button', part, children)
    }
  },
})

export const XhDrawerContent = defineComponent({
  name: 'XhDrawerContent',
  // 根是 Teleport，Vue 不会把直通属性合上去，作者写的 class 与 style 得自己接住落到 content 上
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    const ctx = useDrawerContext()
    return () => {
      const api = ctx.api.value
      // presence 判定不在场即退场动画播完；没打开过、或播完且要卸载时整棵不渲染
      const shown = ctx.rendered.value
      if (!api.isContentMounted(shown))
        return null
      const backdrop = api.getBackdropProps() as Record<string, unknown>
      // 收起后常驻（unmountOnExit 为 false）：遮罩不留，定位层以内联 display 收起，视觉桥随之断开
      return h(XhPortal, { to: ctx.portalTarget.value, present: shown }, () => [
        shown && !backdrop.hidden
          ? h('div', {
              ...backdrop,
              ref: (el: unknown) => { ctx.backdropRef.value = el as HTMLElement },
            })
          : null,
        h('div', mergeProps(api.getPositionerProps() as Record<string, unknown>, shown ? {} : OVERLAY_STOWED_PROPS), [
          h('div', {
            ...mergeProps(api.getContentProps() as Record<string, unknown>, attrs),
            hidden: !shown || undefined,
            ref: (el: unknown) => { ctx.contentRef.value = el as HTMLElement },
          }, slots.default?.()),
        ]),
      ])
    }
  },
})

export const XhDrawerHeader = defineComponent({
  name: 'XhDrawerHeader',
  setup(_, { slots }) {
    const ctx = useDrawerContext()
    return () => h('header', ctx.api.value.getHeaderProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhDrawerTitle = defineComponent({
  name: 'XhDrawerTitle',
  setup(_, { slots }) {
    const ctx = useDrawerContext()
    useTitleDescriptionPart(ctx.presence, 'title')
    return () => h('h2', ctx.api.value.getTitleProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhDrawerDescription = defineComponent({
  name: 'XhDrawerDescription',
  setup(_, { slots }) {
    const ctx = useDrawerContext()
    // 读不出一句话的说明不进描述链
    const el = useDescriptionPart(ctx.presence)
    return () => h('p', { ...ctx.api.value.getDescriptionProps() as Record<string, unknown>, ref: el }, slots.default?.())
  },
})

export const XhDrawerBody = defineComponent({
  name: 'XhDrawerBody',
  setup(_, { slots }) {
    const ctx = useDrawerContext()
    return () => h('div', ctx.api.value.getBodyProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhDrawerFooter = defineComponent({
  name: 'XhDrawerFooter',
  setup(_, { slots }) {
    const ctx = useDrawerContext()
    return () => h('footer', ctx.api.value.getFooterProps() as Record<string, unknown>, slots.default?.())
  },
})

/** 确定钮：页脚的主动作；点了发 confirm，异步确认挂起时转圈。 */
export const XhDrawerConfirmTrigger = defineComponent({
  name: 'XhDrawerConfirmTrigger',
  setup(_, { slots }) {
    const ctx = useDrawerContext()
    return () => h('button', ctx.api.value.getConfirmTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

/** 取消钮：页脚的次要出口；点了发 cancel-press 并收起。 */
export const XhDrawerCancelTrigger = defineComponent({
  name: 'XhDrawerCancelTrigger',
  setup(_, { slots }) {
    const ctx = useDrawerContext()
    return () => h('button', ctx.api.value.getCancelTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhDrawerCloseTrigger = defineComponent({
  name: 'XhDrawerCloseTrigger',
  setup(_, { slots }) {
    const ctx = useDrawerContext()
    return () => h('button', ctx.api.value.getCloseTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

/** 改尺把手：role=separator，落在朝向页面的那条边上；放在 XhDrawerContent 里。 */
export const XhDrawerResizeTrigger = defineComponent({
  name: 'XhDrawerResizeTrigger',
  setup() {
    const ctx = useDrawerContext()
    return () => h('div', ctx.api.value.getResizeTriggerProps() as Record<string, unknown>)
  },
})

const DRAWER_PARTS = {
  'trigger': XhDrawerTrigger,
  'content': XhDrawerContent,
  'header': XhDrawerHeader,
  'title': XhDrawerTitle,
  'description': XhDrawerDescription,
  'body': XhDrawerBody,
  'footer': XhDrawerFooter,
  'cancel-trigger': XhDrawerCancelTrigger,
  'confirm-trigger': XhDrawerConfirmTrigger,
  'close-trigger': XhDrawerCloseTrigger,
  'resize-trigger': XhDrawerResizeTrigger,
}

type DrawerSectionSlots = Readonly<Partial<Record<'trigger' | 'title' | 'description' | 'body' | 'footer', () => VNode[]>>>
type DrawerTextOptions = Omit<NonNullable<Parameters<typeof drawerStructure>[0]>, 'slotted'>

/**
 * 未写默认插槽时铺开的整套结构：照 headless 的 drawerStructure 渲；遮罩与定位层由 XhDrawerContent 自己装配，摘掉。
 * 带 slot 的部件放作者在同名插槽里写的内容。
 */
function renderDefaultStructure(options: DrawerTextOptions, sections: DrawerSectionSlots): VNode[] {
  const nodes = withoutPanelShell(drawerStructure({ ...options, slotted: name => sections[name as keyof DrawerSectionSlots] != null }))
  return renderStructure(nodes, DRAWER_PARTS, node => (node.slot ? sections[node.slot.name as keyof DrawerSectionSlots]?.() : undefined))
}
