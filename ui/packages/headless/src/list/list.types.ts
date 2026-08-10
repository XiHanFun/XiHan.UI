import type { PropTypes } from '@xihan-ui/kernel'

/** 尺寸档位，只改条目的内边距、图文间距与两行文字的字号。 */
export type ListSize = 'sm' | 'md' | 'lg'

export interface ListProps {
  /** 外框：给整份列表画一圈描边与圆角。 */
  bordered?: boolean
  /** 指针悬停时条目换底色。 */
  hoverable?: boolean
  /** 条目之间画分隔线。 */
  split?: boolean
  /** 尺寸：sm / md / lg。 */
  size?: ListSize
}

export interface ListApi<T extends PropTypes = PropTypes> {
  getRootProps: () => T['element']
  getItemProps: () => T['element']
  getItemMediaProps: () => T['element']
  getItemContentProps: () => T['element']
  getItemTitleProps: () => T['element']
  getItemDescriptionProps: () => T['element']
  getItemActionProps: () => T['element']
}
