import type { Cleanup } from '@xihan-ui/core'
import type { PresenceHandle } from './index'

/** 逗号分隔的时长串里取最长的一段，单位统一成毫秒。 */
function longestMs(value: string): number {
  let max = 0
  for (const raw of value.split(',')) {
    const text = raw.trim()
    const num = Number.parseFloat(text)
    if (Number.isNaN(num))
      continue
    max = Math.max(max, text.endsWith('ms') ? num : num * 1000)
  }
  return max
}

/** 兜底票的时长：算出来的时长加延迟，再留一点余量给合成器。 */
function exitTimeoutMs(style: CSSStyleDeclaration): number {
  const total = longestMs(style.animationDuration) + longestMs(style.animationDelay)
  return Math.max(total, 0) + 200
}

// 把一个 DOM 节点的 CSS 退场动画接到 presence 的退出租约上：
// 关闭时读 animationName，若有退场动画则申领租约，动画结束后归还。
export function attachCssExit(
  node: HTMLElement,
  presence: PresenceHandle,
  opts: { win?: Window } = {},
): Cleanup {
  const win = opts.win ?? node.ownerDocument.defaultView ?? window

  return presence.onBeforeExit(() => {
    const style = win.getComputedStyle(node)
    const name = style.animationName
    if (!name || name === 'none')
      return

    // 不生成盒子的元素不播动画，animationend 永远不会来。而 animationName 照常算得出，
    // 光看它就申领租约会把 presence 永久钉在退场态——收起态被皮肤 display:none 的组件
    // 正好走这条路，遮罩会一直盖在页面上。
    if (style.display === 'none' || style.contentVisibility === 'hidden')
      return

    // 动画也可能被作者中途换掉或从没触发，届时 animationend 同样不来。
    // 按算出来的时长给一张兜底票，过期即归还——租约不能没有回收路径。
    const lease = presence.claimExit('css-animation', exitTimeoutMs(style))
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
