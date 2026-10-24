/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 选择器标准结构的虚拟化部件：开了 virtual 才动态加载这个模块，没开的选择器不为 Virtualizer 的内核付体积。
//
// 视口自己跑那台 Virtualizer：条数跟着选择器的 collection，上下文交给里面的内容层与条目外壳，
// 桥与窗口回报给根组件，根组件据此把桥交给选择器的机器、按窗口铺条目。

import type { ReactNode } from 'react'
import type { XhVirtualizerViewportProps } from '../virtualizer/virtualizer'
import { useIsomorphicLayoutEffect } from '../../runtime/layout-effect'
import { VirtualizerProvider } from '../virtualizer/context'
import { useVirtualizer } from '../virtualizer/use-virtualizer'
import { XhVirtualizerContent, XhVirtualizerItem, XhVirtualizerViewport } from '../virtualizer/virtualizer'
import { useSelectContext } from './context'

export function SelectVirtualViewport({ children, ...rest }: XhVirtualizerViewportProps): ReactNode {
  const select = useSelectContext()
  const slot = select.virtual
  if (!slot)
    throw new Error('[xh] SelectVirtualViewport 只在开了 virtual 的选择器标准结构里使用')
  const view = useVirtualizer({ count: slot.count, estimateSize: slot.estimateSize, viewportTabIndex: -1 })
  const { publish } = slot
  const bridge = view.api.collectionVirtualizer
  const items = view.api.virtualItems
  // 桥身份稳定，窗口只在区间变化时换新数组：只在这两样变了时回报，根组件的重渲不会反过来再触发一轮
  useIsomorphicLayoutEffect(() => publish({ bridge, items }), [publish, bridge, items])
  useIsomorphicLayoutEffect(() => () => publish(null), [publish])
  return (
    <VirtualizerProvider value={view}>
      <XhVirtualizerViewport {...rest}>{children}</XhVirtualizerViewport>
    </VirtualizerProvider>
  )
}

export { XhVirtualizerContent as SelectVirtualContent, XhVirtualizerItem as SelectVirtualItem }
