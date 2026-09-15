/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 card 相关实现。

import type { CardProps, CardVariant } from '@xihan-ui/headless'
import { cardAnatomy, cardMeta, connectCard } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

/**
 * `<xh-card>`：Light-DOM 行为宿主，无状态机，把 connectCard 产出接到各角色节点。
 * 除 root 外的部件全部可省略：头部、内容、脚部按需放置，一个都不写也是合法的卡片。
 *
 * 根上不写 role：卡片是否为地标、是否需要可及名，由其中放置的内容决定，作者自行声明。
 *
 * @customElement xh-card
 * @attr {'default'|'secondary'|'tertiary'|'transparent'} variant - 语义层级，默认 default
 * @csspart root - 卡片根容器，承载 data-variant
 * @csspart header - 头部，放置标题与描述
 * @csspart title - 标题
 * @csspart description - 标题下的说明
 * @csspart content - 主体内容
 * @csspart footer - 底部，通常放操作
 */
export class XhCardElement extends XhElement {
  static override partContract = { anatomy: cardAnatomy, meta: cardMeta }

  // 属性缺席翻成 undefined，缺省值由 connect 决定
  static override properties = {
    variant: { converter: { fromAttribute: (v: string | null) => v ?? undefined } },
  }

  declare variant?: CardVariant

  protected wire(): void {
    // 读响应式 property，不回读 DOM 特性
    const api = connectCard(this.configured('card', {
      variant: this.variant,
    } satisfies CardProps), wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }

    put('root', api.getRootProps() as Record<string, unknown>)
    put('header', api.getHeaderProps() as Record<string, unknown>)
    put('title', api.getTitleProps() as Record<string, unknown>)
    put('description', api.getDescriptionProps() as Record<string, unknown>)
    put('content', api.getContentProps() as Record<string, unknown>)
    put('footer', api.getFooterProps() as Record<string, unknown>)
  }
}
