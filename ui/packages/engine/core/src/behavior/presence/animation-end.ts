import type { Cleanup } from '../../kernel'
import type { ExitLease, PresenceHandle } from './index'

// 浏览器实际创建的有限 CSS 动画才持有退出租约；不根据声明时长猜测动画已经结束。
export function attachCssExit(
  node: HTMLElement,
  presence: PresenceHandle,
  opts: { win?: Window } = {},
): Cleanup {
  const win = opts.win ?? node.ownerDocument.defaultView
  if (!win)
    throw new Error('[xh] CSS 退出动画需要节点所属的 Window')

  let disposed = false
  let active: ExitLease | undefined
  const sample = (): void => {
    if (disposed)
      return
    const style = win.getComputedStyle(node)
    const name = style.animationName
    if (!name || name === 'none' || style.display === 'none' || style.contentVisibility === 'hidden')
      return
    if (typeof node.getAnimations !== 'function')
      throw new Error('[xh] CSS 退出动画要求宿主支持 Element.getAnimations')

    const names = new Set(name.split(',').map(value => value.trim()))
    const animations = node.getAnimations().filter((animation) => {
      if (!('animationName' in animation) || !names.has(String(animation.animationName)))
        return false
      const effect = animation.effect
      if (!effect)
        return false
      const timing = effect.getComputedTiming()
      // 无限装饰动画不阻塞关闭；已结束、被取消或没有有效时长的动画也不再持有租约。
      return Number.isFinite(timing.endTime)
        && Number(timing.endTime) > 0
        && animation.playState !== 'finished'
        && animation.playState !== 'idle'
    })
    if (!animations.length)
      return
    const lease = presence.claimExit('css-animation')
    active = lease
    if (lease.settled)
      return
    // finished 在正常结束时兑现、取消时拒绝；两种都代表该动画不再占用退出表面。
    // 绑定动画对象身份，重开后旧动画的迟到结果不会完成新一轮租约。
    void Promise.allSettled(animations.map(animation => animation.finished)).then(() => {
      win.queueMicrotask(() => {
        if (disposed || lease.settled || active !== lease)
          return
        active = undefined
        lease.done()
      })
    })
  }
  const off = presence.onBeforeExit(sample)
  // 退出过程中真实节点被替换时，新节点先领取自己的租约，再让旧节点撤销观察。
  if (!presence.open && presence.rendered)
    sample()

  return () => {
    if (disposed)
      return
    disposed = true
    off()
    const lease = active
    active = undefined
    // 宿主节点已经退出观察，等同于该表面的动画取消；卸载 Presence 会先结清租约。
    if (presence.open)
      lease?.cancel()
    else
      lease?.done()
  }
}
