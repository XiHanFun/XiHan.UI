/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 color swatch 相关实现。

import type { Size } from '@xihan-ui/core'
import type { ColorSwatchProps } from '@xihan-ui/headless'
import { colorSwatchAnatomy, colorSwatchMeta, connectColorSwatch } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }

/**
 * `<xh-color-swatch>`：颜色色块宿主，无状态机。
 *
 * 把一个颜色绘制为一小块供查看，不接受交互；颜色经家族配方铺在棋盘格上。
 * 需要选择颜色时使用 `<xh-color-swatch-picker>`。
 *
 * @customElement xh-color-swatch
 * @attr {string} value - 要展示的颜色串：#rgb / #rrggbb(aa) / rgb() / hsl()，不识别颜色关键字；无法解析时只绘制棋盘格并带 data-invalid
 * @attr {'sm'|'md'|'lg'} size - 尺寸：影响边长与棋盘格粒度
 * @attr {string} label - 读屏朗读该颜色的方式，例如「品牌红」；未提供时朗读颜色串
 * @csspart root - 色块本体（role=img）
 */
export class XhColorSwatchElement extends XhElement {
  static override partContract = { anatomy: colorSwatchAnatomy, meta: colorSwatchMeta }

  // 属性缺席翻成 undefined，缺省值由 connect 决定
  static override properties = {
    value: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
    label: { converter: STRING_CONVERTER },
  }

  declare value?: string
  declare size?: Size
  declare label?: string

  protected wire(): void {
    const root = this.getPart('root')
    if (!root)
      return
    // 读响应式 property，不回读 DOM 特性
    const api = connectColorSwatch(this.configured('color-swatch', {
      value: this.value,
      size: this.size,
      label: this.label,
    } as ColorSwatchProps), wcNormalize)
    this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)
  }
}
