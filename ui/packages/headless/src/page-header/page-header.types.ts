import type { PropTypes } from '@xihan-ui/core'

export interface PageHeaderProps {
  /** 尺寸：sm / md / lg，决定标题字号与整块的上下留白。 */
  size?: string
  /** 底部画一条分隔线，把页头与下面的内容分开。 */
  bordered?: boolean
}

export interface PageHeaderApi<T extends PropTypes = PropTypes> {
  getRootProps: () => T['element']
  getBackTriggerProps: () => T['element']
  getTitleProps: () => T['element']
  getSubtitleProps: () => T['element']
  getExtraProps: () => T['element']
  getFooterProps: () => T['element']
}
