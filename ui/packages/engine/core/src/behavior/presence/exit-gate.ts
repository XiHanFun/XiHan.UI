/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 退场闸门：把「几时真的收起内容」从展开态挪到 presence 上。
//
// 连接层给内容区打的 hidden 跟着展开态走，收起那一帧节点就不生成盒子，退场动画一帧都播不出来。
// 闸门让可见与否跟着 presence 走：展开时可见、退场动画播完之前也可见，播完才真收。
// 被拉长的是「可见的时间」而不是「节点存在的时间」。三个适配器只管几时调 track / update。

import type { Cleanup } from '../../kernel'
import type { PresenceHandle } from './index'
import { overlayKit, whenOverlayKit } from '../../kernel/structure/overlay-kit'
import { attachCssExit } from './animation-end'
import { createPresence } from './index'

export interface ExitGateOptions {
  /** 建闸门时的展开态。建的时候就开着的不等浮层按需块，与服务端直出、已有标记对齐。 */
  open: boolean
  /** 退场播完（所有退出租约归还）时回调，此刻 visible 已归 false，宿主据此把收起真正落到 display 上。 */
  onExitComplete: () => void
  /**
   * 给了就在展开时等 core 的浮层按需块，到了带上此刻的 visible 调它（等的途中收起了就是 false）。
   * 焦点陷阱、滚动锁与背景失活都在那一块里：不靠落位藏面板的浮层（对话框、抽屉、图片查看器、命令面板）
   * 第一次打开时若按需块还没到，露出来的那一下焦点与滚动都还没被接管；靠定位的浮层落位前本就藏着，不用给。
   */
  onOverlayKitReady?: (visible: boolean) => void
}

export interface ExitGate {
  /** 行为资源与视觉退场共享的同一份租约。 */
  readonly presence: PresenceHandle
  /** 内容此刻是否应当可见：展开时为真，退场动画播完之前也为真；等浮层按需块的那段时间为假。 */
  readonly visible: boolean
  /** 参与退场的节点就位或更换时调用：新来的接上 CSS 退场探测，走了的撤掉。 */
  track: (...nodes: Array<HTMLElement | null>) => void
  /** 只做按需块的判定：收起时撤掉建闸门时的豁免，展开且按需块没到时开始等。要在展开那一帧渲染之前藏住时先调它。 */
  hold: (open: boolean) => void
  /** data-state 写进 DOM 之后调用：先做按需块的判定，再驱动 presence。 */
  update: (open: boolean) => void
  /** 立即结清，visible 归 false。幂等。 */
  dispose: () => void
}

export function createExitGate(options: ExitGateOptions): ExitGate {
  let disposed = false
  const tracked = new Map<HTMLElement, Cleanup>()
  // 建的时候就开着的不等按需块，收起过一次之后按常规等
  let kitExempt = options.open
  let waitingKit: Cleanup | null = null

  const presence = createPresence({
    open: options.open,
    onRenderedChange: (rendered) => {
      if (!rendered && !disposed)
        options.onExitComplete()
    },
  })

  const hold = (open: boolean): void => {
    if (disposed)
      return
    if (!open) {
      kitExempt = false
      return
    }
    const ready = options.onOverlayKitReady
    if (!ready || kitExempt || waitingKit || overlayKit())
      return
    waitingKit = whenOverlayKit(() => {
      waitingKit = null
      if (!disposed)
        ready(presence.rendered)
    })
  }

  return {
    presence,
    get visible() {
      return !disposed && presence.rendered && !waitingKit
    },
    track(...nodes) {
      if (disposed)
        return
      const next = new Set(nodes.filter((node): node is HTMLElement => node !== null))
      for (const node of next) {
        if (!tracked.has(node))
          tracked.set(node, attachCssExit(node, presence))
      }
      for (const [node, detach] of tracked) {
        if (!next.has(node)) {
          tracked.delete(node)
          detach()
        }
      }
    },
    hold,
    update(open) {
      if (disposed)
        return
      hold(open)
      presence.update(open)
    },
    dispose() {
      if (disposed)
        return
      disposed = true
      waitingKit?.()
      waitingKit = null
      presence.dispose()
      for (const detach of tracked.values()) detach()
      tracked.clear()
    },
  }
}
