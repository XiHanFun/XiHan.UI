/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供通知卡片的退场闸门接线。

import type { RuntimeConfig, Service } from '@xihan-ui/core'
import type { NotificationItemSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { createRuntimeConfig } from '@xihan-ui/core'
import { useMemo } from 'react'
import { useOverlayExit } from '../../runtime/use-overlay-exit'

export interface NotificationItemExitOptions {
  service: Service<NotificationItemSchema>
  /** 还在台上：dismissing 与 unmounted 之外的状态。 */
  isOpen: () => boolean
  /** 卡片根节点，退场动画从它上面探测。 */
  rootRef: RefObject<HTMLElement | null>
}

/**
 * 进入 dismissing 之后，卡片的机器等这里交给它的 Presence 把卡片上真实的退场动画播完再转 unmounted。
 * 服务端没有 DOM，不接闸门，机器下一拍自行收起。
 */
export function useNotificationItemExit(options: NotificationItemExitOptions): void {
  const { service } = options
  const config = useMemo<RuntimeConfig | null>(
    () => (typeof document === 'undefined' ? null : createRuntimeConfig({ scope: service.scope })),
    [service],
  )
  useOverlayExit({
    config,
    isOpen: options.isOpen,
    contentRef: options.rootRef,
    onPresence: presence => service.refs.set('presence', presence),
  })
}
