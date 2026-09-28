/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use notification 相关实现。

import type { NotificationItemSchema, NotificationOptions, NotificationSchema } from '@xihan-ui/headless'
import type { NotificationContext, NotificationItemContext } from './context'
import { connectNotification, connectNotificationItem, notificationItemMachine, notificationMachine } from '@xihan-ui/headless'
import { useMemo, useRef } from 'react'
import { reactNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { useNotificationContextOptional } from './context'
import { useNotificationItemExit } from './use-item-exit'

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
 * 单条卡片：计时、暂停、按压与退场都在它自己的机器上。
 * 退场完成后由这里通知队列删除记录：队列在外层，卡片自身不知道它。
 */
export function useNotificationItem(props: NotificationItemSchema['props']): NotificationItemContext {
  const queue = useNotificationContextOptional()
  const service = useMachine(notificationItemMachine, () => ({
    ...props,
    onStatusChange: (details) => {
      props.onStatusChange?.(details)
      if (details.status === 'unmounted')
        queue?.dismiss(details.id)
    },
  } satisfies NotificationItemSchema['props']))
  const api = connectNotificationItem(service, reactNormalize)
  const rootRef = useRef<HTMLElement | null>(null)
  // 传 getter 而非节点本身，ref 在提交后才附着；叠摞展开的追踪从它找所在的那一摞
  service.refs.set('getRootEl', () => rootRef.current)
  useNotificationItemExit({ service, isOpen: () => api.status === 'visible', rootRef })
  return { api, service, rootRef }
}
