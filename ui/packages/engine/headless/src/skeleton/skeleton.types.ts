import type { PropTypes } from '@xihan-ui/core'

/** 骨架条的形状：一行文字、一个圆、一块矩形。 */
export type SkeletonShape = 'text' | 'circle' | 'rect'

/** 骨架条的动效档：扫光、呼吸、静止。 */
export type SkeletonAnimation = 'shimmer' | 'pulse' | 'none'

export interface SkeletonProps {
  /** 是否还在加载，默认 true。 */
  loading?: boolean
  /** 容器内骨架条的默认形状，默认 'text'。 */
  shape?: SkeletonShape
  /** 动效档，默认 'shimmer'；缺省档不输出 data-animation。 */
  animation?: SkeletonAnimation
}

/** 单根骨架条自报的声明。 */
export interface SkeletonItemProps {
  /** 这一根的形状，覆盖容器给的默认值。 */
  shape?: SkeletonShape
}

export interface SkeletonApi<T extends PropTypes = PropTypes> {
  /** 当前是否处于加载态。 */
  loading: boolean
  getRootProps: () => T['element']
  getItemProps: (item?: SkeletonItemProps) => T['element']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface SkeletonTranslations {}
