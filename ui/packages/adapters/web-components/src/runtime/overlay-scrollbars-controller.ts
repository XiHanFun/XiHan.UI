/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 浮层里的自绘滚动条：与 ScrollbarsController 同形（wire / dispose），实现第一次要用时才加载。
//
// 浮层关着的时候条子用不上，不进首屏；消费方的打包器把 scrollbars-controller 切成按需块。浮层第一次呈现时
// 开始取（文档上第一次有交互时就已在后台预取），到了排一轮更新，下一轮 wire 建出真正的控制器并接上。
// 到之前滚动层照旧是原生细条：皮肤只在条子接上、给滚动层打上 data-xh-scrollbar 之后才藏原生条。
//
// 页面上常显的滚动面（列表框、穿梭框）条子首屏就要在，照旧直接用 ScrollbarsController。

import type { ReactiveControllerHost } from '../reactive'
import type { ScrollbarsController, ScrollbarsControllerOptions } from './scrollbars-controller'
import { onFirstInteraction } from '@xihan-ui/core'

export type OverlayScrollbarsControllerOptions = ScrollbarsControllerOptions & {
  /** 浮层此刻是否呈现（展开中，或退场还没播完）：第一次为真时开始加载条子的实现。 */
  present: () => boolean
}

type ControllerModule = typeof import('./scrollbars-controller')

let loaded: ControllerModule | null = null
let loading: Promise<void> | null = null

/** 加载条子的实现，可以重复调用；失败不缓存，下一次重新取。 */
export function loadOverlayScrollbars(): Promise<void> {
  loading ??= import('./scrollbars-controller').then(
    (module) => {
      loaded = module
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

export class OverlayScrollbarsController {
  private impl: ScrollbarsController | null = null

  constructor(
    private readonly host: ReactiveControllerHost & HTMLElement,
    private readonly options: OverlayScrollbarsControllerOptions,
  ) {
    if (typeof document !== 'undefined' && !loaded)
      onFirstInteraction(document, prefetch)
  }

  /** 宿主在自己的 wire() 末尾调用：实现到了就转给它，还没到且浮层已呈现就去取，到了排一轮更新。 */
  wire(): void {
    if (!this.impl && loaded)
      this.impl = new loaded.ScrollbarsController(this.host, this.options)
    if (this.impl) {
      this.impl.wire()
      return
    }
    if (this.options.present())
      void loadOverlayScrollbars().then(() => this.host.requestUpdate())
  }

  /** 拆掉整套；实现还没建出来时没有可拆的。重连后再 wire 照常重建。 */
  dispose(): void {
    this.impl?.dispose()
  }
}
