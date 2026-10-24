/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 标准结构的虚拟化部件：开了 virtual 才动态加载这个模块，没开的组件不为 Virtualizer 的内核付体积。
//
// 视口自己跑那台 Virtualizer：条数、预估高度与滚动面取宿主留的空位，上下文交给里面的内容层与条目外壳，
// 桥与窗口回报给宿主根组件，宿主据此把桥交给自己的机器、按窗口铺条目。

import type { ReactNode } from 'react'
import type { XhVirtualizerViewportProps } from './virtualizer'
import { useIsomorphicLayoutEffect } from '../../runtime/layout-effect'
import { VirtualizerProvider } from './context'
import { useStructureVirtual } from './structure-slot'
import { useVirtualizer } from './use-virtualizer'
import { XhVirtualizerContent, XhVirtualizerItem, XhVirtualizerViewport } from './virtualizer'

export function StructureVirtualViewport({ children, ...rest }: XhVirtualizerViewportProps): ReactNode {
  const slot = useStructureVirtual()
  if (!slot)
    throw new Error('[xh] StructureVirtualViewport 只在开了 virtual 的标准结构里使用')
  const view = useVirtualizer({
    count: slot.count,
    estimateSize: slot.estimateSize,
    scrollContainer: slot.scrollContainer,
    estimateFromMeasured: slot.estimateFromMeasured,
    // 不占 Tab 位：键盘落在宿主自己的条目上，视口只是滚动面（或根本不滚）
    viewportTabIndex: -1,
  })
  const { publish } = slot
  const bridge = view.api.collectionVirtualizer
  const items = view.api.virtualItems
  // 桥身份稳定，窗口只在区间变化时换新数组：只在这两样变了时回报，宿主的重渲不会反过来再触发一轮
  useIsomorphicLayoutEffect(() => publish({ bridge, items }), [publish, bridge, items])
  useIsomorphicLayoutEffect(() => () => publish(null), [publish])
  return (
    <VirtualizerProvider value={view}>
      <XhVirtualizerViewport {...rest}>{children}</XhVirtualizerViewport>
    </VirtualizerProvider>
  )
}

export { XhVirtualizerContent as StructureVirtualContent, XhVirtualizerItem as StructureVirtualItem }
