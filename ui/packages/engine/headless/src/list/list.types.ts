import type { PropTypes, Size } from '@xihan-ui/kernel'

/** 尺寸档位，只改条目的内边距、图文间距与两行文字的字号。 */

export interface ListProps {
  /** 外框：给整份列表画一圈描边与圆角。 */
  bordered?: boolean
  /** 指针悬停时条目换底色。 */
  hoverable?: boolean
  /** 条目之间画分隔线。 */
  split?: boolean
  /** 尺寸：sm / md / lg。 */
  size?: Size
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

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface ListTranslations {}
