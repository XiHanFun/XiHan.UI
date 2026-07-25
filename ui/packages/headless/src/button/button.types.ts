import type { PropTypes } from '@xihan-ui/core'

export interface ButtonProps {
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  /** 加载态：用 aria-disabled + 拦截事件表达，不用原生 disabled（保留焦点）。 */
  loading?: boolean
  variant?: string
  size?: string
}

export interface ButtonApi<T extends PropTypes = PropTypes> {
  disabled: boolean
  loading: boolean
  getRootProps: () => T['button']
  getLabelProps: () => T['element']
  getIndicatorProps: () => T['element']
  getPrefixProps: () => T['element']
  getSuffixProps: () => T['element']
}
