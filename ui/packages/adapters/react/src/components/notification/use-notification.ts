import type { NotificationOptions, NotificationSchema, ToastSchema } from '@xihan-ui/headless'
import type { NotificationContext, NotificationItemContext } from './context'
import { connectNotification, connectNotificationItem, notificationMachine, toastMachine } from '@xihan-ui/headless'
import { useMemo, useRef } from 'react'
import { reactNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { useNotificationContextOptional } from './context'

export function useNotification(props: NotificationSchema['props']): NotificationContext {
  const service = useMachine(notificationMachine, () => props)
  const api = connectNotification(service, reactNormalize)

  // 四个命令在顶层摊平，函数身份稳定，可解构后随时调用且不读取队列；
  // 调用那一刻才从 ref 里取当下这一份 api
  const apiRef = useRef(api)
  apiRef.current = api
  const commands = useMemo(() => ({
    create: (options?: NotificationOptions) => apiRef.current.create(options),
    update: (id: string, options: Partial<NotificationOptions>) => apiRef.current.update(id, options),
    dismiss: (id: string) => apiRef.current.dismiss(id),
    dismissAll: () => apiRef.current.dismissAll(),
  }), [])

  return { api, service, ...commands }
}

/**
 * 单条卡片。生命周期复用 toast 那台机器——那是「会自己消失的卡片」这一通用行为。
 * 退场走完由这里回队列删记录：队列在外层，卡片自己不认识它。
 */
export function useNotificationItem(props: ToastSchema['props']): NotificationItemContext {
  const queue = useNotificationContextOptional()
  const service = useMachine(toastMachine, () => ({
    ...props,
    onStatusChange: (details) => {
      props.onStatusChange?.(details)
      if (details.status === 'unmounted')
        queue?.dismiss(details.id)
    },
  } satisfies ToastSchema['props']))
  return { api: connectNotificationItem(service, reactNormalize), service }
}
