/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 接线前就已在场的部件：这一批元素的首轮接线跑完后，取消它们身上已经起播的 CSS 过渡。

const pending = new Set<Element>()
let scheduled = false

function isTransition(animation: Animation): boolean {
  // 按字段认：部件可能在 iframe 里，那边的 CSSTransition 与这边不是同一个构造器
  return 'transitionProperty' in animation
}

function settle(): void {
  scheduled = false
  const parts = [...pending]
  pending.clear()
  for (const el of parts) {
    if (!el.isConnected || typeof el.getAnimations !== 'function')
      continue
    for (const animation of el.getAnimations()) {
      if (isTransition(animation))
        animation.cancel()
    }
  }
}

/**
 * 登记这些部件，排在这一批元素各自的首轮更新之后统一处理：取消它们身上的 CSS 过渡，
 * 部件直接呈现接线后的样式。同一任务里连接的元素共用一次处理。
 */
export function settleTransitionsAfterWiring(parts: readonly Element[]): void {
  if (!parts.length)
    return
  for (const el of parts)
    pending.add(el)
  if (scheduled)
    return
  scheduled = true
  // 首轮更新在连接时放闸后的那一个微任务里跑；再隔一层微任务，落在这一批的首轮更新都跑完之后
  queueMicrotask(() => queueMicrotask(settle))
}
