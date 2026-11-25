/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 aspect ratio 类型契约。

import type { PropTypes } from '@xihan-ui/core'

export interface AspectRatioProps {
  /** 宽高比：宽 ÷ 高，如 `16 / 9`；缺省 1。不是大于 0 的有限数时按缺省处理。 */
  ratio?: number
}

export interface AspectRatioApi<T extends PropTypes = PropTypes> {
  /** 归一后的宽高比。 */
  ratio: number
  getRootProps: () => T['element']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface AspectRatioTranslations {}
