import type { ActionVariant, PropTypes, Size, Tone } from '@xihan-ui/core'

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
  /**
   * 只有图标：左右内距清零、宽高相等。宽度跟着当前尺寸档的高度走，
   * 不必把档位写进行内样式。图标按钮没有可见文字，作者须自行给可及名。
   */
  iconOnly?: boolean
  /**
   * 作者写在根节点上的可及名（aria-label / aria-labelledby）。
   * 宿主只把它们转告连接层，用来判断图标按钮有没有名字；属性本身仍由宿主写进根节点。
   */
  ariaLabel?: string
  ariaLabelledby?: string
  /** 撑满行宽：表单末尾的提交按钮与移动端常用。 */
  fullWidth?: boolean
  /**
   * 圆角档：rounded 是常规控件圆角，pill 是胶囊，square 是直角。
   * 缺省即跟着 --xh-shape-control 走，与不写这一项时逐值相同。
   */
  shape?: ButtonShape
  /**
   * 渲染成哪个标签，默认 button。
   * 写成 a 时不再产出 type 与原生 disabled（两者在链接上无效），禁用改由 aria-disabled 表达，
   * 点击仍被拦下。作者自行给 href。
   */
  as?: ButtonElement
}

/** 圆角档。 */
export type ButtonShape = 'rounded' | 'pill' | 'square'

/** 根节点渲染成哪个标签。 */
export type ButtonElement = 'button' | 'a'

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
