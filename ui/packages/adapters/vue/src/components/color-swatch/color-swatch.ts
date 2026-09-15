/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 color swatch 相关实现。

import type { Size } from '@xihan-ui/core'
import type { ColorSwatchProps } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { connectColorSwatch } from '@xihan-ui/headless'
import { computed, defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { vueNormalize } from '../../runtime/normalize-props'

/**
 * 颜色色块：把一个颜色绘制为一小块供人查看，不接受交互。
 *
 * 只有 root 一个部件，颜色经家族配方铺在棋盘格上；需要选择颜色请使用 XhColorSwatchPicker。
 */
export const XhColorSwatch = defineComponent({
  name: 'XhColorSwatch',
  props: {
    /** 要展示的颜色串：#rgb / #rrggbb(aa) / rgb() / hsl()，不识别颜色关键字。 */
    value: { type: String },
    size: String as PropType<Size>,
    /** 读屏朗读该颜色的方式，例如「品牌红」；未提供时朗读颜色串。 */
    label: { type: String },
  },
  setup(props) {
    // withXhConfig 只能在 setup 期调，连接层在渲染期读这份代理
    const configured = withXhConfig('color-swatch', props)
    const api = computed(() => connectColorSwatch(configured as ColorSwatchProps, vueNormalize))
    return () => h('span', api.value.getRootProps() as Record<string, unknown>)
  },
})
