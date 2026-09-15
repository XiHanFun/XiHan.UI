/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 gradient text 相关实现。

import type { Tone } from '@xihan-ui/core'
import type { GradientTextDirection, GradientTextProps } from '@xihan-ui/headless'
import { connectGradientText, gradientTextAnatomy, gradientTextMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

// 属性缺席翻成 undefined，缺省值由 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }

/**
 * `<xh-gradient-text>`：Light-DOM 行为宿主，无状态机，把 connectGradientText 产出接到 root 角色节点。
 *
 * 两端颜色写为 root 上的内联 CSS 变量，渐变的绘制方式、默认使用哪族颜色都在皮肤中；
 * 走向按档位写为 data-direction，皮肤逐档换算为 `to <边或角>`。
 *
 * 提供 from 或 to 时 root 的内联 style 归本元素管理，作者自己的内联样式写在宿主元素上。
 *
 * @customElement xh-gradient-text
 * @attr {string} from - 起点颜色，写为 root 上的 --xh-gradient-text-from
 * @attr {string} to - 终点颜色，写为 root 上的 --xh-gradient-text-to
 * @attr {'to-right'|'to-left'|'to-bottom'|'to-top'|'to-bottom-right'|'to-bottom-left'|'to-top-right'|'to-top-left'} direction - 渐变走向档位，默认 to-right
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 颜色；显式 from / to 优先
 * @csspart root - 被上色的文字容器，承载 data-direction、data-tone 与两端颜色变量
 */
export class XhGradientTextElement extends XhElement {
  static override partContract = { anatomy: gradientTextAnatomy, meta: gradientTextMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开
  static override properties = {
    from: { converter: STRING_CONVERTER },
    to: { converter: STRING_CONVERTER },
    direction: { converter: STRING_CONVERTER },
    tone: { converter: STRING_CONVERTER },
  }

  declare from?: string
  declare to?: string
  declare direction?: GradientTextDirection
  declare tone?: Tone

  protected wire(): void {
    // 读响应式 property，不回读 DOM 特性
    const props: GradientTextProps = { from: this.from, to: this.to, direction: this.direction, tone: this.tone }
    const api = connectGradientText(props, wcNormalize)

    const root = this.getPart('root')
    if (root)
      this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)
  }
}
