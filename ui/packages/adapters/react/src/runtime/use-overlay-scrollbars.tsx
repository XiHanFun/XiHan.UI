/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 浮层里的自绘滚动条：与 useScrollbars 同形，实现（滚动条的状态机、连接层与节点）第一次要用时才加载。
//
// 浮层关着的时候条子用不上，不进首屏；消费方的打包器把 scrollbar-bars 切成按需块。浮层第一次呈现时
// 开始取（文档上第一次有交互时就已在后台预取），到之前滚动层照旧是原生细条：皮肤只在条子接上、
// 给滚动层打上 data-xh-scrollbar 之后才藏原生条，所以这段时间不会两样都没有。加载过一次之后
// 整页的浮层都同步渲染条子。服务端与水合那一帧都不渲条子，两侧标记一致。
//
// 页面上常显的滚动面（列表框、穿梭框）条子首屏就要在，照旧直接调 useScrollbars。

import type { BarRegistry } from './scrollbar-bars'
import type { ScrollbarsHandle, ScrollbarsOptions } from './use-scrollbars'
import { onFirstInteraction } from '@xihan-ui/core'
import { useEffect, useRef, useSyncExternalStore } from 'react'
import { useReactScope } from './react-id'

export interface OverlayScrollbarsOptions extends ScrollbarsOptions {
  /** 浮层此刻是否呈现（展开中，或退场还没播完）：第一次为真时开始加载条子的实现。 */
  present: () => boolean
}

type BarsModule = typeof import('./scrollbar-bars')

/** 条子的实现到了没有：整页共用一份，到了通知每个订阅的浮层重渲。 */
let bars: BarsModule | null = null
let loading: Promise<void> | null = null
const listeners = new Set<() => void>()

/** 加载条子的实现，可以重复调用；失败不缓存，下一次重新取。 */
export function loadOverlayScrollbars(): Promise<void> {
  loading ??= import('./scrollbar-bars').then(
    (module) => {
      bars = module
      for (const listener of [...listeners])
        listener()
    },
    (error: unknown) => {
      loading = null
      throw error
    },
  )
  return loading
}

/** 预取不报错：浮层呈现时还会再取一次，到那时再报。 */
function prefetch(): void {
  loadOverlayScrollbars().catch(() => {})
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => void listeners.delete(listener)
}

const loaded = (): BarsModule | null => bars
const serverLoaded = (): BarsModule | null => null

/** 给浮层里的滚动层配一套自绘滚动条；条子的实现在浮层第一次呈现时才加载。 */
export function useOverlayScrollbars(options: OverlayScrollbarsOptions): ScrollbarsHandle {
  const scope = useReactScope()
  const latest = useRef(options)
  latest.current = options
  const module = useSyncExternalStore(subscribe, loaded, serverLoaded)
  const registry = useRef<BarRegistry | null>(null)
  if (module)
    registry.current ??= module.createRegistry(scope, () => latest.current)

  // 每次提交后看一眼：浮层第一次呈现就开始取；还没呈现时只登记交互预取
  useEffect(() => {
    if (module)
      return
    if (latest.current.present())
      void loadOverlayScrollbars()
    else
      onFirstInteraction(document, prefetch)
  })

  return {
    render: () => (module && registry.current ? module.renderBars(registry.current) : []),
    measure: () => {
      if (module && registry.current)
        module.measureBars(registry.current)
    },
  }
}
