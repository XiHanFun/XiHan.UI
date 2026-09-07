import type { Service } from '@xihan-ui/core'
import type { NotificationApi, NotificationItemApi, NotificationOptions, NotificationSchema, ToastSchema } from '@xihan-ui/headless'
import { createContext, useContext } from 'react'

export interface NotificationContext {
  api: NotificationApi
  service: Service<NotificationSchema>
  /** 入队并返回 id；同 id 已存在则就地改写，位置不动。 */
  create: (options?: NotificationOptions) => string
  update: (id: string, options: Partial<NotificationOptions>) => void
  dismiss: (id: string) => void
  dismissAll: () => void
}

export interface NotificationItemContext {
  api: NotificationItemApi
  service: Service<ToastSchema>
}

const Ctx = createContext<NotificationContext | undefined>(undefined)
const ItemCtx = createContext<NotificationItemContext | undefined>(undefined)

export const NotificationProvider = Ctx
export const NotificationItemProvider = ItemCtx

export function useNotificationContext(): NotificationContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhNotification 的部件要放在 XhNotificationRoot 里')
  return ctx
}

/** 不在队列里时返回 undefined，单张卡片照样能单独用。 */
export function useNotificationContextOptional(): NotificationContext | undefined {
  return useContext(Ctx)
}

export function useNotificationItemContext(): NotificationItemContext {
  const ctx = useContext(ItemCtx)
  if (!ctx)
    throw new Error('卡片的子部件要放在 XhNotificationItem 里')
  return ctx
}
