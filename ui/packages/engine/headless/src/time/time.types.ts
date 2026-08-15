import type { PropTypes } from '@xihan-ui/kernel'
import type { TimeLocale, TimeType, TimeValue } from './time.format'

/** 根的三态：拿到了一个认得出的时刻 / 没给时刻 / 给了但认不出。 */
export type TimeState = 'ready' | 'empty' | 'invalid'

export interface TimeProps {
  /** 要显示的时刻。只写年月日的串按本地零点解读。 */
  value?: TimeValue
  /** 呈现方式：date 只到日、datetime 到秒、relative 说成「几分钟前」，缺省 datetime。 */
  type?: TimeType
  /**
   * 自定义格式串，记号是 YYYY / YY / MM / M / DD / D / HH / H / mm / m / ss / s。
   * 给了就顶掉该 locale 的缺省格式串；relative 型下只在退回绝对日期时用得上。
   */
  format?: string
  /** 用词：zh-CN 或 en，缺省 zh-CN。它只换给人看的文本，datetime 恒是同一种写法。 */
  locale?: TimeLocale
  /** 算相对说法时的参照时刻，缺省取当前时刻。给定后整个组件的产出完全由入参决定。 */
  now?: TimeValue
}

export interface TimeApi<T extends PropTypes = PropTypes> {
  /** 解析出的时刻；没给或认不出时为 undefined。 */
  date: Date | undefined
  /** 给人看的文本；没有可读时刻时是空串。 */
  text: string
  /** 写进 datetime 的那个戳；没有可读时刻时为 undefined，此时根上不写这个属性。 */
  stamp: string | undefined
  /** 当前状态。 */
  state: TimeState
  /** 这一次是不是真按相对说法念的。落在四档之外退回了绝对日期时为 false。 */
  relative: boolean
  getRootProps: () => T['element']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface TimeTranslations {}
