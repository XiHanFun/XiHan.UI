/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 animation end 相关实现。

import type { EasingFunction } from '@xihan-ui/motion'
import type { Cleanup } from '../../kernel'
import type { ExitLease, PresenceHandle } from './index'
import { resolveEasing } from '@xihan-ui/motion'

/**
 * 进场关键帧起点透明度的私有槽。退场中途重新打开时写成退场此刻的透明度，
 * 进场从当前值接着淡入，不先跳回全透明；未写时关键帧按缺省 0 起步。
 */
const ENTER_FROM_OPACITY = '--xh-_enter-from-opacity'

/** 退场开始那一刻记下的量：重开时据此算出退场播到哪儿，不再读已被替换的动画对象。 */
interface ExitSample {
  at: number
  from: number
  to: number
  delay: number
  duration: number
  easing: EasingFunction
}

function parseTime(value: string | undefined): number {
  const text = (value ?? '').trim()
  if (text.endsWith('ms'))
    return Number.parseFloat(text)
  if (text.endsWith('s'))
    return Number.parseFloat(text) * 1000
  return Number.parseFloat(text) || 0
}

function pick(list: string | undefined, index: number): string {
  const items = (list ?? '').split(',')
  return items[index % items.length] ?? ''
}

/** 逗号分隔的 CSS 列表按顶层逗号拆开：cubic-bezier(…) 里的逗号不算。 */
function splitTopLevel(list: string | undefined = ''): string[] {
  const out: string[] = []
  let depth = 0
  let start = 0
  for (let i = 0; i < list.length; i++) {
    const ch = list[i]
    if (ch === '(') {
      depth++
    }
    else if (ch === ')') {
      depth--
    }
    else if (ch === ',' && depth === 0) {
      out.push(list.slice(start, i).trim())
      start = i + 1
    }
  }
  out.push(list.slice(start).trim())
  return out
}

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
  let exit: ExitSample | undefined

  // 取退场里持续最久的那一支作透明度的依据：同一节点叠几支动画时，它决定节点何时真正消失
  const record = (style: CSSStyleDeclaration, names: string[], animations: Animation[]): void => {
    let best = -1
    let bestEnd = -1
    names.forEach((_name, index) => {
      const end = parseTime(pick(style.animationDelay, index)) + parseTime(pick(style.animationDuration, index))
      if (end > bestEnd) {
        bestEnd = end
        best = index
      }
    })
    if (best < 0)
      return
    const effect = animations.find(animation => String((animation as CSSAnimation).animationName) === names[best])?.effect
    // 退场关键帧的终点透明度；读不到关键帧（宿主不支持 getKeyframes）时按淡出到全透明算
    const frames = effect && 'getKeyframes' in effect ? (effect as KeyframeEffect).getKeyframes() : []
    const last = frames.at(-1)?.opacity
    const easings = splitTopLevel(style.animationTimingFunction)
    exit = {
      at: win.performance.now(),
      from: Number.parseFloat(style.opacity),
      to: last == null ? 0 : Number.parseFloat(String(last)),
      delay: parseTime(pick(style.animationDelay, best)),
      duration: parseTime(pick(style.animationDuration, best)),
      easing: resolveEasing(easings[best % easings.length] || 'linear'),
    }
  }

  const sample = (): void => {
    if (disposed)
      return
    // 新一轮退场：上一轮打断时写下的起点作废，完整关闭后的下一次打开照常从 0 淡入
    node.style.removeProperty(ENTER_FROM_OPACITY)
    exit = undefined
    const style = win.getComputedStyle(node)
    const name = style.animationName
    if (!name || name === 'none' || style.display === 'none' || style.contentVisibility === 'hidden')
      return
    if (typeof node.getAnimations !== 'function')
      throw new Error('[xh] CSS 退出动画要求宿主支持 Element.getAnimations')

    const listed = name.split(',').map(value => value.trim())
    const names = new Set(listed)
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
    record(style, listed, animations)
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

  // 退场中途重开：按退场开始后流逝的时间与它的缓动算出此刻的透明度，交给进场关键帧作起点。
  // 此时宿主刚把 data-state 翻回 open，旧动画即将被样式重算替换，读它的当前时间会逼出一次重算，
  // 所以只用退场开始时记下的量推算
  const reenter = (): void => {
    const sampleAtExit = exit
    exit = undefined
    if (disposed || !sampleAtExit || !(sampleAtExit.from > 0))
      return
    const { at, from, to, delay, duration, easing } = sampleAtExit
    const elapsed = win.performance.now() - at - delay
    const progress = duration > 0 ? Math.min(1, Math.max(0, elapsed / duration)) : 1
    const opacity = from + (to - from) * easing(progress)
    node.style.setProperty(ENTER_FROM_OPACITY, String(Math.round(Math.min(1, Math.max(0, opacity)) * 1000) / 1000))
  }

  const off = presence.onBeforeExit(sample)
  const offReenter = presence.onReenter(reenter)
  // 退出过程中真实节点被替换时，新节点先领取自己的租约，再让旧节点撤销观察。
  if (!presence.open && presence.rendered)
    sample()

  return () => {
    if (disposed)
      return
    disposed = true
    off()
    offReenter()
    const lease = active
    active = undefined
    // 宿主节点已经退出观察，等同于该表面的动画取消；卸载 Presence 会先结清租约。
    if (presence.open)
      lease?.cancel()
    else
      lease?.done()
  }
}
