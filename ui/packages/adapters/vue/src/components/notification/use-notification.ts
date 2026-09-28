/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use notification 相关实现。

import type { NotificationItemSchema, NotificationSchema } from '@xihan-ui/headless'
import type { MaybeRefOrGetter } from 'vue'
import type { NotificationContext, NotificationItemContext } from './context'
import { connectNotification, connectNotificationItem, notificationItemMachine, notificationMachine } from '@xihan-ui/headless'
import { computed, ref, toValue } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { useNotificationContextOptional } from './context'
import { useNotificationItemExit } from './use-item-exit'

/** props 接收 ref/getter 时每帧现取，文案等值可以在运行期更换。 */
export function useNotification(
  props: MaybeRefOrGetter<NotificationSchema['props']>,
  onItemsChange?: NotificationSchema['props']['onItemsChange'],
): NotificationContext {
  const service = useMachine(notificationMachine, () => ({ ...toValue(props), onItemsChange }))
  const api = computed(() => connectNotification(service, vueNormalize))
  const rootRef = ref<HTMLElement | null>(null)
  // 传 getter 而非节点本身，ref 在挂载后才有值
  service.refs.set('getRootEl', () => rootRef.value)
  // 四个命令在顶层摊平，函数身份稳定，可解构后随时调用且不读取队列
  return {
    api,
    rootRef,
    create: options => api.value.create(options),
    update: (id, options) => api.value.update(id, options),
    dismiss: id => api.value.dismiss(id),
    dismissAll: () => api.value.dismissAll(),
  }
}

/**
 * 单条卡片：计时、暂停、按压与退场都在它自己的机器上。
 * 退场完成后由这里通知队列删除记录：队列在外层，卡片自身不知道它。
 */
export function useNotificationItem(
  props: NotificationItemSchema['props'],
  onStatusChange?: NotificationItemSchema['props']['onStatusChange'],
  onAction?: NotificationItemSchema['props']['onAction'],
): NotificationItemContext {
  const queue = useNotificationContextOptional()
  const notifyStatus: NotificationItemSchema['props']['onStatusChange'] = (details) => {
    onStatusChange?.(details)
    if (details.status === 'unmounted')
      queue?.dismiss(details.id)
  }
  const service = useMachine(notificationItemMachine, () => ({ ...props, onStatusChange: notifyStatus, onAction }))
  const api = computed(() => connectNotificationItem(service, vueNormalize))
  const rootRef = ref<HTMLElement | null>(null)
  // 传 getter 而非节点本身，ref 在挂载后才有值；叠摞展开的追踪从它找所在的那一摞
  service.refs.set('getRootEl', () => rootRef.value)
  useNotificationItemExit({ service, isOpen: () => api.value.status === 'visible', rootRef })
  return { api, rootRef }
}
