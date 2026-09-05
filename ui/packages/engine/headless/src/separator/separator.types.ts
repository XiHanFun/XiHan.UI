import type { PropTypes } from '@xihan-ui/core'

export interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical'
  /** 装饰性分隔：仅视觉分组，不进无障碍树（role=none，无 aria-orientation）。 */
  decorative?: boolean
}

export interface SeparatorApi<T extends PropTypes = PropTypes> {
  getRootProps: () => T['element']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface SeparatorTranslations {}
