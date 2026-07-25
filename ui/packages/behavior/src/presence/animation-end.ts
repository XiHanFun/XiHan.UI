import type { Cleanup } from '@xihan-ui/core'
import type { PresenceHandle } from './index'

// 把一个 DOM 节点的 CSS 退场动画接到 presence 的退出租约上：
// 关闭时读 animationName，若有退场动画则申领租约，动画结束后归还。
export function attachCssExit(
  node: HTMLElement,
  presence: PresenceHandle,
  opts: { win?: Window } = {},
): Cleanup {
  const win = opts.win ?? node.ownerDocument.defaultView ?? window

  return presence.onBeforeExit(() => {
    const name = win.getComputedStyle(node).animationName
    if (!name || name === 'none')
      return

    const lease = presence.claimExit('css-animation')
    function cleanup(): void {
      node.removeEventListener('animationend', finish)
      node.removeEventListener('animationcancel', finish)
    }
    function finish(e: AnimationEvent): void {
      // 只吃自己的动画，不吃子元素冒泡上来的
      if (e.target !== node)
        return
      cleanup()
      lease.done()
    }
    node.addEventListener('animationend', finish)
    node.addEventListener('animationcancel', finish)
  })
}
