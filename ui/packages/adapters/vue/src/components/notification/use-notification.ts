import type {
  NotificationApi,
  NotificationItemApi,
  NotificationOptions,
  NotificationSchema,
  ToastSchema,
} from '@xihan-ui/headless'
import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import { connectNotification, connectNotificationItem, notificationMachine, toastMachine } from '@xihan-ui/headless'
import { computed, toValue } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { useNotificationContextOptional } from './context'

export interface NotificationContext {
  api: ComputedRef<NotificationApi>
  /** 入队并返回 id；同 id 已存在则就地改写，位置不动。 */
  create: (options?: NotificationOptions) => string
  update: (id: string, options: Partial<NotificationOptions>) => void
  dismiss: (id: string) => void
  dismissAll: () => void
}

export interface NotificationItemContext {
  api: ComputedRef<NotificationItemApi>
}

/** props 收 ref/getter 时每帧现取，文案之类的量可以运行期换。 */
export function useNotification(
  props: MaybeRefOrGetter<NotificationSchema['props']>,
  onItemsChange?: NotificationSchema['props']['onItemsChange'],
): NotificationContext {
  const service = useMachine(notificationMachine, () => ({ ...toValue(props), onItemsChange }))
  const api = computed(() => connectNotification(service, vueNormalize))
  // 四个命令在顶层摊平，函数身份稳定，可解构后随时调用且不读取队列
  return {
    api,
    create: options => api.value.create(options),
    update: (id, options) => api.value.update(id, options),
    dismiss: id => api.value.dismiss(id),
    dismissAll: () => api.value.dismissAll(),
  }
}

/**
 * 单条卡片。生命周期复用 toast 那台机器——那是「会自己消失的卡片」这一通用行为。
 * 退场走完由这里回队列删记录：队列在外层，卡片自己不认识它。
 */
export function useNotificationItem(
  props: ToastSchema['props'],
  onStatusChange?: ToastSchema['props']['onStatusChange'],
  onAction?: ToastSchema['props']['onAction'],
): NotificationItemContext {
  const queue = useNotificationContextOptional()
  const notifyStatus: ToastSchema['props']['onStatusChange'] = (details) => {
    onStatusChange?.(details)
    if (details.status === 'unmounted')
      queue?.dismiss(details.id)
  }
  const service = useMachine(toastMachine, () => ({ ...props, onStatusChange: notifyStatus, onAction }))
  const api = computed(() => connectNotificationItem(service, vueNormalize))
  return { api }
}
