import type { PropTypes, Size } from '@xihan-ui/kernel'

export interface PageHeaderProps {
  /** 尺寸：sm / md / lg，决定标题字号与整块的上下留白。 */
  size?: Size
  /** 底部画一条分隔线，把页头与下面的内容分开。 */
  bordered?: boolean
}

export interface PageHeaderApi<T extends PropTypes = PropTypes> {
  getRootProps: () => T['element']
  getBackTriggerProps: () => T['element']
  getTitleProps: () => T['element']
  getDescriptionProps: () => T['element']
  getExtraProps: () => T['element']
  getFooterProps: () => T['element']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface PageHeaderTranslations {}
