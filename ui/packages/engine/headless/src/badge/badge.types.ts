import type { PropTypes, Size, Tone } from '@xihan-ui/kernel'

/** 角标挂在宿主的哪个角上。取值与 badge.css 的选择器一一对应。 */
export type BadgePlacement = 'top-end' | 'top-start' | 'bottom-end' | 'bottom-start'

export interface BadgeProps {
  /**
   * 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。
   * 角标现实里主要用 danger（未读小红点）与 success / neutral（在线 / 离线点）。
   */
  tone?: Tone
  /** 尺寸：sm / md / lg。换的是圆点直径、两位数时的最小宽度与字号。 */
  size?: Size
  /** 挂在哪个角上，默认 top-end（右上角；rtl 下自动落到左上）。 */
  placement?: BadgePlacement
  /**
   * 计数。给了它角标就自己出数字，超过 max 写成「max+」。
   * 与 indicator 的默认插槽二选一：插槽有内容时以插槽为准。
   */
  count?: number
  /** 计数上限，默认 99：再多也只写 99+，免得角标被撑变形。 */
  max?: number
  /** 计数为 0 时是否照样显示，默认不显示——没有未读就不该有角标。 */
  showZero?: boolean
  /** 只出一个点，不出数字。给了它 count 只用来决定显不显示。 */
  dot?: boolean
  /**
   * 读屏怎么念这枚角标。
   * 角标挂在按钮、头像上时，光念数字听不出这是什么，得由宿主给出「3 条未读」这样的整句。
   */
  label?: string
}

export interface BadgeApi<T extends PropTypes = PropTypes> {
  /** 此刻该不该渲染：计数为 0 且没开 showZero 时为假。 */
  visible: boolean
  /** 算好的显示文本：超过 max 的写成「99+」；dot 模式与无 count 时为空串。 */
  text: string
  /** 锚点：被标记的那个东西（按钮、头像、标签页）放进它里面。 */
  getRootProps: () => T['element']
  /** 角标本身，绝对定位在 root 的某个角上。 */
  getIndicatorProps: () => T['element']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface BadgeTranslations {}
