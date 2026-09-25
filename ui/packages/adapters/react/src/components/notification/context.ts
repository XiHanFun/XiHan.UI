/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { Service } from '@xihan-ui/core'
import type { NotificationApi, NotificationItemApi, NotificationOptions, NotificationSchema, ToastSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { createContext, useContext } from 'react'

export interface NotificationContext {
  api: NotificationApi
  service: Service<NotificationSchema>
  /** 入队并返回 id；同 id 已存在则就地改写，位置不变。 */
  create: (options?: NotificationOptions) => string
  update: (id: string, options: Partial<NotificationOptions>) => void
  dismiss: (id: string) => void
  dismissAll: () => void
}

export interface NotificationItemContext {
  api: NotificationItemApi
  service: Service<ToastSchema>
  /** 卡片根节点：退场动画从它上面探测。 */
  rootRef: RefObject<HTMLElement | null>
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

/** 不在队列内时返回 undefined，单张卡片仍可单独使用。 */
export function useNotificationContextOptional(): NotificationContext | undefined {
  return useContext(Ctx)
}

export function useNotificationItemContext(): NotificationItemContext {
  const ctx = useContext(ItemCtx)
  if (!ctx)
    throw new Error('卡片的子部件要放在 XhNotificationItem 里')
  return ctx
}
