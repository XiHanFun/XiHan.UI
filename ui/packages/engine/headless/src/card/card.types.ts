import type { PropTypes, Size } from '@xihan-ui/core'

/** 形态。取值与 card.css 的选择器一一对应。 */
export type CardVariant = 'elevated' | 'ghost' | 'outline' | 'subtle'

export interface CardProps {
  /** 形态：outline / subtle / elevated / ghost，决定描边、底色与投影怎么用。 */
  variant?: CardVariant
  /** 尺寸：sm / md / lg，决定各段的内边距与标题字号。 */
  size?: Size
  /** 指针悬停时抬起：只落 data-hoverable，抬多少由皮肤定。 */
  hoverable?: boolean
  /** 分段：在头、身、脚之间画分隔线。 */
  split?: boolean
}

export interface CardApi<T extends PropTypes = PropTypes> {
  getRootProps: () => T['element']
  getMediaProps: () => T['element']
  getHeaderProps: () => T['element']
  getTitleProps: () => T['element']
  getDescriptionProps: () => T['element']
  getBodyProps: () => T['element']
  getFooterProps: () => T['element']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface CardTranslations {}
