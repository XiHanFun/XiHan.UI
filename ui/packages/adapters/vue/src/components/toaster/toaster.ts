import type { ResolvedToast, ToasterSchema, ToasterTranslations, ToastOptions, ToastPlacement, ToastRecord } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, Fragment, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { provideToaster, useToasterContext } from './context'
import { useToaster } from './use-toaster'

type ToasterProps = ToasterSchema['props']

/** 默认插槽的载荷：当前可见的通知队列与它的落位分组，以及入队、改写、关闭的命令。 */
export interface ToasterRootSlotProps {
  toasts: ResolvedToast[]
  placements: ToastPlacement[]
  count: number
  getToastsByPlacement: (placement: ToastPlacement) => ResolvedToast[]
  create: (options?: ToastOptions) => string
  update: (id: string, options: Partial<ToastOptions>) => void
  dismiss: (id: string) => void
  dismissAll: () => void
}

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
  emits: {
    'toasts-change': (_details: PayloadOf<ToasterProps, 'onToastsChange'>) => true,
    'update:toasts': (_toasts: PayloadOf<ToasterProps, 'onToastsChange'>['toasts']) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: ToasterRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notify: ToasterProps['onToastsChange'] = (details) => {
      emit('toasts-change', details)
      emit('update:toasts', details.toasts)
    }
    const ctx = useToaster(withXhConfig('toaster', props) as ToasterProps, notify)
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

/** 默认插槽的载荷：这一组里逐条铺开的通知。 */
export interface ToasterGroupSlotProps {
  toast: ResolvedToast
}

export const XhToasterGroup = defineComponent({
  name: 'XhToasterGroup',
  props: {
    // 不写就用 toaster 的 placement；写了就只收这个位置上的条目
    placement: { type: String as PropType<ToastPlacement>, default: undefined },
  },
  slots: Object as SlotsType<{
    default?: (props: ToasterGroupSlotProps) => VNode[]
  }>,
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
