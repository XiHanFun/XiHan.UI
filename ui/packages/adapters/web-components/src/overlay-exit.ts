// 退场闸门：把「几时真的收起浮层子树」从展开态挪到 presence 上。
//
// Light DOM 下元素无权增删作者的节点，所以这里被 presence 拉长的不是「节点存在的时间」
// 而是「可见的时间」——收起从跟着 open 走，改成跟着 presence 走。

import type { Cleanup, RuntimeConfig } from '@xihan-ui/core'
import type { PresenceHandle } from '@xihan-ui/core/presence'
import { attachCssExit, createPresence } from '@xihan-ui/core/presence'

export interface OverlayExit {
  /** 浮层子树此刻是否应当可见：展开时为真，退场动画播完之前也为真。 */
  readonly visible: boolean
  /** content 节点就位或更换时调用，把它的 CSS 退场动画接到退出租约上。 */
  track: (node: HTMLElement | null) => void
  /** data-state 写进 DOM 之后调用。 */
  update: (open: boolean) => void
  /** 元素离场：立即结清，visible 归 false。幂等。 */
  dispose: () => void
}

export interface OverlayExitOptions {
  config: RuntimeConfig
  open: boolean
  /** 退场结束时回调，宿主据此排一次更新，把收起真正落到 display 上。 */
  onExitComplete: () => void
}

export function createOverlayExit(options: OverlayExitOptions): OverlayExit {
  let disposed = false
  let node: HTMLElement | null = null
  let detach: Cleanup | undefined

  const presence: PresenceHandle = createPresence({
    config: options.config,
    open: options.open,
    onRenderedChange: (rendered) => {
      if (!rendered && !disposed)
        options.onExitComplete()
    },
  })

  return {
    get visible() {
      return !disposed && presence.rendered
    },
    track(next) {
      if (disposed || next === node)
        return
      node = next
      detach?.()
      detach = next ? attachCssExit(next, presence) : undefined
    },
    update(open) {
      if (!disposed)
        presence.update(open)
    },
    dispose() {
      if (disposed)
        return
      disposed = true
      detach?.()
      detach = undefined
      node = null
      presence.dispose()
    },
  }
}
