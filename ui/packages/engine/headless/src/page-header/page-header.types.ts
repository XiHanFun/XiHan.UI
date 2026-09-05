import type { PropTypes, Size } from '@xihan-ui/core'

/**
 * 形态：页头自己画不画一块面。
 * 缺省不画（贴在页面底色上，只有标题与一条可选的分隔线），surface 加底色与圆角，raised 再加一层投影。
 */
export type PageHeaderVariant = 'plain' | 'surface' | 'raised'

export interface PageHeaderProps {
  /** 尺寸：sm / md / lg，决定标题字号与整块的上下留白。 */
  size?: Size
  /** 底部画一条分隔线，把页头与下面的内容分开。给了面的两档改画整圈描边。 */
  bordered?: boolean
  /** 形态：plain / surface / raised。不写即不画面，与写 plain 同一个样子。 */
  variant?: PageHeaderVariant
}

export interface PageHeaderApi<T extends PropTypes = PropTypes> {
  getRootProps: () => T['element']
  /** 面包屑位：整行排在标题之上。放什么归作者，组件只圈出位置。 */
  getBreadcrumbProps: () => T['element']
  getBackTriggerProps: () => T['element']
  /** 头像 / 图标位：排在返回位与标题之间，不随标题行换行。 */
  getMediaProps: () => T['element']
  getTitleProps: () => T['element']
  getDescriptionProps: () => T['element']
  getExtraProps: () => T['element']
  getFooterProps: () => T['element']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface PageHeaderTranslations {}
