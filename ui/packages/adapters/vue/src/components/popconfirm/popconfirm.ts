import type { PopconfirmApi, PopconfirmNotifiers, PopconfirmOverlayProps, PopconfirmProps } from '@xihan-ui/headless'
import type { Placement, Size } from '@xihan-ui/kernel'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h } from 'vue'
import { mergeIntoChild } from '../../runtime/as-child'
import { providePopconfirm, usePopconfirmContext } from './context'
import { usePopconfirm } from './use-popconfirm'

/** 默认插槽的载荷：浮层开合与异步确认挂起两个状态，以及开合、确认、取消三个动作。 */
export type PopconfirmRootSlotProps = Pick<
  PopconfirmApi,
  'open' | 'pending' | 'setOpen' | 'confirm' | 'cancel'
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
     * 返回 Promise 即挂起（浮层等兑现才收、确认按钮转圈），落空留在原地。
     * 模板里照旧写 @confirm，Vue 会把它落到这个 prop 上。
     */
    onConfirm: { type: Function as PropType<PopconfirmNotifiers['onConfirm']>, default: undefined },
  },
  // open-change 携带 { open }，update:open 携带裸布尔；cancel 不带载荷
  emits: {
    'open-change': (_details: PayloadOf<PopconfirmProps, 'onOpenChange'>) => true,
    'update:open': (_open: PayloadOf<PopconfirmProps, 'onOpenChange'>['open']) => true,
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
      onCancel: () => { emit('cancel') },
    }
    const ctx = usePopconfirm(props as PopconfirmOverlayProps, notify)
    providePopconfirm(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      open: ctx.api.value.open,
      pending: ctx.api.value.pending,
      setOpen: ctx.api.value.setOpen,
      confirm: ctx.api.value.confirm,
      cancel: ctx.api.value.cancel,
    }))
  },
})

export const XhPopconfirmTrigger = defineComponent({
  name: 'XhPopconfirmTrigger',
  props: {
    /** 借用作者的子节点当触发器，不再渲染自己的包裹元素；子节点须恰好一个。 */
    asChild: Boolean,
  },
  setup(props, { slots }) {
    const ctx = usePopconfirmContext()
    return () => {
      const attrs = {
        ...ctx.api.value.getTriggerProps() as Record<string, unknown>,
        ref: (el: unknown) => { ctx.triggerRef.value = el as HTMLElement },
      }
      const children = slots.default?.()
      // asChild：把触发器属性合到作者的节点上，不再自己渲染包裹元素
      if (props.asChild) {
        const merged = mergeIntoChild(children, attrs, 'popconfirm')
        if (merged)
          return merged
      }
      return h('button', attrs, children)
    }
  },
})

export const XhPopconfirmPositioner = defineComponent({
  name: 'XhPopconfirmPositioner',
  setup(_, { slots }) {
    const ctx = usePopconfirmContext()
    return () => h('div', {
      ...ctx.api.value.getPositionerProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.positionerRef.value = el as HTMLElement },
    }, slots.default?.())
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
