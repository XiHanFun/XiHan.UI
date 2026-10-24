/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 选择器标准结构的虚拟化部件：开了 virtual 才异步加载这个模块，没开的选择器不为 Virtualizer 的内核付体积。
//
// 视口自己跑那台 Virtualizer：条数跟着选择器的 collection，上下文交给里面的内容层与条目外壳，
// 实例登记进选择器的虚拟化空位，根组件据此把桥交给选择器的机器、按窗口铺条目。

import type { VirtualizerSchema } from '@xihan-ui/headless'
import { defineComponent, h, onBeforeUnmount } from 'vue'
import { provideVirtualizer } from '../virtualizer/context'
import { useVirtualizer } from '../virtualizer/use-virtualizer'
import { XhVirtualizerContent, XhVirtualizerItem, XhVirtualizerViewport } from '../virtualizer/virtualizer'
import { useSelectContext } from './context'

export const SelectVirtualViewport = defineComponent({
  name: 'SelectVirtualViewport',
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    const select = useSelectContext()
    const slot = select.virtual
    if (!slot)
      throw new Error('[xh] SelectVirtualViewport 只在开了 virtual 的选择器标准结构里使用')
    const view = useVirtualizer({
      get count() { return slot.count() },
      get estimateSize() { return slot.estimateSize() },
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

export { XhVirtualizerContent as SelectVirtualContent, XhVirtualizerItem as SelectVirtualItem }
