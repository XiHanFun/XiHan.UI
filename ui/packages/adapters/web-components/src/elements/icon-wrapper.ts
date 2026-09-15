/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 icon wrapper 相关实现。

import type { ActionVariant, Size, Tone } from '@xihan-ui/core'
import type { IconWrapperProps } from '@xihan-ui/headless'
import { connectIconWrapper, iconWrapperAnatomy, iconWrapperMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

/**
 * `<xh-icon-wrapper>`：Light-DOM 行为宿主，无状态机，把 connectIconWrapper 产出接到 root 角色节点。
 *
 * 根上不写 role、也不写 aria-hidden：其中的图元是装饰还是信息，由作者按用途声明。
 *
 * @customElement xh-icon-wrapper
 * @attr {'solid'|'subtle'|'outline'|'ghost'} variant - 变体
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 颜色
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @csspart root - 底座容器，承载 data-variant / data-tone / data-size
 */
export class XhIconWrapperElement extends XhElement {
  static override partContract = { anatomy: iconWrapperAnatomy, meta: iconWrapperMeta }

  // 属性缺席翻成 undefined，缺省值由 connect 决定
  static override properties = {
    variant: { converter: { fromAttribute: (v: string | null) => v ?? undefined } },
    tone: { converter: { fromAttribute: (v: string | null) => v ?? undefined } },
    size: { converter: { fromAttribute: (v: string | null) => v ?? undefined } },
  }

  declare variant?: ActionVariant
  declare tone?: Tone
  declare size?: Size

  protected wire(): void {
    // 读响应式 property，不回读 DOM 特性
    const api = connectIconWrapper(this.configured('icon-wrapper', {
      variant: this.variant,
      tone: this.tone,
      size: this.size,
    } satisfies IconWrapperProps), wcNormalize)

    const root = this.getPart('root')
    if (root)
      this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)
  }
}
