import type { PropTypes, Size, Tone } from '@xihan-ui/kernel'

/** 形态。取值与 typography.css 的选择器一一对应。 */
export type TypographyVariant = 'code' | 'muted' | 'strong'

/** 标题字号档位，1 最大、6 最小。 */
export type TypographyLevel = 1 | 2 | 3 | 4 | 5 | 6

export interface TypographyProps {
  /** 尺寸：sm / md / lg，整块正文的字号与段间距跟着换档。 */
  size?: Size
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

/** 行内文字自报形态与语气，connect 据此产出属性。 */
export interface TypographyTextProps {
  /** 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 */
  tone?: Tone
  /** 形态：muted 弱化 / strong 加重 / code 等宽。 */
  variant?: TypographyVariant
}

export interface TypographyApi<T extends PropTypes = PropTypes> {
  getRootProps: () => T['element']
  getHeadingProps: (props?: TypographyHeadingProps) => T['element']
  getParagraphProps: () => T['element']
  getTextProps: (props?: TypographyTextProps) => T['element']
  getLinkProps: () => T['element']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface TypographyTranslations {}
