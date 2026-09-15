/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 watermark 相关实现。

import type { WatermarkImageSize, WatermarkProps } from '@xihan-ui/headless'
import { connectWatermark, watermarkAnatomy, watermarkMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

// 属性缺席翻成 undefined，缺省值由 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }

/**
 * `<xh-watermark>`：Light-DOM 行为宿主，无状态机，把 connectWatermark 产出接到 root 与 content 上。
 *
 * 图样是一张按 props 计算的 SVG，整段百分号编码为 data URI 写进 root 的内联 CSS 变量；
 * 铺为一层覆盖在内容之上的伪元素归皮肤管理，因此印记不进入无障碍树、不接收点击、也不可选中。
 *
 * 多行水印用 text 属性中的换行，或把 text 作为 property 传入一个字符串数组。
 * 没有可印的文字时 root 写 data-state="empty"，皮肤整层不绘制。
 *
 * 提供文字时 root 的内联 style 归本元素管理，作者自己的内联样式写在宿主元素上。
 *
 * @customElement xh-watermark
 * @attr {string} text - 水印文字，换行即多行
 * @attr {number} rotate - 倾斜角度（度），默认 -22
 * @attr {number} gap - 两块图样之间的空白（像素），默认 24
 * @attr {number} font-size - 字号（像素），默认 14
 * @attr {number} opacity - 印记的深浅，0 到 1，默认 0.15
 * @attr {string} font-family - 印文字使用的字体，默认 sans-serif；图样无法获取页面字体，字体名需要写全
 * @attr {string} image - 印在文字上方的图片，只接受 data:image/ 开头的内联图片；印出的是剪影
 * @csspart root - 覆盖水印的区域，承载 data-state 与图样、步距两个变量
 * @csspart content - 被覆盖的内容
 */
export class XhWatermarkElement extends XhElement {
  static override partContract = { anatomy: watermarkAnatomy, meta: watermarkMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开
  static override properties = {
    text: { converter: STRING_CONVERTER },
    rotate: { converter: NUMBER_CONVERTER },
    gap: { converter: NUMBER_CONVERTER },
    fontSize: { converter: NUMBER_CONVERTER, attribute: 'font-size' },
    opacity: { converter: NUMBER_CONVERTER },
    fontFamily: { converter: STRING_CONVERTER, attribute: 'font-family' },
    image: { converter: STRING_CONVERTER },
    imageSize: { attribute: false },
  }

  declare text?: string | string[]
  declare rotate?: number
  declare gap?: number
  declare fontSize?: number
  declare opacity?: number
  declare fontFamily?: string
  declare image?: string
  /** 图片尺寸是对象，只能通过 property 设置，不设置特性。 */
  declare imageSize?: WatermarkImageSize

  protected wire(): void {
    // 读响应式 property，不回读 DOM 特性
    const api = connectWatermark({
      text: this.text,
      rotate: this.rotate,
      gap: this.gap,
      fontSize: this.fontSize,
      opacity: this.opacity,
      fontFamily: this.fontFamily,
      image: this.image,
      imageSize: this.imageSize,
    } satisfies WatermarkProps, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }

    put('root', api.getRootProps() as Record<string, unknown>)
    put('content', api.getContentProps() as Record<string, unknown>)
  }
}
