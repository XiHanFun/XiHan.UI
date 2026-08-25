import type { NotificationItemApi, NotificationOptions, NotificationPlacement, NotificationRecord, NotificationSchema, NotificationTranslations, ResolvedNotification, ToastSchema, ToastTranslations, ToastType } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, Fragment, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { provideNotification, provideNotificationItem, useNotificationContext, useNotificationItemContext } from './context'
import { useNotification, useNotificationItem } from './use-notification'

type NotificationProps = NotificationSchema['props']

/** 默认插槽的载荷：当前可见的通知队列与它的落位分组，以及入队、改写、关闭的命令。 */
export interface NotificationRootSlotProps {
  items: ResolvedNotification[]
  placements: NotificationPlacement[]
  count: number
  getItemsByPlacement: (placement: NotificationPlacement) => ResolvedNotification[]
  create: (options?: NotificationOptions) => string
  update: (id: string, options: Partial<NotificationOptions>) => void
  dismiss: (id: string) => void
  dismissAll: () => void
}

export const XhNotificationRoot = defineComponent({
  name: 'XhNotificationRoot',
  // 缺省值由 connect 决定，这里一律 default: undefined
  props: {
    items: { type: Array as PropType<NotificationRecord[]>, default: undefined },
    defaultItems: { type: Array as PropType<NotificationRecord[]>, default: undefined },
    placement: { type: String as PropType<NotificationPlacement>, default: undefined },
    max: { type: Number, default: undefined },
    gap: { type: Number, default: undefined },
    duration: { type: Number, default: undefined },
    removeDelay: { type: Number, default: undefined },
    pauseOnPageIdle: { type: Boolean, default: undefined },
    translations: { type: Object as PropType<Partial<NotificationTranslations>>, default: undefined },
  },
  // items-change 携带 { items }，update:items 携带裸队列以支持 v-model:items
  emits: {
    'items-change': (_details: PayloadOf<NotificationProps, 'onItemsChange'>) => true,
    'update:items': (_items: PayloadOf<NotificationProps, 'onItemsChange'>['items']) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: NotificationRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notify: NotificationProps['onItemsChange'] = (details) => {
      emit('items-change', details)
      emit('update:items', details.items)
    }
    const ctx = useNotification(withXhConfig('notification', props) as NotificationProps, notify)
    provideNotification(ctx)
    // 根节点是地标容器，插槽作用域里一并暴露队列与增删改命令
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      items: ctx.api.value.visibleNotifications,
      placements: ctx.api.value.placements,
      count: ctx.api.value.count,
      getItemsByPlacement: ctx.api.value.getItemsByPlacement,
      create: ctx.create,
      update: ctx.update,
      dismiss: ctx.dismiss,
      dismissAll: ctx.dismissAll,
    }))
  },
})

/** 默认插槽的载荷：这一组里逐条铺开的通知。 */
export interface NotificationGroupSlotProps {
  item: ResolvedNotification
}

export const XhNotificationGroup = defineComponent({
  name: 'XhNotificationGroup',
  props: {
    // 不写就用 notification 的 placement；写了就只收这个位置上的条目
    placement: { type: String as PropType<NotificationPlacement>, default: undefined },
  },
  slots: Object as SlotsType<{
    default?: (props: NotificationGroupSlotProps) => VNode[]
  }>,
  setup(props, { slots }) {
    const ctx = useNotificationContext()
    return () => {
      const api = ctx.api.value
      const groupProps = api.getGroupProps({ placement: props.placement }) as Record<string, unknown>
      // 落位从 group 自己的产出里读回，不在这边重算缺省
      const placement = groupProps['data-placement'] as NotificationPlacement
      const list = api.getItemsByPlacement(placement)
      // 每条通知按队列身份 id 给 key，避免节点被就地复用
      return h(
        'div',
        groupProps,
        slots.default ? list.map(item => h(Fragment, { key: item.id }, slots.default!({ item }))) : undefined,
      )
    }
  },
})

/** 单条卡片。生命周期复用 toast 那台机器：会自己消失的卡片，这一行为与消息来源无关。 */
export const XhNotificationItem = defineComponent({
  name: 'XhNotificationItem',
  // 缺省值由 connect 决定，这里一律 default: undefined
  props: {
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
  emits: {
    'status-change': (_details: PayloadOf<ToastSchema['props'], 'onStatusChange'>) => true,
    'action': () => true,
  },
  slots: Object as SlotsType<{
    default?: (props: { item: NotificationItemApi }) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const ctx = useNotificationItem(
      withXhConfig('toast', props) as ToastSchema['props'],
      details => emit('status-change', details),
      () => emit('action'),
    )
    provideNotificationItem(ctx)
    return () => h(
      'div',
      ctx.api.value.getItemProps() as Record<string, unknown>,
      slots.default?.({ item: ctx.api.value }),
    )
  },
})

/** 类型指示符。作者不写内容时由皮肤按 data-type 画一枚兜底字形。 */
export const XhNotificationItemIndicator = defineComponent({
  name: 'XhNotificationItemIndicator',
  setup(_, { slots }) {
    const ctx = useNotificationItemContext()
    return () => h('span', ctx.api.value.getItemIndicatorProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhNotificationItemTitle = defineComponent({
  name: 'XhNotificationItemTitle',
  setup(_, { slots }) {
    const ctx = useNotificationItemContext()
    // 作者没写内容就用队列里那条记录的标题
    return () => h(
      'div',
      ctx.api.value.getItemTitleProps() as Record<string, unknown>,
      slots.default?.() ?? ctx.api.value.title,
    )
  },
})

export const XhNotificationItemDescription = defineComponent({
  name: 'XhNotificationItemDescription',
  setup(_, { slots }) {
    const ctx = useNotificationItemContext()
    return () => h(
      'div',
      ctx.api.value.getItemDescriptionProps() as Record<string, unknown>,
      slots.default?.() ?? ctx.api.value.description,
    )
  },
})

export const XhNotificationItemActionTrigger = defineComponent({
  name: 'XhNotificationItemActionTrigger',
  setup(_, { slots }) {
    const ctx = useNotificationItemContext()
    return () => h('button', ctx.api.value.getItemActionTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhNotificationItemCloseTrigger = defineComponent({
  name: 'XhNotificationItemCloseTrigger',
  setup(_, { slots }) {
    const ctx = useNotificationItemContext()
    return () => h('button', ctx.api.value.getItemCloseTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})
