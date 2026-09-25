/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供轻提示与通知卡片共用的退场闸门接线。

import type { RuntimeConfig, Service } from '@xihan-ui/core'
import type { ToastSchema } from '@xihan-ui/headless'
import type { Ref } from 'vue'
import { createRuntimeConfig } from '@xihan-ui/core'
import { useOverlayExit } from '../../runtime/use-overlay-exit'

export interface ToastExitOptions {
  service: Service<ToastSchema>
  /** 还在台上：dismissing 与 unmounted 之外的状态。 */
  isOpen: () => boolean
  /** 卡片根节点，退场动画从它上面探测。 */
  rootRef: Ref<HTMLElement | null>
}

/**
 * 轻提示与通知卡片跑同一台 toast 机器：进入 dismissing 之后，机器等这里交给它的 Presence
 * 把根节点上真实的退场动画播完再转 unmounted。服务端没有 DOM，不接闸门，机器下一拍自行收起。
 */
export function useToastExit(options: ToastExitOptions): void {
  const { service } = options
  let config: RuntimeConfig | null = null
  if (typeof document !== 'undefined')
    config = createRuntimeConfig({ scope: service.scope })

  useOverlayExit({
    config,
    isOpen: options.isOpen,
    contentRef: options.rootRef,
    onPresence: presence => service.refs.set('presence', presence),
  })
}
