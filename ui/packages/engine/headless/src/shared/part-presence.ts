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
