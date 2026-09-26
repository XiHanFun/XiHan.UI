/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 常挂部件的进退场：部件不卸载、收起时靠 hidden 藏掉，藏之前让它的退场动画播完。
//
// 回到底部、回到顶部这类按钮反复建删会让进场动画每次从头播，所以一直挂着、用 hidden 收起。
// 可 hidden 一落下就是 display: none，退场动画一帧都播不出来。这里在 open 翻假时先不藏，
// 等部件身上浏览器实际起播的 CSS 退场动画播完再报「可以藏起」；没有可等的动画即刻报。

import type { Dep, Scope } from '@xihan-ui/core'
import { attachCssExit, createPresence } from '@xihan-ui/core/presence'

export interface PartPresenceOptions {
  scope: Scope
  /** 部件节点的 id：退场时按它现取节点。宿主没渲染这个部件、或没有 DOM 时，退场即刻完成。 */
  id: string
  /** 该不该露出来。 */
  open: () => boolean
  track: (deps: Dep[], fn: () => void) => void
  flush: (fn: () => void) => void
  /** 节点该不该留着（没有 hidden）：open 翻真立即为真；翻假后等退场动画播完才为假。 */
  onRenderedChange: (rendered: boolean) => void
}

/**
 * 接上一个常挂部件的进退场，返回释放函数。
 *
 * 退场动画要在收起那一帧的样式提交之后才起播，所以 open 翻假后等宿主提交一次，再从节点上探测动画。
 */
export function trackPartPresence(options: PartPresenceOptions): () => void {
  const { scope, id, open, track, flush, onRenderedChange } = options
  const presence = createPresence({ open: open(), onRenderedChange })
  let detach: (() => void) | undefined

  track([open], () => {
    detach?.()
    detach = undefined
    if (open()) {
      presence.update(true)
      return
    }
    flush(() => {
      if (open())
        return
      const node = scope.getById(id)
      detach = node ? attachCssExit(node, presence) : undefined
      presence.update(false)
    })
  })

  return () => {
    detach?.()
    presence.dispose()
  }
}

/**
 * 等节点上某个属性正在播的 CSS 过渡播完（或被取消）再回调；没有在播的即刻回调。返回撤销函数。
 *
 * 过渡在样式提交之后才起播，调用方在宿主提交之后再调；getAnimations 会先把挂起的样式算完。
 * 按浏览器实际创建的过渡对象等，不按声明的时长猜：作者改了时长槽照样对得上。
 */
export function waitForTransition(node: Element | null, property: string, done: () => void): () => void {
  let cancelled = false
  const transitions = node && typeof node.getAnimations === 'function'
    ? node.getAnimations().filter(animation => 'transitionProperty' in animation && animation.transitionProperty === property)
    : []
  if (!transitions.length) {
    done()
    return () => {}
  }
  void Promise.allSettled(transitions.map(transition => transition.finished)).then(() => {
    if (!cancelled)
      done()
  })
  return () => {
    cancelled = true
  }
}

/**
 * 等节点及其子孙上正在播的有限 CSS 动画都播完（或被取消）再回调；没有在播的即刻回调。返回撤销函数。
 *
 * 给「一组条目各自播退场、整组播完才藏起」用：条目各有各的错开延迟，按浏览器实际创建的动画对象等。
 * 调用方在收起那一帧的样式提交之后再调。
 */
export function waitForSubtreeAnimations(node: Element | null, done: () => void): () => void {
  let cancelled = false
  const animations = node && typeof node.getAnimations === 'function'
    ? node.getAnimations({ subtree: true }).filter((animation) => {
        if (!('animationName' in animation) || !animation.effect)
          return false
        const end = animation.effect.getComputedTiming().endTime
        return Number.isFinite(end) && Number(end) > 0 && animation.playState !== 'finished'
      })
    : []
  if (!animations.length) {
    done()
    return () => {}
  }
  void Promise.allSettled(animations.map(animation => animation.finished)).then(() => {
    if (!cancelled)
      done()
  })
  return () => {
    cancelled = true
  }
}
