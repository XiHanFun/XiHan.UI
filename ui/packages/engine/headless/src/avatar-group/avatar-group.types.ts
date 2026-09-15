/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 avatar group 类型契约。

import type { PropTypes, Size } from '@xihan-ui/core'

export interface AvatarGroupProps {
  /**
   * 展示上限：本组展示的头像数量，其余收进 overflow-item。
   * 头像由作者渲染，因此裁切数量与 +N 中的 N 都由作者决定；
   * 组件把这个上限如实写入根上的 data-max。
   */
  max?: number
  /** 尺寸：sm / md / lg，写入根上并沿继承流下发给组内每一个头像。 */
  size?: Size
}

export interface AvatarGroupApi<T extends PropTypes = PropTypes> {
  getRootProps: () => T['element']
  getOverflowItemProps: () => T['element']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface AvatarGroupTranslations {}
