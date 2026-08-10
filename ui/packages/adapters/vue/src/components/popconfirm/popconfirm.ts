import type { PopconfirmNotifiers, PopconfirmOverlayProps, PopconfirmProps } from '@xihan-ui/headless'
import type { Placement, Size } from '@xihan-ui/kernel'
import type { PropType } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h } from 'vue'
import { providePopconfirm, usePopconfirmContext } from './context'
import { usePopconfirm } from './use-popconfirm'

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
  },
  // open-change 携带 { open }，update:open 携带裸布尔；confirm / cancel 不带载荷
  emits: {
    'open-change': (_details: PayloadOf<PopconfirmProps, 'onOpenChange'>) => true,
    'update:open': (_open: PayloadOf<PopconfirmProps, 'onOpenChange'>['open']) => true,
    'confirm': () => true,
    'cancel': () => true,
  },
  setup(props, { slots, emit }) {
    const notify: PopconfirmNotifiers = {
      onOpenChange: (details) => {
        emit('open-change', details)
        emit('update:open', details.open)
      },
      onConfirm: () => { emit('confirm') },
      onCancel: () => { emit('cancel') },
    }
    const ctx = usePopconfirm(props as PopconfirmOverlayProps, notify)
    providePopconfirm(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      open: ctx.api.value.open,
      setOpen: ctx.api.value.setOpen,
      confirm: ctx.api.value.confirm,
      cancel: ctx.api.value.cancel,
    }))
  },
})

export const XhPopconfirmTrigger = defineComponent({
  name: 'XhPopconfirmTrigger',
  setup(_, { slots }) {
    const ctx = usePopconfirmContext()
    return () => h('button', {
      ...ctx.api.value.getTriggerProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.triggerRef.value = el as HTMLElement },
    }, slots.default?.())
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
