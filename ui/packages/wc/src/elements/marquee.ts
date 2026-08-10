import type { MarqueeDirection, MarqueeProps } from '@xihan-ui/headless'
import { connectMarquee, marqueeAnatomy, marqueeMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

// 属性缺席翻成 undefined，缺省值由 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }

/**
 * `<xh-marquee>` —— Light-DOM 行为宿主，无状态机，把 connectMarquee 产出打到 root 与 content 上。
 *
 * 作者写一个 root 窗口，里面写一条 content 轨道，内容放进轨道里。
 * 滚动整段在皮肤里：横竖各一条 @keyframes，四个方向与两种铺法只换起止点，元素这边一行动画都不跑。
 *
 * 开了 auto-fill 就要在轨道里写两份内容，每份包一层 `data-xh-copy` 的壳，第二份同时标 aria-hidden 与 inert：
 * 皮肤此时按"走完一份的长度"排动画，只写一份会在走到一半时露出空白；
 * 副本若只标 aria-hidden 而仍可聚焦，焦点会落进一个读屏看不见的地方。
 *
 * 给了 speed 时 root 的内联 style 归本元素管，作者自己的内联样式请写在宿主元素上。
 *
 * @customElement xh-marquee
 * @attr {'left'|'right'|'up'|'down'} direction - 滚动方向，缺省 left
 * @attr {number} speed - 每秒滚过的像素数，写成 root 上的 --xh-marquee-speed
 * @attr {boolean} pause-on-hover - 指针停在窗口上时暂停，键盘焦点落进窗口时同样暂停
 * @attr {boolean} auto-fill - 轨道里铺两份内容，走完一份正好接上第二份
 * @csspart root - 只露出一段的窗口，承载 data-direction / data-orientation / data-pause-on-hover / data-auto-fill
 * @csspart content - 在窗口里走的轨道，动画挂在它身上
 */
export class XhMarqueeElement extends XhElement {
  static override partContract = { anatomy: marqueeAnatomy, meta: marqueeMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开
  static override properties = {
    direction: { converter: STRING_CONVERTER },
    speed: { converter: NUMBER_CONVERTER },
    pauseOnHover: { type: Boolean, attribute: 'pause-on-hover' },
    autoFill: { type: Boolean, attribute: 'auto-fill' },
  }

  declare direction?: MarqueeDirection
  declare speed?: number
  declare pauseOnHover?: boolean
  declare autoFill?: boolean

  protected wire(): void {
    // 读响应式 property，不回读 DOM 特性
    const api = connectMarquee({
      direction: this.direction,
      speed: this.speed,
      pauseOnHover: this.pauseOnHover ?? false,
      autoFill: this.autoFill ?? false,
    } satisfies MarqueeProps, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }

    put('root', api.getRootProps() as Record<string, unknown>)
    put('content', api.getContentProps() as Record<string, unknown>)
  }
}
