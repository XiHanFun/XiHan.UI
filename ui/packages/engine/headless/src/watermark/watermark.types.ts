/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 watermark 类型契约。

import type { PropTypes } from '@xihan-ui/core'

/** 两态：已计算出图样 / 没有可印的文字。empty 时皮肤整层不绘制。 */
export type WatermarkState = 'ready' | 'empty'

/** 一块图样的像素尺寸，也是平铺时的步距。 */
export interface WatermarkTile {
  readonly width: number
  readonly height: number
}

/** 图片印子的像素尺寸。 */
export interface WatermarkImageSize {
  readonly width: number
  readonly height: number
}

export interface WatermarkProps {
  /**
   * 水印文字。提供数组即多行，单个字符串中的换行同样断行；
   * 空白行会被去除：它只使图样增高，不印出任何内容。
   */
  text?: string | string[]
  /** 倾斜角度，单位度，默认 -22。 */
  rotate?: number
  /** 两块图样之间的空白，单位像素，默认 24。 */
  gap?: number
  /** 字号，单位像素，默认 14。 */
  fontSize?: number
  /** 印记的深浅，0 到 1，默认 0.15。 */
  opacity?: number
  /**
   * 印文字使用的字体，默认 `sans-serif`。
   *
   * 图样是一张用作遮罩的 SVG，无法获取页面中的字体，因此需要在这里把字体名写全
   * （例如 `'PingFang SC, sans-serif'`）；书写的字体在运行环境中不存在时由平台自行回退。
   */
  fontFamily?: string
  /**
   * 印在文字上方的图片，只接受 `data:image/` 开头的内联图片。
   *
   * 图样用作遮罩，遮罩只取图样的透明度：印出的是该图的剪影，颜色仍由
   * `--xh-watermark-fg` 提供。外部地址一律不接受：SVG 作为图片使用时无法获取外部资源，
   * 接受也无法印出内容。
   */
  image?: string
  /** 图片的像素尺寸，默认 64 × 64。 */
  imageSize?: WatermarkImageSize
}

export interface WatermarkApi<T extends PropTypes = PropTypes> {
  /** 归一化后的文字行；没有可印的文字时为空数组。 */
  lines: readonly string[]
  /** 图样尺寸，即平铺步距；没有图样时宽高都是 0。 */
  tile: WatermarkTile
  /** 图样的 data URI；没有图样时为空串。 */
  image: string
  state: WatermarkState
  getRootProps: () => T['element']
  getContentProps: () => T['element']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface WatermarkTranslations {}
