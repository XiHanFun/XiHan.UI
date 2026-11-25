/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 aspect ratio 相关实现。

import type { AspectRatioProps } from '@xihan-ui/headless'
import { aspectRatioAnatomy, aspectRatioMeta, connectAspectRatio } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

/**
 * ratio 属性按 CSS 的 `<ratio>` 读：`16/9`、`16 / 9` 或单个数 `1.5`，读成宽 ÷ 高的一个数。
 * HTML 里写不出表达式，比例最自然的写法就是这一种，与皮肤落到的 aspect-ratio 属性同一个语法。
 * 属性缺席或写成空串翻成 undefined，缺省值由 connect 决定；读不出数的（多个斜杠、非数字）是 NaN，
 * 除以 0 是无穷，两者都交给 connect 按缺省处理。
 */
const RATIO_CONVERTER = {
  fromAttribute: (value: string | null): number | undefined => {
    if (value == null || value.trim() === '')
      return undefined
    const terms = value.split('/')
    if (terms.length === 1)
      return Number(value)
    if (terms.length !== 2)
      return Number.NaN
    return Number(terms[0]) / Number(terms[1])
  },
}

/**
 * `<xh-aspect-ratio>`：Light-DOM 行为宿主，无状态机，按 ratio 给作者写的 root 定出宽高比。
 *
 * 作者写一个块级容器作为 root，把图片、视频、地图等内容直接放进去：盒宽随容器，
 * 高由比例算出，root 的直接子元素铺满整个盒子，图片与视频按 cover 裁切填满。
 * 内容不撑高盒子，超出的部分被裁掉。
 *
 * 宿主本身不占一层盒子，root 直接参与外层的弹性或网格排布。
 * 根上不写 role：内容是什么，语义由内容自己给。
 *
 * @customElement xh-aspect-ratio
 * @attr {string} ratio - 宽高比，写法同 CSS 的 `<ratio>`：`16/9`、`16 / 9` 或单个数 `1.5`；缺省 1，算不出大于 0 的有限数时按缺省处理。经 property 设置时直接给数（`el.ratio = 16 / 9`）
 * @csspart root - 定出宽高比的盒子，直接子元素铺满它；比例写在内联私有槽 --xh-_aspect-ratio 上
 */
export class XhAspectRatioElement extends XhElement {
  static override partContract = { anatomy: aspectRatioAnatomy, meta: aspectRatioMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开
  static override properties = {
    ratio: { converter: RATIO_CONVERTER },
  }

  /** 宽高比：宽 ÷ 高，缺省 1。 */
  declare ratio?: number

  protected wire(): void {
    const root = this.getPart('root')
    if (!root)
      return

    // 读响应式 property，不回读 DOM 特性
    // 没有状态机，全局配置（组件级缺省）在这里并进来
    const api = connectAspectRatio(this.configured('aspect-ratio', {
      ratio: this.ratio,
    } satisfies AspectRatioProps), wcNormalize)

    this.spreader.spread(root, api.getRootProps())
  }
}
