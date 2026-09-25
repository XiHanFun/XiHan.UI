/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use notification 相关实现。

import type { NotificationSchema, ToastSchema } from '@xihan-ui/headless'
import type { MaybeRefOrGetter } from 'vue'
import type { NotificationContext, NotificationItemContext } from './context'
import { connectNotification, connectNotificationItem, notificationMachine, toastMachine } from '@xihan-ui/headless'
import { computed, ref, toValue } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { useToastExit } from '../toast/use-toast-exit'
import { useNotificationContextOptional } from './context'

/** props 接收 ref/getter 时每帧现取，文案等值可以在运行期更换。 */
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
 * 单条卡片。生命周期复用 toast 的状态机：那是会自动消失的卡片这一通用行为。
 * 退场完成后由这里通知队列删除记录：队列在外层，卡片自身不知道它。
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
  const rootRef = ref<HTMLElement | null>(null)
  useToastExit({ service, isOpen: () => api.value.status === 'visible', rootRef })
  return { api, rootRef }
}
