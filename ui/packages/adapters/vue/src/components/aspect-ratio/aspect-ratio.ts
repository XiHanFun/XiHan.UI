/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 aspect ratio 相关实现。

import type { AspectRatioProps } from '@xihan-ui/headless'
import type { PropsOf } from '../../runtime/props-of'
import { connectAspectRatio } from '@xihan-ui/headless'
import { computed, defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { vueNormalize } from '../../runtime/normalize-props'

/**
 * 按 ratio（宽 ÷ 高）定出一个盒子，默认插槽里的内容铺满它。
 *
 * 盒宽随容器，高由比例算出；内容不撑高盒子，图片与视频按 cover 裁切填满。
 * 根上不写 role：放进来的是图片、视频还是地图，语义由内容自己给。
 */
export const XhAspectRatio = defineComponent({
  name: 'XhAspectRatio',
  // 缺省值由 connect 给出（1，非正有限数也按 1），这里不写 default
  props: {
    ratio: { type: Number },
  },
  setup(props, { slots }) {
    // 没有状态机，全局配置（组件级缺省）在这里并进来
    const configured = withXhConfig('aspect-ratio', props)
    const api = computed(() => connectAspectRatio({
      ratio: configured.ratio,
    } satisfies AspectRatioProps, vueNormalize))
    return () => h('div', api.value.getRootProps(), slots.default?.())
  },
})

// 各组件接受的 props，与 React 同名
export type XhAspectRatioProps = PropsOf<typeof XhAspectRatio>
