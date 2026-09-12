import type { PropTypes } from '@xihan-ui/core'

/** 线怎么画：材质自适应默认线 / 低对比弱线 / 高对比强线。与业务语气无关。 */
export type SeparatorVariant = 'default' | 'strong' | 'subtle'

/** 分节文字落在哪一侧。仅在渲染了 content 时生效。 */
export type SeparatorAlign = 'center' | 'end' | 'start'

export interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical'
  /** 装饰性分隔：仅视觉分组，root 通过 role=none + aria-hidden 完整退出无障碍树。 */
  decorative?: boolean
  /** 线怎么画，缺省 default；缺省档不输出 data-variant。 */
  variant?: SeparatorVariant
  /** 画成虚线；实线段与空白段的长度走 --xh-separator-dash-length / -dash-gap 两个槽。 */
  dashed?: boolean
  /** 分节文字落在哪一侧，缺省居中；缺省档不输出 data-align。 */
  align?: SeparatorAlign
}

export interface SeparatorApi<T extends PropTypes = PropTypes> {
  getRootProps: () => T['element']
  getLineProps: () => T['element']
  getContentProps: () => T['element']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface SeparatorTranslations {}
