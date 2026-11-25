/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 visually hidden 相关实现。

import type { VisuallyHiddenProps } from '@xihan-ui/headless'
import { connectVisuallyHidden, visuallyHiddenAnatomy, visuallyHiddenMeta } from '@xihan-ui/headless'
import { BOOLEAN_CONVERTER } from '../dom/converters'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

/**
 * `<xh-visually-hidden>`：Light-DOM 行为宿主，无状态机，把 connectVisuallyHidden 产出接到 root。
 *
 * 作者写一个行内容器作为 root，要藏的内容写在里面，元素不改动其中的节点：
 * 屏幕上看不见、读屏照读，仍留在布局与表单里。藏法全在皮肤里，与工具类 `.xh-visually-hidden` 同一组声明。
 *
 * 打上 `focusable` 后，root 里的链接或按钮获得焦点时整段显出来、回到正常排版，焦点离开再藏回去；
 * 显出来的样子与聚焦环都归里面那个可聚焦元素。
 *
 * @customElement xh-visually-hidden
 * @attr {boolean} focusable - 获得焦点时显出来，给「跳到正文」这类跳转链接用；缺省一直藏着
 * @csspart root - 藏起来的行内容器，承载 data-focusable
 */
export class XhVisuallyHiddenElement extends XhElement {
  static override partContract = { anatomy: visuallyHiddenAnatomy, meta: visuallyHiddenMeta }

  // 属性缺席翻成 undefined，缺省值由 connect 决定
  static override properties = {
    focusable: { converter: BOOLEAN_CONVERTER },
  }

  declare focusable?: boolean

  protected wire(): void {
    const root = this.getPart('root')
    if (!root)
      return

    // 读响应式 property，不回读 DOM 特性
    // 没有状态机，全局配置（组件级缺省）在这里并进来
    const api = connectVisuallyHidden(this.configured('visually-hidden', {
      focusable: this.focusable,
    } satisfies VisuallyHiddenProps), wcNormalize)

    this.spreader.spread(root, api.getRootProps())
  }
}
