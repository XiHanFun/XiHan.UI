/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 typography 类型契约。

import type { PropTypes, Size, Tone } from '@xihan-ui/core'

/** 文本变体。 */
export type TypographyVariant = 'code' | 'muted' | 'strong'

/** 标题字号档位，1 最大、6 最小。 */
export type TypographyLevel = 1 | 2 | 3 | 4 | 5 | 6

/** 对齐档位，逐档对应 CSS 的 text-align。 */
export type TypographyAlign = 'start' | 'center' | 'end' | 'justify'

/** 字重档位，四档与 --xh-font-weight-* 一一对应。 */
export type TypographyWeight = 'regular' | 'medium' | 'semibold' | 'bold'

export interface TypographyProps {
  /** 尺寸：sm / md / lg，整块正文的字号与段间距跟着换档。 */
  size?: Size
  /** 对齐：start / center / end / justify，整块正文跟着换。 */
  align?: TypographyAlign
  /** 字重：regular / medium / semibold / bold，整块正文跟着换。 */
  weight?: TypographyWeight
}

/** 标题自报字号档位，connect 据此产出属性。 */
export interface TypographyHeadingProps {
  /**
   * 字号档位 1-6，超出范围收到边界，给不出数字就不写这个属性。
   * 只换字号，不决定标签——标签由作者写在自己的节点上。
   * 收字符串是因为 WC 那侧的档位来自 DOM 属性。
   */
  level?: TypographyLevel | string
}

/** 行内文字属性。 */
export interface TypographyTextProps {
  /** 颜色：brand / neutral / success / warning / danger / info。 */
  tone?: Tone
  /** 变体：muted 弱化 / strong 强调 / code 等宽。 */
  variant?: TypographyVariant
  /** 字重：regular / medium / semibold / bold，只作用在这一段行内文字上。 */
  weight?: TypographyWeight
}

export interface TypographyApi<T extends PropTypes = PropTypes> {
  getRootProps: () => T['element']
  getHeadingProps: (props?: TypographyHeadingProps) => T['element']
  getParagraphProps: () => T['element']
  getTextProps: (props?: TypographyTextProps) => T['element']
  getLinkProps: () => T['element']
  /** 富文本容器：外来的 HTML（Markdown 渲染结果）铺进来，样式按标签给。 */
  getProseProps: () => T['element']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface TypographyTranslations {}
