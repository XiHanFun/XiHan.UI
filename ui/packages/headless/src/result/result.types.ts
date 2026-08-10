import type { PropTypes } from '@xihan-ui/core'

/** 结果类型：三个 HTTP 状态码与四种通用结果。 */
export type ResultStatus = '404' | '403' | '500' | 'success' | 'warning' | 'error' | 'info'

export interface ResultProps {
  /** 结果类型，只落成 root 的 data-status；图标画什么由作者塞进图标槽。 */
  status?: ResultStatus
  /** 尺寸档位，只改留白与字号，不改语义。 */
  size?: 'sm' | 'md' | 'lg'
}

export interface ResultApi<T extends PropTypes = PropTypes> {
  getRootProps: () => T['element']
  getIconProps: () => T['element']
  getTitleProps: () => T['element']
  getDescriptionProps: () => T['element']
  getActionProps: () => T['element']
}
