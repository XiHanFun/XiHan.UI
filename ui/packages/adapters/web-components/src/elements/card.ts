/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 card 相关实现。

import type { ControlVariant } from '@xihan-ui/core'
import type { CardProps } from '@xihan-ui/headless'
import type { ElementStructure } from '../element-base'
import { cardAnatomy, cardMeta, cardStructure, connectCard } from '@xihan-ui/headless'
import { BOOLEAN_CONVERTER } from '../dom/converters'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }

/**
 * `<xh-card>`：Light-DOM 行为宿主，无状态机，把 connectCard 产出接到各角色节点。
 * 除 root 外的部件全部可省略：头部、内容、脚部按需放置，一个都不写也是合法的卡片。
 *
 * 根上不写 role：卡片是否为地标、是否需要可及名，由其中放置的内容决定，作者自行声明。
 * 整卡可交互时在 title 里放一个原生链接或按钮作 trigger（`<a data-xh-part="trigger" href>`），
 * 再给元素写 interactive：trigger 的点击区铺满整张卡片，Tab 位与可及名都只归它。
 *
 * 不写部件（或只写 root）时元素按标准结构生成：宿主直接子节点写 `slot="title"`、`slot="description"`、
 * `slot="content"`、`slot="footer"` 的，生成对应的页头标题与说明、正文、页脚并把节点搬进去；整卡可交互的 trigger 要用时手写部件。
 *
 * @customElement xh-card
 * @attr {'outline'|'subtle'|'ghost'} variant - 形态：outline 为带影的抬起面，subtle 为淡底，ghost 无底无影；默认 outline
 * @attr {boolean} interactive - 整卡可交互：title 里的 trigger 把点击区铺满整张卡片
 * @csspart root - 卡片根容器，承载 data-variant
 * @csspart header - 头部，放置标题与描述
 * @csspart title - 标题
 * @csspart trigger - 整卡的触发器：title 里的原生链接或按钮
 * @csspart description - 标题下的说明
 * @csspart content - 主体内容
 * @csspart footer - 底部，通常放操作
 */
export class XhCardElement extends XhElement {
  static override partContract = { anatomy: cardAnatomy, meta: cardMeta }

  static override structure: ElementStructure<XhCardElement> = {
    build: host => cardStructure({ slotted: (name, key) => host.slotted(name, key) }),
  }

  // 属性缺席翻成 undefined，缺省值由 connect 决定
  static override properties = {
    variant: { converter: STRING_CONVERTER },
    interactive: { converter: BOOLEAN_CONVERTER },
  }

  declare variant?: ControlVariant
  declare interactive?: boolean

  protected wire(): void {
    // 读响应式 property，不回读 DOM 特性
    const api = connectCard(this.configured('card', {
      variant: this.variant,
      interactive: this.interactive,
    } satisfies CardProps), wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }

    put('root', api.getRootProps() as Record<string, unknown>)
    put('header', api.getHeaderProps() as Record<string, unknown>)
    put('title', api.getTitleProps() as Record<string, unknown>)
    put('trigger', api.getTriggerProps() as Record<string, unknown>)
    put('description', api.getDescriptionProps() as Record<string, unknown>)
    put('content', api.getContentProps() as Record<string, unknown>)
    put('footer', api.getFooterProps() as Record<string, unknown>)
  }
}
