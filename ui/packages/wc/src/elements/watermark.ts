import type { WatermarkProps } from '@xihan-ui/headless'
import { connectWatermark, watermarkAnatomy, watermarkMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

// 属性缺席翻成 undefined，缺省值由 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }

/**
 * `<xh-watermark>` —— Light-DOM 行为宿主，无状态机，把 connectWatermark 产出打到 root 与 content 上。
 *
 * 图样是一张按 props 算出来的 SVG，整段百分号编码成 data URI 写进 root 的内联 CSS 变量；
 * 铺成一层盖在内容之上的伪元素归皮肤管，因此印子不进无障碍树、不吃点击、也选不中。
 *
 * 多行水印用 text 属性里的换行，或把 text 当 property 传一个字符串数组。
 * 没有可印的文字时 root 落 data-state="empty"，皮肤整层不画。
 *
 * 给了文字时 root 的内联 style 归本元素管，作者自己的内联样式请写在宿主元素上。
 *
 * @customElement xh-watermark
 * @attr {string} text - 水印文字，换行即多行
 * @attr {number} rotate - 倾斜角度（度），缺省 -22
 * @attr {number} gap - 两块图样之间的空白（像素），缺省 24
 * @attr {number} font-size - 字号（像素），缺省 14
 * @attr {number} opacity - 印子的深浅，0 到 1，缺省 0.15
 * @csspart root - 盖水印的那块地，承载 data-state 与图样、步距两个变量
 * @csspart content - 被盖住的那段内容
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
  }

  declare text?: string | string[]
  declare rotate?: number
  declare gap?: number
  declare fontSize?: number
  declare opacity?: number

  protected wire(): void {
    // 读响应式 property，不回读 DOM 特性
    const api = connectWatermark({
      text: this.text,
      rotate: this.rotate,
      gap: this.gap,
      fontSize: this.fontSize,
      opacity: this.opacity,
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
