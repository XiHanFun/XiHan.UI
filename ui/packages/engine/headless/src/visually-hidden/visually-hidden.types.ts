/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 visually hidden 类型契约。

import type { PropTypes } from '@xihan-ui/core'

export interface VisuallyHiddenProps {
  /** 获得焦点时显出来：给「跳到正文」这类跳转链接用。缺省一直藏着。 */
  focusable?: boolean
}

export interface VisuallyHiddenApi<T extends PropTypes = PropTypes> {
  getRootProps: () => T['element']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface VisuallyHiddenTranslations {}
