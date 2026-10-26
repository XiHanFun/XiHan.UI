/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 浮层组件给 Portal 壳接视觉桥的那一步：逻辑来源当场登记，视觉投影等浮层按需块。
//
// 视觉桥住在浮层按需块里（见 overlay-kit），第一次打开时可能还没到。来源登记不能跟着等：
// 搬进壳的控件一挂上就沿逻辑祖先链找所在位置的配置与语言包，晚一拍登记就找到落点那边的缺省，
// 而且挂上之后不会再找第二次。登记只是一张 WeakMap，当场写；抄视觉轴的桥到了再建，
// 到了之后由桥自己再登记同一个来源（同一对映射，撤销时互不影响）。

import type { Cleanup } from '../types'
import type { PortalVisualBridge, PortalVisualBridgeOptions } from './portal-visual-bridge'
import { whenOverlayKit } from './overlay-kit'
import { bindPortalSource } from './portal-source'

/**
 * 给 Portal 壳接上来源：逻辑来源当场登记，视觉桥已经到了当场建、没到等它到了再建。
 * 返回的清理撤掉还在等的那一次，释放桥并撤销登记；按需块已经到了时与直接建桥完全一致。
 */
export function connectPortalVisualBridge(options: PortalVisualBridgeOptions): Cleanup {
  const unbindSource = bindPortalSource(options.shell, options.source)
  let bridge: PortalVisualBridge | null = null
  let disposed = false
  let stopWaiting: Cleanup
  try {
    stopWaiting = whenOverlayKit((kit) => {
      if (!disposed)
        bridge = kit.createPortalVisualBridge(options)
    })
  }
  catch (error) {
    unbindSource()
    throw error
  }
  return () => {
    if (disposed)
      return
    disposed = true
    stopWaiting()
    // 桥自己撤销登记时先撤；这里再撤一次是给桥还没建出来的那种情形，映射已不在时是空操作
    bridge?.dispose()
    unbindSource()
  }
}
