import type { PropTypes } from '@xihan-ui/core'

export interface ButtonProps {
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  /** 加载态：用 aria-disabled + 拦截事件表达，保留焦点。 */
  loading?: boolean
  /** 形态：solid / subtle / outline / ghost，决定颜色怎么用 */
  variant?: string
  /** 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色 */
  tone?: string
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
