import type { PropTypes } from '@xihan-ui/kernel'

/** 骨架条的形状：一行文字、一个圆、一块矩形。 */
export type SkeletonVariant = 'text' | 'circle' | 'rect'

export interface SkeletonProps {
  /** 是否还在加载，默认 true。 */
  loading?: boolean
  /** 容器内骨架条的默认形状，默认 'text'。 */
  variant?: SkeletonVariant
}

/** 单根骨架条自报的声明。 */
export interface SkeletonItemProps {
  /** 这一根的形状，覆盖容器给的默认值。 */
  variant?: SkeletonVariant
}

export interface SkeletonApi<T extends PropTypes = PropTypes> {
  /** 当前是否处于加载态。 */
  loading: boolean
  getRootProps: () => T['element']
  getItemProps: (item?: SkeletonItemProps) => T['element']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface SkeletonTranslations {}
