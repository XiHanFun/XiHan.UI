/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 flex 相关实现。

import type { FlexProps } from '@xihan-ui/headless'
import { connectFlex, flexAnatomy, flexMeta, normalizeFlexTier } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

/**
 * `<xh-flex>`：Light-DOM 行为宿主，无状态机，把 connectFlex 产出接到 root 角色节点。
 * 六个排版参数原样写为 data-*，排布规则写在皮肤中。
 * 方向、对齐、分布与间距可以逐档书写：`orientation='{"base":"vertical","md":"horizontal"}'`
 * 写为 data-orientation 与 data-orientation-md，窄视口竖排、达到 md 断点后横排；解析不出对象时当没写。
 *
 * 分隔符是一个角色节点：作者把它写在 root 中、夹在两个子项之间，元素为它写上 aria-hidden。
 * 本元素不生成任何结构，因此无法替作者复制节点；Vue 版的 split 插槽是同一件事的另一种写法，
 * 展开后的 DOM 形状一致。
 *
 * 根上不写 role：容器只做排布，其中放置的是列表还是一组按钮由作者自行声明。
 *
 * @customElement xh-flex
 * @attr {'horizontal'|'vertical'|string} orientation - 主轴方向，默认 horizontal；写 JSON 对象则逐档提供（base / sm / md / lg / xl）
 * @attr {'start'|'center'|'end'|'stretch'|'baseline'|string} align - 交叉轴对齐；写 JSON 对象则逐档提供
 * @attr {'start'|'center'|'end'|'between'|'around'|'evenly'|string} justify - 主轴分布；写 JSON 对象则逐档提供
 * @attr {'xs'|'sm'|'md'|'lg'|'xl'|string} gap - 子项间距档位，逐档对应一个间距令牌；写 JSON 对象则逐档提供
 * @attr {boolean} wrap - 一行放不下时换行
 * @attr {boolean} inline - 容器按行内盒排版，宽度收缩到内容
 * @csspart root - 排布容器，承载 data-orientation / data-align / data-justify / data-gap（及各自逐档的 -sm/-md/-lg/-xl）/ data-wrap / data-inline
 * @csspart split - 夹在两个子项之间的分隔符，作者逐个写在 root 中；元素为它写上 aria-hidden
 */
export class XhFlexElement extends XhElement {
  static override partContract = { anatomy: flexAnatomy, meta: flexMeta }

  // 属性缺席翻成 undefined，缺省值由 connect 决定；四条排版轴写 JSON 对象即逐档取值
  static override properties = {
    orientation: { converter: { fromAttribute: normalizeFlexTier } },
    align: { converter: { fromAttribute: normalizeFlexTier } },
    justify: { converter: { fromAttribute: normalizeFlexTier } },
    gap: { converter: { fromAttribute: normalizeFlexTier } },
    wrap: { type: Boolean },
    inline: { type: Boolean },
  }

  declare orientation?: FlexProps['orientation']
  declare align?: FlexProps['align']
  declare justify?: FlexProps['justify']
  declare gap?: FlexProps['gap']
  declare wrap?: boolean
  declare inline?: boolean

  protected wire(): void {
    // 读响应式 property，不回读 DOM 特性
    const api = connectFlex({
      orientation: this.orientation,
      align: this.align,
      justify: this.justify,
      gap: this.gap,
      wrap: this.wrap ?? false,
      inline: this.inline ?? false,
    } satisfies FlexProps, wcNormalize)

    const root = this.getPart('root')
    if (root)
      this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)

    // 分隔符是多实例部件：作者写几个就打几个，一个都没写也成立（只有一个子项时本就没有缝）
    for (const el of this.getParts('split'))
      this.spreader.spread(el, api.getSplitProps() as Record<string, unknown>)
  }
}
