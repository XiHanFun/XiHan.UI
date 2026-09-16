/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 page header 相关实现。

import type { ControlVariant, Size } from '@xihan-ui/core'
import type { PageHeaderProps } from '@xihan-ui/headless'
import { connectPageHeader, pageHeaderAnatomy, pageHeaderMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

// 属性缺席翻成 undefined，缺省值由 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }

/**
 * `<xh-page-header>`：Light-DOM 行为宿主，无状态机，把 connectPageHeader 产出接到各角色节点。
 * 除 root 外的部件全部可省略：返回位、标题、副标题、操作、页脚按需放置。
 *
 * 返回位只承担身份与位置：标签、type、可及名、点击后的跳转，全部归作者自己的按钮。
 * root 上不写 role：该区域是否为 banner 地标取决于它在页面中的层级，由作者自行声明。
 *
 * @customElement xh-page-header
 * @attr {'sm'|'md'|'lg'} size - 尺寸，决定标题字号与整块的上下留白
 * @attr {boolean} split - 在页头底部绘制一条分隔线；有面的两档不画它，边界由描边承担
 * @attr {'outline'|'subtle'|'ghost'} variant - 形态：ghost 贴在页面底色上，outline 为带描边的独立面，subtle 淡底；默认 ghost
 * @csspart root - 页头根容器，承载 data-size / data-variant / data-split
 * @csspart breadcrumb - 面包屑位，整行排在标题之上
 * @csspart back-trigger - 返回位，作者自己的按钮，组件只提供位置
 * @csspart media - 头像 / 图标位，排在返回位与标题之间
 * @csspart title - 页面标题
 * @csspart description - 与标题同行的补充信息
 * @csspart extra - 行尾的操作区
 * @csspart footer - 整行另起的附加区，放置描述、标签页或一组摘要
 */
export class XhPageHeaderElement extends XhElement {
  static override partContract = { anatomy: pageHeaderAnatomy, meta: pageHeaderMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开
  static override properties = {
    size: { converter: STRING_CONVERTER },
    split: { type: Boolean },
    variant: { converter: STRING_CONVERTER },
  }

  declare size?: Size
  declare split?: boolean
  declare variant?: ControlVariant

  protected wire(): void {
    // 读响应式 property，不回读 DOM 特性
    const api = connectPageHeader(this.configured('page-header', {
      size: this.size,
      split: this.split ?? false,
      variant: this.variant,
    } satisfies PageHeaderProps), wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }

    put('root', api.getRootProps() as Record<string, unknown>)
    put('breadcrumb', api.getBreadcrumbProps() as Record<string, unknown>)
    put('back-trigger', api.getBackTriggerProps() as Record<string, unknown>)
    put('media', api.getMediaProps() as Record<string, unknown>)
    put('title', api.getTitleProps() as Record<string, unknown>)
    put('description', api.getDescriptionProps() as Record<string, unknown>)
    put('extra', api.getExtraProps() as Record<string, unknown>)
    put('footer', api.getFooterProps() as Record<string, unknown>)
  }
}
