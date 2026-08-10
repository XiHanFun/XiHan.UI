import type { PropTypes } from '@xihan-ui/core'

export interface CardProps {
  /** 形态：outline / subtle / elevated / ghost，决定描边、底色与投影怎么用。 */
  variant?: string
  /** 尺寸：sm / md / lg，决定各段的内边距与标题字号。 */
  size?: string
  /** 指针悬停时抬起：只落 data-hoverable，抬多少由皮肤定。 */
  hoverable?: boolean
  /** 分段：在头、身、脚之间画分隔线。 */
  segmented?: boolean
}

export interface CardApi<T extends PropTypes = PropTypes> {
  getRootProps: () => T['element']
  getCoverProps: () => T['element']
  getHeaderProps: () => T['element']
  getTitleProps: () => T['element']
  getDescriptionProps: () => T['element']
  getBodyProps: () => T['element']
  getFooterProps: () => T['element']
}
