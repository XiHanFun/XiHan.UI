import type { InjectionKey } from 'vue'
import type { NotificationContext, NotificationItemContext } from './use-notification'
import { inject, provide } from 'vue'

const KEY: InjectionKey<NotificationContext> = Symbol.for('xh-notification')
const ITEM_KEY: InjectionKey<NotificationItemContext> = Symbol.for('xh-notification-item')

export function provideNotification(ctx: NotificationContext): void {
  provide(KEY, ctx)
}

export function useNotificationContext(): NotificationContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Notification 部件必须用在 XhNotificationRoot 内')
  return ctx
}

/** 注入队列上下文，不在队列内时返回 null 而非抛错。 */
export function useNotificationContextOptional(): NotificationContext | null {
  return inject(KEY, null)
}

export function provideNotificationItem(ctx: NotificationItemContext): void {
  provide(ITEM_KEY, ctx)
}

export function useNotificationItemContext(): NotificationItemContext {
  const ctx = inject(ITEM_KEY, null)
  if (!ctx)
    throw new Error('[xh] Notification 卡片部件必须用在 XhNotificationItem 内')
  return ctx
}
