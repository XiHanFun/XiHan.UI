/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 typography 相关实现。

import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { TypographyApi, TypographyHeadingProps, TypographyProps } from './typography.types'
import { dataAttr } from '@xihan-ui/core'
import { typographyAnatomy } from './typography.anatomy'

const parts = typographyAnatomy.build()

/** 档位收进 1-6；给不出数字就不落这个属性，皮肤退回默认档。 */
function levelAttr(level: TypographyHeadingProps['level']): string | undefined {
  if (level == null || level === '')
    return undefined
  const n = Math.trunc(Number(level))
  if (!Number.isFinite(n))
    return undefined
  return String(Math.min(6, Math.max(1, n)))
}

// Typography 无状态机：版式不持有任何交互状态，属性全部由 props 算出。
// 各部件只带身份与视觉档位，标签由作者写在自己的节点上——
// 皮肤认的是 data-scope + data-part，不认标签名，所以 h2 / p / span / a 换成别的也照样上样式。
export function connectTypography<T extends PropTypes>(
  props: TypographyProps,
  normalize: NormalizeProps<T>,
): TypographyApi<T> {
  return {
    // 尺寸只落在根上，各段从这里继承私有槽；根还管着段间距与最大行宽
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-size': props.size,
      'data-align': props.align,
      'data-weight': props.weight,
    }),

    // 不写 role="heading" 与 aria-level：档位只管字号，进不进文档大纲由作者写的标签决定
    getHeadingProps: (heading = {}) => normalize.element({
      ...parts.heading.attrs,
      'data-level': levelAttr(heading.level),
    }),

    getParagraphProps: () => normalize.element({ ...parts.paragraph.attrs }),

    // 形态、语气与字重逐条落在这一段行内文字上，同一块正文里可以各写各的；
    // 删除线、下划线与标记是三个独立开关，与形态叠加（弱化 + 删除线即"已完成"的那一行）
    getTextProps: (text = {}) => normalize.element({
      ...parts.text.attrs,
      'data-tone': text.tone,
      'data-variant': text.variant,
      'data-weight': text.weight,
      'data-strikethrough': dataAttr(text.strikethrough),
      'data-underline': dataAttr(text.underline),
      'data-marked': dataAttr(text.mark),
    }),

    // 链接只拿身份：href、target、rel 与点击行为全归作者
    getLinkProps: () => normalize.element({ ...parts.link.attrs }),

    // 富文本容器只拿身份：里面的标签由内容自己带，样式按标签给
    getProseProps: () => normalize.element({ ...parts.prose.attrs }),
  }
}
