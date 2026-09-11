import type { Placement, Size } from '@xihan-ui/core'
import type { PopconfirmApi, PopconfirmConfirmErrorDetails, PopconfirmNotifiers, PopconfirmOverlayProps, PopconfirmProps } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h, mergeProps } from 'vue'
import { mergeIntoChild } from '../../runtime/as-child'
import { mergePartProps } from '../../runtime/merge-props'
import { XhPortal } from '../../runtime/portal'
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
    placement: { type: String as PropType<Placement>, default: undefined },
    offset: { type: Number, default: undefined },
    closeOnEscape: { type: Boolean, default: true },
    closeOnInteractOutside: { type: Boolean, default: true },
    size: { type: String as PropType<Size>, default: undefined },
    /**
     * 确认回调走函数 prop 而非 emit：emit 拿不到监听函数的返回值，而异步门就吃它——
     * 返回 thenable 即挂起（浮层等兑现才收、确认按钮转圈），拒绝留在原地并派 confirm-error。
     * 模板里照旧写 @confirm，Vue 会把它落到这个 prop 上。
     */
    onConfirm: { type: Function as PropType<PopconfirmNotifiers['onConfirm']>, default: undefined },
  },
  // open-change 携带 { open }，update:open 携带裸布尔；cancel 不带载荷
  emits: {
    'open-change': (_details: PayloadOf<PopconfirmProps, 'onOpenChange'>) => true,
    'update:open': (_open: PayloadOf<PopconfirmProps, 'onOpenChange'>['open']) => true,
    'confirm-error': (_details: PopconfirmConfirmErrorDetails) => true,
    'cancel': () => true,
  },
  slots: Object as SlotsType<{
    default?: (props: PopconfirmRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notify: PopconfirmNotifiers = {
      onOpenChange: (details) => {
        emit('open-change', details)
        emit('update:open', details.open)
      },
      onConfirm: () => props.onConfirm?.(),
      onConfirmError: details => emit('confirm-error', details),
      onCancel: () => { emit('cancel') },
    }
    const ctx = usePopconfirm(props as PopconfirmOverlayProps, notify)
    providePopconfirm(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      open: ctx.api.value.open,
      pending: ctx.api.value.pending,
      actionError: ctx.api.value.actionError,
      setOpen: ctx.api.value.setOpen,
      confirm: ctx.api.value.confirm,
      cancel: ctx.api.value.cancel,
    }))
  },
})

export const XhPopconfirmTrigger = defineComponent({
  name: 'XhPopconfirmTrigger',
  // 直通属性自己合：Vue 默认把作者的处理器排在部件的后面，这里改成作者先跑
  inheritAttrs: false,
  props: {
    /** 借用作者的子节点当触发器，不再渲染自己的包裹元素；子节点须恰好一个。 */
    asChild: Boolean,
  },
  setup(props, { slots, attrs }) {
    const ctx = usePopconfirmContext()
    return () => {
      const part = mergePartProps({
        ...ctx.api.value.getTriggerProps() as Record<string, unknown>,
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
  // 根是 Teleport，Vue 不会把直通属性合上去，作者写的 class 与 style 得自己接住落到 positioner 上
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    const ctx = usePopconfirmContext()
    // 定位层搬到 portal 落点，逃开祖先的层叠上下文
    return () => h(XhPortal, { to: ctx.portalTarget.value, source: ctx.triggerRef }, () => [
      h('div', {
        ...mergeProps(ctx.api.value.getPositionerProps() as Record<string, unknown>, attrs),
        ref: (el: unknown) => { ctx.positionerRef.value = el as HTMLElement },
      }, slots.default?.()),
    ])
  },
})

export const XhPopconfirmContent = defineComponent({
  name: 'XhPopconfirmContent',
  setup(_, { slots }) {
    const ctx = usePopconfirmContext()
    return () => h('div', {
      ...ctx.api.value.getContentProps() as Record<string, unknown>,
      // 收起跟着退场闸门走：皮肤刻意没给 content 补 [hidden]{display:none}（补了退场
      // 就一帧都播不出来），所以真正的收起落成内联 display——节点始终留在原地
      style: ctx.visible.value ? undefined : { display: 'none' },
      ref: (el: unknown) => { ctx.contentRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhPopconfirmTitle = defineComponent({
  name: 'XhPopconfirmTitle',
  setup(_, { slots }) {
    const ctx = usePopconfirmContext()
    return () => h('h2', ctx.api.value.getTitleProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhPopconfirmDescription = defineComponent({
  name: 'XhPopconfirmDescription',
  setup(_, { slots }) {
    const ctx = usePopconfirmContext()
    return () => h('p', ctx.api.value.getDescriptionProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhPopconfirmConfirmTrigger = defineComponent({
  name: 'XhPopconfirmConfirmTrigger',
  setup(_, { slots }) {
    const ctx = usePopconfirmContext()
    return () => h('button', ctx.api.value.getConfirmTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhPopconfirmCancelTrigger = defineComponent({
  name: 'XhPopconfirmCancelTrigger',
  setup(_, { slots }) {
    const ctx = usePopconfirmContext()
    return () => h('button', ctx.api.value.getCancelTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhPopconfirmArrow = defineComponent({
  name: 'XhPopconfirmArrow',
  setup() {
    const ctx = usePopconfirmContext()
    return () => h('div', ctx.api.value.getArrowProps() as Record<string, unknown>)
  },
})
