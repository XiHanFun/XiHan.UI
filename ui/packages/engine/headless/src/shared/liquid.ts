/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 液态部件的接入：连接层投影了 data-xh-liquid 的部件，由它的状态机在启动时挂进液态面。
//
// 液态面按材质轴生效：data-material 不是 liquid 时它什么都不做，部件保持原材质；是 liquid 时
// 部件按下层换色调、亮边随指针、Chromium 下边缘折射。挂与撤都在这里，组件的状态机只写一行效应。

import type { Scope } from '@xihan-ui/core'
import { trackLiquidSurface } from '@xihan-ui/core/visual-environment'

/**
 * 等这一帧渲染落定后按部件 id 取节点，挂进液态面；返回的清理函数在状态机停止时撤出。
 * 取不到节点（无 DOM 的纯逻辑测试、服务端）时什么都不挂。
 */
export function trackLiquidPart(scope: Scope, flush: (fn: () => void) => void, component: string, part: string): () => void {
  let disposed = false
  let stop: (() => void) | undefined
  flush(() => {
    if (disposed)
      return
    const el = scope.getById<HTMLElement>(scope.partId(component, part))
    if (el)
      stop = trackLiquidSurface(el)
  })
  return () => {
    disposed = true
    stop?.()
  }
}
