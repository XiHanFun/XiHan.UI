/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 typography 类型契约。

import type { PropTypes, Size, Tone } from '@xihan-ui/core'

/**
 * 文本变体。
 * gradient 把一段字画成渐变：两端颜色缺省取品牌渐变，写了 tone 取该语气的色板；
 * 两端颜色与走向由皮肤的覆盖槽改写，不经 props。
 */
export type TypographyVariant = 'code' | 'gradient' | 'muted' | 'strong'

/** 标题字号档位，1 最大、6 最小。 */
export type TypographyLevel = 1 | 2 | 3 | 4 | 5 | 6

/** 对齐档位，逐档对应 CSS 的 text-align。 */
export type TypographyAlign = 'start' | 'center' | 'end' | 'justify'

/** 字重档位，四档与 --xh-font-weight-* 一一对应。 */
export type TypographyWeight = 'regular' | 'medium' | 'semibold' | 'bold'

export interface TypographyProps {
  /** 尺寸：sm / md / lg，整块正文的字号与段间距随之换档。 */
  size?: Size
  /** 对齐：start / center / end / justify，整块正文随之变化。 */
  align?: TypographyAlign
  /** 字重：regular / medium / semibold / bold，整块正文随之变化。 */
  weight?: TypographyWeight
}

/** 标题声明字号档位，connect 据此产出属性。 */
export interface TypographyHeadingProps {
  /**
   * 字号档位 1-6，超出范围收敛到边界，无法得到数字时不写该属性。
   * 只改变字号，不决定标签：标签由作者写在自己的节点上。
   * 接受字符串是因为 WC 侧的档位来自 DOM 属性。
   */
  level?: TypographyLevel | string
}

/** 行内文字属性。 */
export interface TypographyTextProps {
  /** 颜色：brand / neutral / success / warning / danger / info。 */
  tone?: Tone
  /** 变体：muted 弱化 / strong 强调 / code 等宽 / gradient 渐变。 */
  variant?: TypographyVariant
  /** 字重：regular / medium / semibold / bold，只作用于该段行内文字。 */
  weight?: TypographyWeight
  /** 删除线：只画线，不带删除语义；表达"已删除"时标签写 del 或 s。可与下划线并存。 */
  strikethrough?: boolean
  /** 下划线：只画线；与链接的下划线同形，不要给不可点的文字大面积使用。 */
  underline?: boolean
  /** 标记：淡底加同族字色，跨行两半各自收边；有 tone 时换成该族。表达"被标出"语义时标签写 mark。 */
  mark?: boolean
}

export interface TypographyApi<T extends PropTypes = PropTypes> {
  getRootProps: () => T['element']
  getHeadingProps: (props?: TypographyHeadingProps) => T['element']
  getParagraphProps: () => T['element']
  getTextProps: (props?: TypographyTextProps) => T['element']
  getLinkProps: () => T['element']
  /** 富文本容器：外来的 HTML（Markdown 渲染结果）铺入其中，样式按标签提供。 */
  getProseProps: () => T['element']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface TypographyTranslations {}
