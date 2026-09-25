/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 轻提示与通知卡片共用的退场闸门接线。
//
// 两者跑的是同一台 toast 机器：进入 dismissing 之后，机器等这里交给它的 Presence
// 把根节点上真实的退场动画播完再转 unmounted，退场多长由皮肤与动效令牌决定。

import type { Service } from '@xihan-ui/core'
import type { ToastSchema } from '@xihan-ui/headless'
import type { OverlayExit } from './overlay-exit'
import { createOverlayExit } from './overlay-exit'

export class ToastExitGate {
  private exit: OverlayExit | null = null

  constructor(private readonly service: () => Service<ToastSchema>) {}

  /** data-state 写进 DOM 之后调用：接上当前的根节点，并按是否还在台上驱动 Presence。 */
  sync(root: HTMLElement | null, open: boolean): void {
    if (!this.exit) {
      // 收起由机器转 unmounted 后的 hidden 表出，这里不另排更新
      this.exit = createOverlayExit({ open, onExitComplete: () => {} })
      this.service().refs.set('presence', this.exit.presence)
    }
    this.exit.track(root)
    this.exit.update(open)
  }

  /** 元素离场：结清租约，机器不再持有这份 Presence。重连时 sync 重建。 */
  dispose(): void {
    if (!this.exit)
      return
    this.exit.dispose()
    this.exit = null
    this.service().refs.set('presence', null)
  }
}
