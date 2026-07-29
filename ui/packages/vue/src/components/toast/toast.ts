import type { ToastSchema, ToastTranslations, ToastType } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { defineComponent, h } from 'vue'
import { provideToast, useToastContext } from './context'
import { useToast } from './use-toast'

type ToastProps = ToastSchema['props']

export const XhToastRoot = defineComponent({
  name: 'XhToastRoot',
  // 缺省值由 connect 与机器给出，这里一律 default: undefined
  props: {
    // 队列身份，不是 DOM id；不给则回落到实例的 scope id
    id: { type: String, default: undefined },
    title: { type: String, default: undefined },
    description: { type: String, default: undefined },
    type: { type: String as PropType<ToastType>, default: undefined },
    duration: { type: Number, default: undefined },
    removeDelay: { type: Number, default: undefined },
    closable: { type: Boolean, default: undefined },
    pauseOnPageIdle: { type: Boolean, default: undefined },
    translations: { type: Object as PropType<Partial<ToastTranslations>>, default: undefined },
  },
  // status-change 携带 { id, status }，action 携带 { id }
  emits: ['status-change', 'action'],
  setup(props, { slots, emit }) {
    const notifyStatus: ToastProps['onStatusChange'] = (details) => {
      emit('status-change', details)
    }
    const notifyAction: ToastProps['onAction'] = (details) => {
      emit('action', details)
    }
    const ctx = useToast(props as ToastProps, notifyStatus, notifyAction)
    provideToast(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      id: ctx.api.value.id,
      status: ctx.api.value.status,
      type: ctx.api.value.type,
      paused: ctx.api.value.paused,
      remaining: ctx.api.value.remaining,
      dismiss: ctx.api.value.dismiss,
      pause: ctx.api.value.pause,
      resume: ctx.api.value.resume,
    }))
  },
})

export const XhToastTitle = defineComponent({
  name: 'XhToastTitle',
  setup(_, { slots }) {
    const ctx = useToastContext()
    // 渲染为 div 而非标题标签；无插槽内容时用 title prop 兜底
    return () => h(
      'div',
      ctx.api.value.getTitleProps() as Record<string, unknown>,
      slots.default ? slots.default() : ctx.api.value.title,
    )
  },
})

export const XhToastDescription = defineComponent({
  name: 'XhToastDescription',
  setup(_, { slots }) {
    const ctx = useToastContext()
    return () => h(
      'div',
      ctx.api.value.getDescriptionProps() as Record<string, unknown>,
      slots.default ? slots.default() : ctx.api.value.description,
    )
  },
})

export const XhToastActionTrigger = defineComponent({
  name: 'XhToastActionTrigger',
  setup(_, { slots }) {
    const ctx = useToastContext()
    // 原生 <button>，激活行为交给平台
    return () => h('button', ctx.api.value.getActionTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhToastCloseTrigger = defineComponent({
  name: 'XhToastCloseTrigger',
  setup(_, { slots }) {
    const ctx = useToastContext()
    return () => h('button', ctx.api.value.getCloseTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})
