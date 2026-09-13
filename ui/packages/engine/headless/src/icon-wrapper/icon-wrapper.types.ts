/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 icon wrapper 类型契约。

import type { ActionVariant, PropTypes, Size, Tone } from '@xihan-ui/core'

export interface IconWrapperProps {
  /** 变体：solid / subtle / outline / ghost。 */
  variant?: ActionVariant
  /** 颜色：brand / neutral / success / warning / danger / info。 */
  tone?: Tone
  /** 尺寸：sm / md / lg。 */
  size?: Size
}

export interface IconWrapperApi<T extends PropTypes = PropTypes> {
  getRootProps: () => T['element']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface IconWrapperTranslations {}
