/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 标准结构的虚拟化部件：开了 virtual 才异步加载这个模块，没开的组件不为 Virtualizer 的内核付体积。
//
// 视口自己跑那台 Virtualizer：条数、预估高度与滚动面取宿主留的空位，上下文交给里面的内容层与条目外壳，
// 实例登记进空位，宿主据此把桥交给自己的机器、按窗口铺条目。

import type { VirtualizerSchema } from '@xihan-ui/headless'
import { defineComponent, h, onBeforeUnmount } from 'vue'
import { provideVirtualizer } from './context'
import { useStructureVirtual } from './structure-slot'
import { useVirtualizer } from './use-virtualizer'
import { XhVirtualizerContent, XhVirtualizerItem, XhVirtualizerViewport } from './virtualizer'

export const StructureVirtualViewport = defineComponent({
  name: 'StructureVirtualViewport',
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    const slot = useStructureVirtual()
    if (!slot)
      throw new Error('[xh] StructureVirtualViewport 只在开了 virtual 的标准结构里使用')
    const view = useVirtualizer({
      get count() { return slot.count() },
      get estimateSize() { return slot.estimateSize() },
      scrollContainer: slot.scrollContainer,
      estimateFromMeasured: slot.estimateFromMeasured,
      // 不占 Tab 位：键盘落在宿主自己的条目上，视口只是滚动面（或根本不滚）
      viewportTabIndex: -1,
    } as VirtualizerSchema['props'])
    provideVirtualizer(view)
    slot.view.value = view
    onBeforeUnmount(() => {
      if (slot.view.value === view)
        slot.view.value = null
    })
    return () => h(XhVirtualizerViewport, attrs, slots)
  },
})

export { XhVirtualizerContent as StructureVirtualContent, XhVirtualizerItem as StructureVirtualItem }
