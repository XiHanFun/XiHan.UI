/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 dialog 相关实现。

import type { OverlayBackdropVariant, Size } from '@xihan-ui/core'
import type { DialogActionIntents, DialogApi, DialogConfirmErrorDetails, DialogSchema, DialogStructureActions } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { dialogStructure, withoutPanelShell } from '@xihan-ui/headless'
import { defineComponent, h, mergeProps } from 'vue'
import { withXhConfig } from '../../config/config'
import { mergeIntoChild } from '../../runtime/as-child'
import { mergePartProps } from '../../runtime/merge-props'
import { XhPortal } from '../../runtime/portal'
import { renderStructure } from '../../runtime/structure'
import { useDescriptionPart, useTitleDescriptionPart } from '../../runtime/title-description'
import { OVERLAY_STOWED_PROPS } from '../../runtime/use-overlay-exit'
import { provideDialog, useDialogContext } from './context'
import { useDialog } from './use-dialog'

type DialogProps = DialogSchema['props']

/** 默认插槽的载荷：展开态与修改展开的动作。 */
export type DialogRootSlotProps = Pick<DialogApi, 'open' | 'setOpen'>

export const XhDialogRoot = /* @__PURE__ */ defineComponent({
  name: 'XhDialogRoot',
  props: {
    open: { type: Boolean, default: undefined },
    defaultOpen: Boolean,
    modal: { type: Boolean, default: true },
    role: { type: String as PropType<'dialog' | 'alertdialog'>, default: 'dialog' },
    closeOnEscape: { type: Boolean, default: true },
    closeOnInteractOutside: { type: Boolean, default: undefined },
    restoreFocus: { type: Boolean, default: true },
    initialFocus: { type: String },
    size: { type: String as PropType<Size> },
    variant: { type: String as PropType<OverlayBackdropVariant> },
    /** 可拖动：按住标题栏或拖动把手挪走面板，方向键在把手上挪一步；面板始终夹在视口内。 */
    draggable: { type: Boolean, default: undefined },
    /** 收起动画播完后卸载内容，默认 true；false 时第一次打开才挂载、此后收起只隐藏，再打开不重挂。 */
    unmountOnExit: { type: Boolean, default: undefined },
    translations: { type: Object as PropType<DialogProps['translations']> },
    // —— 不写默认插槽时的标准结构（dialogStructure）——
    /** 触发按钮的文字；trigger 插槽有内容时以插槽为准。两者都没有时不铺触发器，开合交给 v-model:open。 */
    triggerText: { type: String },
    /** 标题文字；title 插槽有内容时以插槽为准。 */
    title: { type: String },
    /** 说明文字；description 插槽有内容时以插槽为准。 */
    description: { type: String },
    /** 页脚铺哪几颗钮：confirm（取消 + 确定，缺省）、alert（只有确定）、none；footer 插槽有内容时整段归作者。 */
    actions: { type: String as PropType<DialogStructureActions> },
    /** 确定钮的文字，缺省取语言包。 */
    confirmText: { type: String },
    /** 取消钮的文字，缺省取语言包。 */
    cancelText: { type: String },
    /**
     * 点了确定钮。返回 thenable 即挂起：面板等它兑现才收起、确定钮转圈，拒绝则留在原地并触发 confirm-error。
     * 模板里照常写 @confirm，Vue 会把它落到这个 prop 上。
     */
    onConfirm: { type: Function as PropType<DialogActionIntents['onConfirm']> },
  },
  // open-change 携带 { open }，update:open 携带裸布尔
  emits: {
    'open-change': (_details: PayloadOf<DialogProps, 'onOpenChange'>) => true,
    'update:open': (_open: PayloadOf<DialogProps, 'onOpenChange'>['open']) => true,
    'exit-complete': () => true,
    'confirm-error': (_details: DialogConfirmErrorDetails) => true,
    'cancel-press': () => true,
  },
  slots: Object as SlotsType<{
    default?: (props: DialogRootSlotProps) => VNode[]
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
    const notify: DialogProps['onOpenChange'] = (details) => {
      emit('open-change', details)
      emit('update:open', details.open)
    }
    const config = withXhConfig('dialog', props)
    const ctx = useDialog(config as DialogProps, notify, () => emit('exit-complete'), {
      onConfirm: () => props.onConfirm?.(),
      onConfirmError: details => emit('confirm-error', details),
      onCancelPress: () => emit('cancel-press'),
    })
    provideDialog(ctx)
    return () => (slots.default
      ? slots.default({ open: ctx.api.value.open, setOpen: ctx.api.value.setOpen })
      : renderDefaultStructure({
          triggerText: props.triggerText,
          title: props.title,
          description: props.description,
          actions: props.actions,
          confirmText: props.confirmText,
          cancelText: props.cancelText,
          translations: config.translations,
        }, { trigger: slots.trigger, title: slots.title, description: slots.description, body: slots.body, footer: slots.footer }))
  },
})

export const XhDialogTrigger = /* @__PURE__ */ defineComponent({
  name: 'XhDialogTrigger',
  // 直通属性自己合：Vue 默认把作者的处理器排在部件的后面，这里改成作者先跑
  inheritAttrs: false,
  props: {
    /** 借用作者的子节点作为触发器，不再渲染自己的包裹元素；子节点须恰好一个。 */
    asChild: Boolean,
  },
  setup(props, { slots, attrs }) {
    const ctx = useDialogContext()
    return () => {
      const part = mergePartProps(ctx.api.value.getTriggerProps(), attrs)
      const children = slots.default?.()
      // asChild：把触发器属性合到作者的节点上，不再自己渲染包裹元素
      if (props.asChild) {
        const merged = mergeIntoChild(children, part, 'dialog')
        if (merged)
          return merged
      }
      return h('button', part, children)
    }
  },
})

export const XhDialogContent = /* @__PURE__ */ defineComponent({
  name: 'XhDialogContent',
  props: {
    /** 本实例的 Portal 容器；优先于应用级配置。 */
    container: { type: Object as PropType<Element> },
  },
  // 根是 Teleport，Vue 不会把直通属性合上去，作者写的 class 与 style 得自己接住落到 content 上
  inheritAttrs: false,
  setup(props, { slots, attrs }) {
    const ctx = useDialogContext()
    return () => {
      const api = ctx.api.value
      const shown = ctx.rendered.value
      // 没打开过、或退场播完且要卸载时整棵不渲染
      if (!api.isContentMounted(shown))
        return null
      const backdrop = api.getBackdropProps()
      // 收起后常驻（unmountOnExit 为 false）：遮罩不留，定位层以内联 display 收起，视觉桥随之断开
      return h(XhPortal, { to: props.container ?? ctx.portalTarget.value, present: shown }, () => [
        shown && !backdrop.hidden
          ? h('div', {
              ...backdrop,
              ref: (el: unknown) => { ctx.backdropRef.value = el as HTMLElement },
            })
          : null,
        h('div', mergeProps(api.getPositionerProps(), shown ? {} : OVERLAY_STOWED_PROPS), [
          h('div', {
            ...mergeProps(api.getContentProps(), attrs),
            hidden: !shown || undefined,
            ref: (el: unknown) => { ctx.contentRef.value = el as HTMLElement },
          }, slots.default?.()),
        ]),
      ])
    }
  },
})

export const XhDialogHeader = /* @__PURE__ */ defineComponent({
  name: 'XhDialogHeader',
  setup(_, { slots }) {
    const ctx = useDialogContext()
    return () => h('header', ctx.api.value.getHeaderProps(), slots.default?.())
  },
})

/** 拖动把手：键盘挪动面板的入口；放在 XhDialogHeader 里时铺满标题栏。 */
export const XhDialogDragTrigger = /* @__PURE__ */ defineComponent({
  name: 'XhDialogDragTrigger',
  setup(_, { slots }) {
    const ctx = useDialogContext()
    return () => h('button', ctx.api.value.getDragTriggerProps(), slots.default?.())
  },
})

/** 语气徽记：未提供内容时由皮肤按节点上的 data-tone 绘制兜底字形，放入节点即整个替换。 */
export const XhDialogIndicator = /* @__PURE__ */ defineComponent({
  name: 'XhDialogIndicator',
  setup(_, { slots }) {
    const ctx = useDialogContext()
    return () => h('span', ctx.api.value.getIndicatorProps(), slots.default?.())
  },
})

export const XhDialogTitle = /* @__PURE__ */ defineComponent({
  name: 'XhDialogTitle',
  setup(_, { slots }) {
    const ctx = useDialogContext()
    useTitleDescriptionPart(ctx.presence, 'title')
    return () => h('h2', ctx.api.value.getTitleProps(), slots.default?.())
  },
})

export const XhDialogDescription = /* @__PURE__ */ defineComponent({
  name: 'XhDialogDescription',
  setup(_, { slots }) {
    const ctx = useDialogContext()
    // 读不出一句话的说明不进描述链
    const el = useDescriptionPart(ctx.presence)
    return () => h('p', { ...ctx.api.value.getDescriptionProps(), ref: el }, slots.default?.())
  },
})

export const XhDialogBody = /* @__PURE__ */ defineComponent({
  name: 'XhDialogBody',
  setup(_, { slots }) {
    const ctx = useDialogContext()
    return () => h('div', ctx.api.value.getBodyProps(), slots.default?.())
  },
})

export const XhDialogFooter = /* @__PURE__ */ defineComponent({
  name: 'XhDialogFooter',
  setup(_, { slots }) {
    const ctx = useDialogContext()
    return () => h('footer', ctx.api.value.getFooterProps(), slots.default?.())
  },
})

/** 确定钮：页脚的主动作；点了发 confirm，异步确认挂起时转圈。 */
export const XhDialogConfirmTrigger = /* @__PURE__ */ defineComponent({
  name: 'XhDialogConfirmTrigger',
  setup(_, { slots }) {
    const ctx = useDialogContext()
    return () => h('button', ctx.api.value.getConfirmTriggerProps(), slots.default?.())
  },
})

/** 取消钮：页脚的次要出口；点了发 cancel-press 并收起。 */
export const XhDialogCancelTrigger = /* @__PURE__ */ defineComponent({
  name: 'XhDialogCancelTrigger',
  setup(_, { slots }) {
    const ctx = useDialogContext()
    return () => h('button', ctx.api.value.getCancelTriggerProps(), slots.default?.())
  },
})

export const XhDialogCloseTrigger = /* @__PURE__ */ defineComponent({
  name: 'XhDialogCloseTrigger',
  setup(_, { slots }) {
    const ctx = useDialogContext()
    return () => h('button', ctx.api.value.getCloseTriggerProps(), slots.default?.())
  },
})

const DIALOG_PARTS = {
  'trigger': XhDialogTrigger,
  'content': XhDialogContent,
  'header': XhDialogHeader,
  'title': XhDialogTitle,
  'description': XhDialogDescription,
  'body': XhDialogBody,
  'footer': XhDialogFooter,
  'cancel-trigger': XhDialogCancelTrigger,
  'confirm-trigger': XhDialogConfirmTrigger,
  'close-trigger': XhDialogCloseTrigger,
}

type DialogSectionSlots = Readonly<Partial<Record<'trigger' | 'title' | 'description' | 'body' | 'footer', () => VNode[]>>>
type DialogTextOptions = Omit<NonNullable<Parameters<typeof dialogStructure>[0]>, 'slotted'>

/**
 * 未写默认插槽时铺开的整套结构：照 headless 的 dialogStructure 渲；遮罩与定位层由 XhDialogContent 自己装配，摘掉。
 * 带 slot 的部件放作者在同名插槽里写的内容。
 */
function renderDefaultStructure(options: DialogTextOptions, sections: DialogSectionSlots): VNode[] {
  const nodes = withoutPanelShell(dialogStructure({ ...options, slotted: name => sections[name as keyof DialogSectionSlots] != null }))
  return renderStructure(nodes, DIALOG_PARTS, node => (node.slot ? sections[node.slot.name as keyof DialogSectionSlots]?.() : undefined))
}
