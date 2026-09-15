/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 input group 类型契约。

import type { PropTypes, Size } from '@xihan-ui/core'

/** 视觉变体：primary 是带阴影的默认输入面，secondary 用于已有表面的低强调场景。 */
export type InputGroupVariant = 'primary' | 'secondary'

export interface InputGroupProps {
  /** 视觉变体：primary / secondary。默认 primary。 */
  variant?: InputGroupVariant
  /**
   * 尺寸：sm / md / lg，写入根上供皮肤填入 item 的高度、内衬与字号槽位。
   * 未提供时档位由组内控件自身的 data-size 决定，组内没有带档位的控件时使用 md。
   */
  size?: Size
}

export interface InputGroupApi<T extends PropTypes = PropTypes> {
  getRootProps: () => T['element']
  getItemProps: () => T['element']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface InputGroupTranslations {}
