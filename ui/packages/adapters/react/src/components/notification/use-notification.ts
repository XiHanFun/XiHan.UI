/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use notification 相关实现。

import type { NotificationOptions, NotificationSchema, ToastSchema } from '@xihan-ui/headless'
import type { NotificationContext, NotificationItemContext } from './context'
import { connectNotification, connectNotificationItem, notificationMachine, toastMachine } from '@xihan-ui/headless'
import { useMemo, useRef } from 'react'
import { reactNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { useToastExit } from '../toast/use-toast-exit'
import { useNotificationContextOptional } from './context'

export function useNotification(props: NotificationSchema['props']): NotificationContext {
  const service = useMachine(notificationMachine, () => props)
  const api = connectNotification(service, reactNormalize)
  const rootRef = useRef<HTMLElement | null>(null)
  // 传 getter 而非节点本身，ref 在提交后才附着
  service.refs.set('getRootEl', () => rootRef.current)

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

  return { api, service, rootRef, ...commands }
}

/**
 * 单条卡片。生命周期复用 toast 的状态机：那是会自动消失的卡片这一通用行为。
 * 退场完成后由这里通知队列删除记录：队列在外层，卡片自身不知道它。
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
  const api = connectNotificationItem(service, reactNormalize)
  const rootRef = useRef<HTMLElement | null>(null)
  useToastExit({ service, isOpen: () => api.status === 'visible', rootRef })
  return { api, service, rootRef }
}
