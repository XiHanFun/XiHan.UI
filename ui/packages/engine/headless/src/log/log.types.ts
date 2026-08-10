import type { PropTypes } from '@xihan-ui/kernel'

export interface LogTranslations {
  /** 日志区的可访问名。 */
  log: string
}

export interface LogProps {
  /** 视口按多少行定高；缺省时高度由皮肤给。 */
  rows?: number
  /** 行还在路上：日志区报 aria-busy，根落 data-loading。 */
  loading?: boolean
  translations?: Partial<LogTranslations>
}

export interface LogApi<T extends PropTypes = PropTypes> {
  /** 取整后的行数；rows 缺席或不是正数时为 undefined。 */
  rows: number | undefined
  loading: boolean
  /** 当前滚动位置是否落在底部阈值内。 */
  atBottom: boolean
  /** 新行进来时是否自动跟到底。 */
  sticking: boolean
  /** 滚到底部并恢复粘附。 */
  scrollToBottom: () => void
  getRootProps: () => T['element']
  getViewportProps: () => T['element']
  getContentProps: () => T['element']
  getLineProps: () => T['element']
}
