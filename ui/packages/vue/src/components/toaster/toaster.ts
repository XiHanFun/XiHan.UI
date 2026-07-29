import type { ToasterSchema, ToasterTranslations, ToastPlacement, ToastRecord } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { defineComponent, Fragment, h } from 'vue'
import { provideToaster, useToasterContext } from './context'
import { useToaster } from './use-toaster'

type ToasterProps = ToasterSchema['props']

export const XhToasterRoot = defineComponent({
  name: 'XhToasterRoot',
  // 缺省值由 connect 决定，这里一律 default: undefined
  props: {
    toasts: { type: Array as PropType<ToastRecord[]>, default: undefined },
    defaultToasts: { type: Array as PropType<ToastRecord[]>, default: undefined },
    placement: { type: String as PropType<ToastPlacement>, default: undefined },
    max: { type: Number, default: undefined },
    gap: { type: Number, default: undefined },
    duration: { type: Number, default: undefined },
    removeDelay: { type: Number, default: undefined },
    pauseOnPageIdle: { type: Boolean, default: undefined },
    translations: { type: Object as PropType<Partial<ToasterTranslations>>, default: undefined },
  },
  // toasts-change 携带 { toasts }，update:toasts 携带裸队列以支持 v-model:toasts
  emits: ['toasts-change', 'update:toasts'],
  setup(props, { slots, emit }) {
    const notify: ToasterProps['onToastsChange'] = (details) => {
      emit('toasts-change', details)
      emit('update:toasts', details.toasts)
    }
    const ctx = useToaster(props as ToasterProps, notify)
    provideToaster(ctx)
    // 根节点是地标容器，插槽作用域里一并暴露队列与增删改命令
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      toasts: ctx.api.value.visibleToasts,
      placements: ctx.api.value.placements,
      count: ctx.api.value.count,
      getToastsByPlacement: ctx.api.value.getToastsByPlacement,
      create: ctx.create,
      update: ctx.update,
      dismiss: ctx.dismiss,
      dismissAll: ctx.dismissAll,
    }))
  },
})

export const XhToasterGroup = defineComponent({
  name: 'XhToasterGroup',
  props: {
    // 不写就用 toaster 的 placement；写了就只收这个位置上的条目
    placement: { type: String as PropType<ToastPlacement>, default: undefined },
  },
  setup(props, { slots }) {
    const ctx = useToasterContext()
    return () => {
      const api = ctx.api.value
      const groupProps = api.getGroupProps({ placement: props.placement }) as Record<string, unknown>
      // 落位从 group 自己的产出里读回，不在这边重算缺省
      const placement = groupProps['data-placement'] as ToastPlacement
      const list = api.getToastsByPlacement(placement)
      // 每条通知按队列身份 id 给 key，避免节点被就地复用
      return h(
        'div',
        groupProps,
        slots.default ? list.map(toast => h(Fragment, { key: toast.id }, slots.default!({ toast }))) : undefined,
      )
    }
  },
})
