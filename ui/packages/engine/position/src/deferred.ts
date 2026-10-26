/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 延迟定位引擎：与 createPositionEngine 同一个 PositionEnginePort，引擎本体（engine.ts）第一次 attach 时才 import()。
//
// 浮层关着的时候用不上定位，引擎不进首屏；消费方的打包器把 engine.ts 切成按需块。加载过一次之后
// 每次 attach 都是同步的，与直接用引擎本体没有区别。
//
// 第一次挂还要等 core 的浮层按需块：Portal 视觉桥在那一块里，壳上的环境（密度、方向、主题）就位之前
// 量出来的尺寸不作数，先量一遍再跳会让浮层在错的位置露一帧。两块在同一次交互时一起开始取，通常同时到。

import type { Anchor, PositionEnginePort, PositionOptions, PositionResult } from '@xihan-ui/core'
import { onFirstInteraction, overlayKit, prefetchOverlayKit, whenOverlayKit } from '@xihan-ui/core'

let engine: PositionEnginePort | null = null
let loading: Promise<PositionEnginePort> | null = null

/** 加载引擎本体，可以重复调用；失败不缓存，下一次 attach 重新取。 */
export function loadPositionEngine(): Promise<PositionEnginePort> {
  if (engine)
    return Promise.resolve(engine)
  loading ??= import('./engine').then(
    (module) => {
      engine = module.createPositionEngine()
      return engine
    },
    (error: unknown) => {
      loading = null
      throw error
    },
  )
  return loading
}

/** 预取不报错：真要 attach 时还会再取一次，到那时再报。 */
function prefetch(): void {
  loadPositionEngine().catch(() => {})
}

/**
 * 建一台延迟定位引擎。在浏览器里建时顺带登记预取：文档上第一次有交互就在后台取引擎本体与浮层按需块，
 * 真打开时多半已经到了。服务端建（没有 document）不登记。
 */
export function createDeferredPositionEngine(): PositionEnginePort {
  if (typeof document !== 'undefined' && !engine) {
    onFirstInteraction(document, prefetch)
    prefetchOverlayKit(document)
  }
  return {
    attach(anchor: Anchor, floating: HTMLElement, options: PositionOptions, onResult: (r: PositionResult) => void) {
      if (engine && overlayKit())
        return engine.attach(anchor, floating, options, onResult)
      let stop: (() => void) | undefined
      let waitingKit: (() => void) | undefined
      let cancelled = false
      loadPositionEngine().then(
        (ready) => {
          if (cancelled)
            return
          waitingKit = whenOverlayKit(() => {
            waitingKit = undefined
            // 等的这段时间浮层可能已经卸掉：不在文档里就不挂，调用方下一轮会按新节点重挂
            if (!cancelled && floating.isConnected)
              stop = ready.attach(anchor, floating, options, onResult)
          })
        },
        (error: unknown) => {
          if (cancelled)
            return
          queueMicrotask(() => {
            throw error
          })
        },
      )
      return () => {
        cancelled = true
        waitingKit?.()
        stop?.()
      }
    },
  }
}
