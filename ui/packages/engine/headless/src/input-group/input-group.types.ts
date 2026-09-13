import type { PropTypes, Size } from '@xihan-ui/core'

/** 视觉变体：primary 是带阴影的默认输入面，secondary 用于已有表面的低强调场景。 */
export type InputGroupVariant = 'primary' | 'secondary'

export interface InputGroupProps {
  /** 视觉变体：primary / secondary。缺省 primary。 */
  variant?: InputGroupVariant
  /**
   * 尺寸：sm / md / lg，落到根上供皮肤写进 item 的高度、内衬与字号槽位。
   * 不写时档位由组内控件自己的 data-size 决定，组里没有带档的控件就走 md。
   */
  size?: Size
}

export interface InputGroupApi<T extends PropTypes = PropTypes> {
  getRootProps: () => T['element']
  getItemProps: () => T['element']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface InputGroupTranslations {}
