import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { TypographyApi, TypographyHeadingProps, TypographyProps } from './typography.types'
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
    }),

    // 不写 role="heading" 与 aria-level：档位只管字号，进不进文档大纲由作者写的标签决定
    getHeadingProps: (heading = {}) => normalize.element({
      ...parts.heading.attrs,
      'data-level': levelAttr(heading.level),
    }),

    getParagraphProps: () => normalize.element({ ...parts.paragraph.attrs }),

    // 形态与语气两个轴逐条落在这一段行内文字上，同一块正文里可以各写各的
    getTextProps: (text = {}) => normalize.element({
      ...parts.text.attrs,
      'data-tone': text.tone,
      'data-variant': text.variant,
    }),

    // 链接只拿身份：href、target、rel 与点击行为全归作者
    getLinkProps: () => normalize.element({ ...parts.link.attrs }),
  }
}
