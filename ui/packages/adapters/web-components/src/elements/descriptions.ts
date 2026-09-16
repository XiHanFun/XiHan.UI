/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 descriptions 相关实现。

import type { ControlVariant, Size } from '@xihan-ui/core'
import type { DescriptionsColumns, DescriptionsPlacement, DescriptionsProps } from '@xihan-ui/headless'
import { connectDescriptions, descriptionsAnatomy, descriptionsMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

// 属性缺席翻成 undefined，缺省值由 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }

/**
 * `<xh-descriptions>`：Light-DOM 行为宿主，无状态机，把 connectDescriptions 产出接到各角色节点。
 * 排版使用 CSS Grid，columns 写为列数。
 *
 * 标签由作者决定，root 写 `<dl>`、label 写 `<dt>`、value 写 `<dd>` 时标签与取值天然成对；
 * 组件不补 role，也不使用 `<table>`：这是一份描述列表，不是数据表。
 *
 * @customElement xh-descriptions
 * @attr {1|2|3|4|5|6} columns - 每行放置几组，如实写为根上的 data-columns；未提供时每行一组
 * @attr {'outline'|'subtle'|'ghost'} variant - 形态：ghost 不画壳，outline 绘制外框并在格与格之间补网格线，subtle 淡底；默认 ghost
 * @attr {'top'|'left'} placement - 标签在上还是在左；未提供时在上
 * @attr {'sm'|'md'|'lg'} size - 尺寸，决定每格的内边距、组与组的间距与整体字号
 * @csspart root - 网格容器，承载 data-columns / data-placement / data-size / data-variant
 * @csspart item - 一组标签与取值，占网格中的一格；作者在此写 span（该格横跨的列数，窄档不采用）
 * @csspart label - 标签
 * @csspart value - 取值
 */
export class XhDescriptionsElement extends XhElement {
  static override partContract = { anatomy: descriptionsAnatomy, meta: descriptionsMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开
  static override properties = {
    columns: { type: Number },
    variant: { converter: STRING_CONVERTER },
    placement: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
  }

  declare columns?: DescriptionsColumns
  declare variant?: ControlVariant
  declare placement?: DescriptionsPlacement
  declare size?: Size

  protected wire(): void {
    // 读响应式 property，不回读 DOM 特性
    const api = connectDescriptions(this.configured('descriptions', {
      columns: this.columns,
      variant: this.variant,
      placement: this.placement,
      size: this.size,
    } satisfies DescriptionsProps), wcNormalize)

    const root = this.getPart('root')
    if (root)
      this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)

    // 每一组都会出现多次，逐个打
    const putAll = (name: string, attrs: Record<string, unknown>): void => {
      for (const el of this.getParts(name))
        this.spreader.spread(el, attrs)
    }

    // 跨列数写在格子自己的 span 特性上，类型系统够不着；写了非数字即当作没写
    for (const el of this.getParts('item')) {
      const raw = Number(el.getAttribute('span'))
      const span = Number.isFinite(raw) && raw > 0 ? raw : undefined
      this.spreader.spread(el, api.getItemProps({ span }) as Record<string, unknown>)
    }
    putAll('label', api.getLabelProps() as Record<string, unknown>)
    putAll('value', api.getValueProps() as Record<string, unknown>)
  }
}
