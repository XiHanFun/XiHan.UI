import type { ActionVariant, PropTypes, Size, Tone } from '@xihan-ui/kernel'

export interface ButtonProps {
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  /** 加载态：用 aria-disabled + 拦截事件表达，保留焦点。 */
  loading?: boolean
  /** 形态：solid / subtle / outline / ghost，决定颜色怎么用 */
  variant?: ActionVariant
  /** 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色 */
  tone?: Tone
  size?: Size
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

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface ButtonTranslations {}
