import type { PropTypes, Size } from '@xihan-ui/core'

export interface InputGroupProps {
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
