/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 密集展开（树族、侧导航内联子层）的接线：按 id 现取容器，接上子层的高度补间。

import type { DisclosureMotion, Scope, TrackDisclosureMotionOptions } from '@xihan-ui/core'
import { trackDisclosureMotion } from '@xihan-ui/core'

/**
 * 接上一个容器里子层的高度补间，返回控制柄。容器等宿主提交之后再取（React 的祖先 ref 晚于子组件附着），
 * 接上之前调用 hold 与 stop 也安全
 */
export function attachDisclosureMotion(
  scope: Scope,
  flush: (fn: () => void) => void,
  id: string,
  options: (container: HTMLElement) => TrackDisclosureMotionOptions,
): DisclosureMotion {
  let disposed = false
  let motion: DisclosureMotion | undefined
  flush(() => {
    scope.getWin().queueMicrotask(() => {
      const container = scope.getById(id)
      if (disposed || !container)
        return
      motion = trackDisclosureMotion(container, options(container))
    })
  })
  return {
    hold: () => motion?.hold(),
    stop: () => {
      disposed = true
      motion?.stop()
    },
  }
}
