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
 * `<xh-color-swatch>` —— 颜色色块宿主，无状态机。
 *
 * 把一个颜色画成一小块给人看，不接交互；颜色经家族配方铺在棋盘格上。
 * 要挑颜色请用 `<xh-color-swatch-picker>`。
 *
 * @customElement xh-color-swatch
 * @attr {string} value - 要展示的颜色串：#rgb / #rrggbb(aa) / rgb() / hsl()，不认颜色关键字；解析不出时只画棋盘格并带 data-invalid
 * @attr {'sm'|'md'|'lg'} size - 尺寸：换的是边长与棋盘格粒度
 * @attr {string} label - 读屏怎么念这块颜色，例如「品牌红」；不给就念颜色串
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
