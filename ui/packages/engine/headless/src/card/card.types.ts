/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 card 类型契约。

import type { ControlVariant, PropTypes } from '@xihan-ui/core'

export interface CardProps {
  /** 形态：outline 为带影的抬起面，subtle 为淡底，ghost 无底无影。默认 outline。 */
  variant?: ControlVariant
}

export interface CardApi<T extends PropTypes = PropTypes> {
  getRootProps: () => T['element']
  getHeaderProps: () => T['element']
  getTitleProps: () => T['element']
  getDescriptionProps: () => T['element']
  getContentProps: () => T['element']
  getFooterProps: () => T['element']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface CardTranslations {}
