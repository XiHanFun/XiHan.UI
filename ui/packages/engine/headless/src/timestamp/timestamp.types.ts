import type { PropTypes } from '@xihan-ui/kernel'
import type { TimestampType, TimestampValue } from './timestamp.format'

/** 根的三态：拿到了一个认得出的时刻 / 没给时刻 / 给了但认不出。 */
export type TimestampState = 'ready' | 'empty' | 'invalid'

export interface TimestampProps {
  /** 要显示的时刻。只写年月日的串按本地零点解读。 */
  value?: TimestampValue
  /** 呈现方式：date 只到日、datetime 到秒、relative 说成「几分钟前」，缺省 datetime。 */
  type?: TimestampType
  /**
   * 自定义格式串，记号是 YYYY / YY / MM / M / DD / D / HH / H / mm / m / ss / s。
   * 给了就顶掉该 locale 的缺省格式串；relative 型下只在退回绝对日期时用得上。
   */
  format?: string
  /**
   * BCP 47 语言标记，决定用词与缺省格式串：zh 开头用中文那套，其余一律英文。
   * 不给按宿主语言，宿主也没有时按 en-US。它只换给人看的文本，datetime 恒是同一种写法。
   */
  locale?: string
  /** 算相对说法时的参照时刻，缺省取当前时刻。给定后整个组件的产出完全由入参决定。 */
  now?: TimestampValue
}

export interface TimestampApi<T extends PropTypes = PropTypes> {
  /** 解析出的时刻；没给或认不出时为 undefined。 */
  date: Date | undefined
  /** 给人看的文本；没有可读时刻时是空串。 */
  text: string
  /** 写进 datetime 的那个戳；没有可读时刻时为 undefined，此时根上不写这个属性。 */
  stamp: string | undefined
  /** 当前状态。 */
  state: TimestampState
  /** 这一次是不是真按相对说法念的。落在四档之外退回了绝对日期时为 false。 */
  relative: boolean
  getRootProps: () => T['element']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface TimestampTranslations {}
