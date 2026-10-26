/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 退场闸门：把「几时真的收起浮层子树」从展开态挪到 presence 上。
//
// Light DOM 下元素无权增删作者的节点，所以这里被 presence 拉长的不是「节点存在的时间」
// 而是「可见的时间」——收起从跟着 open 走，改成跟着 presence 走。

import type { Cleanup } from '@xihan-ui/core'
import type { PresenceHandle } from '@xihan-ui/core/presence'
import { overlayKit, whenOverlayKit } from '@xihan-ui/core'
import { attachCssExit, createPresence } from '@xihan-ui/core/presence'

export interface OverlayExit {
  /** 行为资源与视觉退场共享的同一份租约。 */
  readonly presence: PresenceHandle
  /** 浮层子树当前是否应当可见：展开时为真，退场动画播完之前也为真；等浮层按需块的那段时间为假。 */
  readonly visible: boolean
  /** content 节点就位或更换时调用，把它的 CSS 退场动画接到退出租约上。 */
  track: (...nodes: Array<HTMLElement | null>) => void
  /** data-state 写进 DOM 之后调用。 */
  update: (open: boolean) => void
  /** 元素离场：立即结清，visible 归 false。幂等。 */
  dispose: () => void
}

export interface OverlayExitOptions {
  open: boolean
  /** 退场结束时回调，宿主据此排一次更新，把收起真正落到 display 上。 */
  onExitComplete: () => void
  /**
   * 展开后等 core 的浮层按需块到了才露出内容，到了调这个回调，宿主据此排一次更新。
   * 焦点陷阱、滚动锁与背景失活都在那一块里，不靠落位藏面板的浮层（对话框、抽屉、图片查看器、命令面板）
   * 第一次打开时若按需块还没到，露出来的那一下焦点与滚动都还没被接管；靠定位的浮层落位前本就藏着，不用给。
   * 只管建闸门之后的展开：建的时候就开着的照常露出，与已有标记对齐。
   */
  onOverlayKitReady?: () => void
}

export function createOverlayExit(options: OverlayExitOptions): OverlayExit {
  let disposed = false
  const tracked = new Map<HTMLElement, Cleanup>()
  // 等浮层按需块：建的时候就开着的不等，关过一次之后按常规等
  let kitExempt = options.open
  let waitingKit: Cleanup | null = null

  const presence: PresenceHandle = createPresence({
    open: options.open,
    onRenderedChange: (rendered) => {
      if (!rendered && !disposed)
        options.onExitComplete()
    },
  })

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
    update(open) {
      if (disposed)
        return
      if (!open) {
        kitExempt = false
      }
      else if (options.onOverlayKitReady && !kitExempt && !waitingKit && !overlayKit()) {
        const ready = options.onOverlayKitReady
        waitingKit = whenOverlayKit(() => {
          waitingKit = null
          if (!disposed)
            ready()
        })
      }
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
