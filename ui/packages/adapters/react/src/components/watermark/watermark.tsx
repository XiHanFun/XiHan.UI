/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 watermark 相关实现。

import type { WatermarkImageSize, WatermarkProps } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { connectWatermark } from '@xihan-ui/headless'
import { mergeReactProps } from '../../runtime/merge-props'
import { reactNormalize } from '../../runtime/normalize-props'
import { useWatermarkContext, WatermarkProvider } from './context'

export interface XhWatermarkRootProps extends ComponentPropsWithRef<'div'> {
  /** 水印文字。传数组即多行，单个字符串中的换行同样断行。 */
  text?: string | string[]
  /** 倾斜角度，单位度，默认 -22。 */
  rotate?: number
  /** 两块图样之间的空白，单位像素，默认 24。 */
  gap?: number
  /** 字号，单位像素，默认 14。 */
  fontSize?: number
  /** 印记的深浅，0 到 1，默认 0.15。 */
  opacity?: number
  /** 印文字使用的字体，默认 sans-serif。 */
  fontFamily?: string
  /** 印在文字上方的图片，只接受 data:image/ 开头的内联图片。 */
  image?: string
  /** 图片的像素尺寸，默认 64 × 64。 */
  imageSize?: WatermarkImageSize
}

/**
 * 水印覆盖的区域。图样由 connect 计算为一张 SVG，写为根上的内联 CSS 变量，
 * 由皮肤铺为一层覆盖在内容之上的伪元素：印记因此不进入无障碍树、不接收点击、也不可选中。
 */
export function XhWatermarkRoot({
  text,
  rotate,
  gap,
  fontSize,
  opacity,
  fontFamily,
  image,
  imageSize,
  children,
  ...rest
}: XhWatermarkRootProps): ReactNode {
  const api = connectWatermark(
    { text, rotate, gap, fontSize, opacity, fontFamily, image, imageSize } as WatermarkProps,
    reactNormalize,
  )
  return (
    <WatermarkProvider value={{ api }}>
      <div {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
        {children}
      </div>
    </WatermarkProvider>
  )
}

export interface XhWatermarkContentProps extends ComponentPropsWithRef<'div'> {}

/** 被覆盖的内容。 */
export function XhWatermarkContent({ children, ...rest }: XhWatermarkContentProps): ReactNode {
  const ctx = useWatermarkContext()
  return (
    <div {...mergeReactProps(ctx.api.getContentProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}
