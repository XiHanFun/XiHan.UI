/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 watermark 相关实现。

import type { WatermarkImageSize, WatermarkProps } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { connectWatermark } from '@xihan-ui/headless'
import { computed, defineComponent, h } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { provideWatermark, useWatermarkContext } from './context'

/**
 * 水印覆盖的区域。图样由 connect 计算为一张 SVG，写为根上的内联 CSS 变量，
 * 由皮肤铺为一层覆盖在内容之上的伪元素：印记因此不进入无障碍树、不接收点击、也不可选中。
 */
export const XhWatermarkRoot = defineComponent({
  name: 'XhWatermarkRoot',
  // 有 connect 兜底的 prop：普通类型省略 default，Boolean 显式保留 undefined
  props: {
    text: { type: [String, Array] as PropType<string | string[]> },
    rotate: { type: Number },
    gap: { type: Number },
    fontSize: { type: Number },
    opacity: { type: Number },
    fontFamily: { type: String },
    image: { type: String },
    imageSize: { type: Object as PropType<WatermarkImageSize> },
  },
  setup(props, { slots }) {
    const api = computed(() => connectWatermark(props as WatermarkProps, vueNormalize))
    provideWatermark({ api })
    return () => h('div', api.value.getRootProps() as Record<string, unknown>, slots.default?.())
  },
})

/** 被覆盖的内容。 */
export const XhWatermarkContent = defineComponent({
  name: 'XhWatermarkContent',
  setup(_, { slots }) {
    const ctx = useWatermarkContext()
    return () => h('div', ctx.api.value.getContentProps() as Record<string, unknown>, slots.default?.())
  },
})
