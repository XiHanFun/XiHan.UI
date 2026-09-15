/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 highlight 类型契约。

import type { PropTypes, Tone } from '@xihan-ui/core'
import type { HighlightSegment } from './highlight.split'

export interface HighlightProps {
  /** 要显示的整段文本。命中位置按该串逐字符计算。 */
  text?: string
  /** 关键词，一个或一组。空串会被丢弃。 */
  keyword?: string | readonly string[]
  /** 区分大小写，默认不区分。 */
  caseSensitive?: boolean
  /** 语气：brand / neutral / success / warning / danger / info，决定命中片段使用哪族颜色。 */
  tone?: Tone
}

export interface HighlightApi<T extends PropTypes = PropTypes> {
  /** 解析后的文本；未提供时为空串。 */
  text: string
  /** 切分后的片段，依次拼接恒等于 text。 */
  segments: readonly HighlightSegment[]
  getRootProps: () => T['element']
  /** 铺到每个命中片段上的属性；每段相同，命中的是哪个关键词不写入 DOM。 */
  getMarkProps: () => T['element']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface HighlightTranslations {}
