/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 avatar group 相关实现。

import type { Size } from '@xihan-ui/core'
import type { AvatarGroupProps } from '@xihan-ui/headless'
import { avatarGroupAnatomy, avatarGroupMeta, connectAvatarGroup } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

/**
 * `<xh-avatar-group>`：Light-DOM 行为宿主，无状态机，把 connectAvatarGroup 产出接到各角色节点。
 *
 * 组内每个头像是作者自己的节点，不是本组件的角色节点：尺寸写在根上，
 * 皮肤把它转换为 `--xh-avatar-*` 槽位，沿继承流下发给每个头像。
 * overflow-item 可省略：未超出上限时没有「+N」。
 *
 * @customElement xh-avatar-group
 * @attr {number} max - 展示上限，如实写为根上的 data-max；裁剪与计数由作者完成
 * @attr {'sm'|'md'|'lg'} size - 尺寸，决定组内每个头像的直径与字号
 * @csspart root - 组容器，承载 data-size 与 data-max
 * @csspart overflow-item - 溢出计数位，内容（「+N」）由作者填写
 */
export class XhAvatarGroupElement extends XhElement {
  static override partContract = { anatomy: avatarGroupAnatomy, meta: avatarGroupMeta }

  // 属性缺席翻成 undefined，缺省值由 connect 决定
  static override properties = {
    max: { type: Number },
    size: { converter: { fromAttribute: (v: string | null) => v ?? undefined } },
  }

  declare max?: number
  declare size?: Size

  protected wire(): void {
    // 读响应式 property，不回读 DOM 特性
    const api = connectAvatarGroup(this.configured('avatar-group', {
      max: this.max,
      size: this.size,
    } satisfies AvatarGroupProps), wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }

    put('root', api.getRootProps() as Record<string, unknown>)
    put('overflow-item', api.getOverflowItemProps() as Record<string, unknown>)
  }
}
