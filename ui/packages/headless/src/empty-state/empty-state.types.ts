import type { PropTypes } from '@xihan-ui/core'

/** 播报方式：polite 让 root 成为 role=status 活区，off 让它只是个普通容器。 */
export type EmptyStateLive = 'polite' | 'off'

export interface EmptyStateProps {
  /** 尺寸档位，只改留白与字号，不改语义。 */
  size?: 'sm' | 'md' | 'lg'
  /** 缺省 polite。 */
  live?: EmptyStateLive
}

export interface EmptyStateApi<T extends PropTypes = PropTypes> {
  /** 生效的播报方式，缺省补齐后的值。 */
  live: EmptyStateLive
  getRootProps: () => T['element']
  getIconProps: () => T['element']
  getTitleProps: () => T['element']
  getDescriptionProps: () => T['element']
  getActionProps: () => T['element']
}
