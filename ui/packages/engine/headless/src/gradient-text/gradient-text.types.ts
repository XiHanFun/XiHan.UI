import type { PropTypes } from '@xihan-ui/core'

/**
 * 渐变走向档位，逐档对应 CSS 的 `to <边或角>`。
 * 只收这八个档，不收任意角度字符串：角度是排版参数不是设计档位，放开就没法在皮肤里换算。
 */
export type GradientTextDirection
  = | 'to-right' | 'to-left' | 'to-bottom' | 'to-top'
    | 'to-bottom-right' | 'to-bottom-left' | 'to-top-right' | 'to-top-left'

export interface GradientTextProps {
  /** 起点颜色，写成 CSS 变量交给皮肤；不给则用品牌色族。 */
  from?: string
  /** 终点颜色，写成 CSS 变量交给皮肤；不给则用品牌色族。 */
  to?: string
  /** 渐变走向档位，缺省 to-right。 */
  direction?: GradientTextDirection
}

export interface GradientTextApi<T extends PropTypes = PropTypes> {
  getRootProps: () => T['element']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface GradientTextTranslations {}
