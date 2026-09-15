/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 list 类型契约。

import type { PropTypes, Size } from '@xihan-ui/core'

/** 尺寸档位，只影响条目的内边距、图文间距与两行文字的字号。 */

export interface ListProps {
  /** 外框：给整份列表绘制描边与圆角。 */
  bordered?: boolean
  /** 指针悬停时条目切换底色。 */
  hoverable?: boolean
  /** 条目之间绘制分隔线。 */
  split?: boolean
  /** 尺寸：sm / md / lg。 */
  size?: Size
}

export interface ListApi<T extends PropTypes = PropTypes> {
  getRootProps: () => T['element']
  getItemProps: () => T['element']
  getItemMediaProps: () => T['element']
  getItemContentProps: () => T['element']
  getItemTitleProps: () => T['element']
  getItemDescriptionProps: () => T['element']
  getItemActionProps: () => T['element']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface ListTranslations {}
