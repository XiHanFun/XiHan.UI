/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 color swatch 类型契约。

import type { PropTypes, Size } from '@xihan-ui/core'
import type { ColorRgba } from '../shared/color'

export interface ColorSwatchProps {
  /**
   * 要展示的颜色串。识别 `#rgb` / `#rrggbb(aa)`、`rgb()` / `rgba()`、`hsl()` / `hsla()`，
   * 不识别颜色关键字。无法解析时色块只保留棋盘格底，并带 `data-invalid`。
   */
  value?: string
  /** 尺寸：sm / md / lg，影响色块的边长与棋盘格粒度。 */
  size?: Size
  /**
   * 读屏朗读该颜色的方式，例如「品牌红」。
   * 未提供时朗读颜色串本身；串也没有时整块视为装饰，不进入可访问树。
   */
  label?: string
}

export interface ColorSwatchApi<T extends PropTypes = PropTypes> {
  /** 原样透出的颜色串（未解析时也是它，使 data-value 与作者书写的一致）。 */
  value: string
  /** 颜色串解析成功。失败时 rgba 为兜底黑、色块只绘制棋盘格。 */
  valid: boolean
  rgba: ColorRgba
  /** 绘制进色块的 CSS 颜色（rgba() 写法，带透明度）；解析失败时为空串。 */
  css: string
  /** 色块本体：role=img，名字取 label，其次取颜色串。 */
  getRootProps: () => T['element']
}

/** 读屏文案。本组件的名字由 label / value 提供，没有需要外露的文案，保留该位。 */
export interface ColorSwatchTranslations {}
