import type { ToastSchema, ToastTranslations, ToastType } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { defineComponent, h } from 'vue'
import { provideToast, useToastContext } from './context'
import { useToast } from './use-toast'

type ToastProps = ToastSchema['props']

export const XhToastRoot = defineComponent({
  name: 'XhToastRoot',
  // 一律 default: undefined —— 缺省值的唯一事实源在 connect 与机器里
  // （closable 尤其：裸 Boolean 声明会把缺省压成 false，关闭按钮当场消失）
  props: {
    // 队列身份，不是 DOM id：队列按它寻址（同 id 再 create 即就地改写），
    // 不给就回落到实例自己的 scope id。root 节点上不会出现这个值
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
  // status-change 携带 { id, status }，dismissing 与 unmounted 各一次；
  // action 携带 { id }，操作按钮被按下时先于退场发出
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
    // 不用标题标签：这条是转瞬即逝的播报，塞进文档大纲会让整页的标题层级凭空多出一层。
    // 作者没写内容时用 title prop 兜底——队列里的条目是纯数据，文案本来就来自那边
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
    // 原生 <button>：Enter / Space 的激活由平台负责，我们不自己接这两个键
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
