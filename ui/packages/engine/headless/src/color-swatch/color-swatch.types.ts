/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 color swatch 类型契约。

import type { PropTypes, Size } from '@xihan-ui/core'
import type { ColorRgba } from '../shared/color'

export interface ColorSwatchProps {
  /**
   * 要展示的颜色串。认 `#rgb` / `#rrggbb(aa)`、`rgb()` / `rgba()`、`hsl()` / `hsla()`，
   * 不认颜色关键字。解析不出时色块只剩棋盘格底，并带 `data-invalid`。
   */
  value?: string
  /** 尺寸：sm / md / lg，换的是色块的边长与棋盘格粒度。 */
  size?: Size
  /**
   * 读屏怎么念这块颜色，例如「品牌红」。
   * 不给就念颜色串本身；串也没有时整块视为装饰，不进可访问树。
   */
  label?: string
}

export interface ColorSwatchApi<T extends PropTypes = PropTypes> {
  /** 原样透出的颜色串（未解析时也是它，好让 data-value 与作者写的一致）。 */
  value: string
  /** 颜色串解析成功。失败时 rgba 是兜底黑、色块只画棋盘格。 */
  valid: boolean
  rgba: ColorRgba
  /** 画进色块的 CSS 颜色（rgba() 写法，带透明度）；解析失败时为空串。 */
  css: string
  /** 色块本体：role=img，名字取 label，其次取颜色串。 */
  getRootProps: () => T['element']
}

/** 读屏用的文案。本组件的名字由 label / value 给，没有需要外露的文案，位先留着。 */
export interface ColorSwatchTranslations {}
