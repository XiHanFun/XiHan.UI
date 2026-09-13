/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 card 类型契约。

import type { PropTypes } from '@xihan-ui/core'

/** 形态。取值与 card.css 的选择器一一对应。 */
export type CardVariant = 'default' | 'secondary' | 'tertiary' | 'transparent'

export interface CardProps {
  /** 语义层级：default / secondary / tertiary / transparent，默认 default。 */
  variant?: CardVariant
}

export interface CardApi<T extends PropTypes = PropTypes> {
  getRootProps: () => T['element']
  getHeaderProps: () => T['element']
  getTitleProps: () => T['element']
  getDescriptionProps: () => T['element']
  getContentProps: () => T['element']
  getFooterProps: () => T['element']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface CardTranslations {}
