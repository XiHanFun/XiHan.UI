/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 marquee 相关实现。

import type { MarqueeDirection, MarqueeProps } from '@xihan-ui/headless'
import { connectMarquee, marqueeAnatomy, marqueeMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

// 属性缺席翻成 undefined，缺省值由 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }

/**
 * `<xh-marquee>`：Light-DOM 行为宿主，无状态机，把 connectMarquee 产出接到 root 与 content 上。
 *
 * 作者写一个 root 窗口，其中写一条 content 轨道，内容放进轨道。
 * 滚动整段在皮肤中：横竖各一条 @keyframes，四个方向与两种铺法只切换起止点，元素侧不运行任何动画。
 *
 * 开启 auto-fill 时要在轨道中写两份内容，每份包一层 `data-xh-copy` 的壳，第二份同时标注 aria-hidden 与 inert：
 * 皮肤此时按走完一份的长度排动画，只写一份会在走到一半时露出空白；
 * 副本若只标注 aria-hidden 而仍可聚焦，焦点会落进读屏不可见的位置。
 *
 * 提供 speed 时 root 的内联 style 归本元素管理，作者自己的内联样式写在宿主元素上。
 *
 * @customElement xh-marquee
 * @attr {'left'|'right'|'up'|'down'} direction - 滚动方向，默认 left
 * @attr {number} speed - 每秒滚过的像素数，写为 root 上的 --xh-marquee-speed
 * @attr {boolean} pause-on-hover - 指针停在窗口上时暂停，键盘焦点落进窗口时同样暂停
 * @attr {boolean} paused - 受控暂停：停在当前位置，优先于 pause-on-hover
 * @attr {boolean} auto-fill - 轨道中铺两份内容，走完一份正好接上第二份
 * @csspart root - 只显示一段的窗口，承载 data-direction / data-orientation / data-pause-on-hover / data-paused / data-auto-fill
 * @csspart content - 在窗口中移动的轨道，动画挂在它身上
 */
export class XhMarqueeElement extends XhElement {
  static override partContract = { anatomy: marqueeAnatomy, meta: marqueeMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开
  static override properties = {
    direction: { converter: STRING_CONVERTER },
    speed: { converter: NUMBER_CONVERTER },
    pauseOnHover: { type: Boolean, attribute: 'pause-on-hover' },
    paused: { type: Boolean },
    autoFill: { type: Boolean, attribute: 'auto-fill' },
  }

  declare direction?: MarqueeDirection
  declare speed?: number
  declare pauseOnHover?: boolean
  declare paused?: boolean
  declare autoFill?: boolean

  protected wire(): void {
    // 读响应式 property，不回读 DOM 特性
    const api = connectMarquee({
      direction: this.direction,
      speed: this.speed,
      pauseOnHover: this.pauseOnHover ?? false,
      paused: this.paused ?? false,
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
