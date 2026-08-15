import type { PropTypes, Size } from '@xihan-ui/kernel'

export interface AvatarGroupProps {
  /**
   * 展示上限：这一组打算摆出几枚，其余收进 overflow 那一枚。
   * 头像由作者渲染，所以裁到几枚、「+N」里的 N 写多少都在作者手里；
   * 组件把这个上限如实落成根上的 data-max。
   */
  max?: number
  /** 尺寸：sm / md / lg，落到根上沿继承流下发给组内每一枚。 */
  size?: Size
}

export interface AvatarGroupApi<T extends PropTypes = PropTypes> {
  getRootProps: () => T['element']
  getOverflowProps: () => T['element']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface AvatarGroupTranslations {}
