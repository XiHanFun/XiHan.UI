/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 浮层自绘滚动条的按需块：useOverlayScrollbars 第一次要用时 import() 这里。
//
// 组合式只能在 setup 里同步调，晚到的实现没法再补进宿主的 setup，于是包成一个组件：
// 它在自己的 setup 里调 useScrollbars，渲染出来的就是那几根条子（片段，不多套一层元素），
// DOM 与宿主直接调 useScrollbars 时一致。

import type { PropType } from 'vue'
import type { ScrollbarsOptions } from './use-scrollbars'
import { defineComponent } from 'vue'
import { useScrollbars } from './use-scrollbars'

export const XhOverlayScrollbars = /* @__PURE__ */ defineComponent({
  name: 'XhOverlayScrollbars',
  props: {
    /** 宿主交给 useOverlayScrollbars 的选项，原样转给 useScrollbars；滚动层与 props 本来就是取值器，逐帧现读。 */
    options: { type: Object as PropType<ScrollbarsOptions>, required: true },
  },
  setup(props, { expose }) {
    const bars = useScrollbars(props.options)
    expose({ measure: bars.measure })
    return () => bars.render()
  },
})
