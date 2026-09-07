import type { WatermarkImageSize, WatermarkProps } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { connectWatermark } from '@xihan-ui/headless'
import { mergeReactProps } from '../../runtime/merge-props'
import { reactNormalize } from '../../runtime/normalize-props'
import { useWatermarkContext, WatermarkProvider } from './context'

export interface XhWatermarkRootProps extends ComponentPropsWithRef<'div'> {
  /** 水印文字。给数组就是多行，单个字符串里的换行同样断行。 */
  text?: string | string[]
  /** 倾斜角度，单位度，缺省 -22。 */
  rotate?: number
  /** 两块图样之间留的空白，单位像素，缺省 24。 */
  gap?: number
  /** 字号，单位像素，缺省 14。 */
  fontSize?: number
  /** 印子的深浅，0 到 1，缺省 0.15。 */
  opacity?: number
  /** 印文字用的字体，缺省 sans-serif。 */
  fontFamily?: string
  /** 印在文字上方的图片，只收 data:image/ 开头的内联图片。 */
  image?: string
  /** 图片的像素尺寸，缺省 64 × 64。 */
  imageSize?: WatermarkImageSize
}

/**
 * 盖水印的那块地。图样由 connect 算成一张 SVG，写成根上的内联 CSS 变量，
 * 由皮肤铺成一层盖在内容之上的伪元素——印子因此不进无障碍树、不吃点击、也选不中。
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

/** 被盖住的那段内容。 */
export function XhWatermarkContent({ children, ...rest }: XhWatermarkContentProps): ReactNode {
  const ctx = useWatermarkContext()
  return (
    <div {...mergeReactProps(ctx.api.getContentProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}
