import type { StickToBottomHandle } from '@xihan-ui/behavior'
import type { PropTypes, RuntimeConfig } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'

export interface LogTranslations {
  /** 日志区的可访问名。 */
  log: string
  /** 回到底部按钮的可访问名。 */
  scrollToBottom: string
}

export interface LogStickChangeDetails {
  atBottom: boolean
  sticking: boolean
}

// 由适配器在挂载前填入；缺省时粘底副作用不挂载。
export interface LogRefs {
  config: RuntimeConfig | null
  /** overflow:auto 的滚动容器。 */
  getViewportEl: () => HTMLElement | null
  /** 内容包裹层，作为尺寸变化的观察目标。 */
  getContentEl: () => HTMLElement | null
  /** 粘底句柄，由 trackStickToBottom 效应装填，卸载时置空。 */
  stick: StickToBottomHandle | null
}

/** 机器只管粘底：行数、载入态与文案都是视图属性，走 connect 的第二参。 */
export interface LogSchema extends MachineSchema {
  props: {
    /** 距底多少 px 视为在底，缺省用粘底原语的默认值。 */
    threshold?: number
    /** 粘底状态变化时通知宿主。 */
    onStickChange?: (details: LogStickChangeDetails) => void
  }
  context: {
    /** 当前滚动位置是否落在底部阈值内。 */
    atBottom: boolean
    /** 内容增长时是否自动跟到底，用户上滚后为 false。 */
    sticking: boolean
  }
  computed: Record<string, never>
  refs: LogRefs
  state: 'idle'
  event:
    /** 句柄回报的粘底状态变化，是 context 中两个布尔的唯一写入口。 */
    | { type: 'STICK.CHANGE', atBottom: boolean, sticking: boolean }
    /** 滚到底部并恢复粘附。 */
    | { type: 'SCROLL_TO_BOTTOM' }
  tag: never
  guard: never
  action: 'setStickState' | 'invokeScrollToBottom'
  effect: 'trackStickToBottom'
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
  /** 是否显示回到底部按钮，不在底部时为 true。 */
  showScrollButton: boolean
  /** 滚到底部并恢复粘附。 */
  scrollToBottom: () => void
  getRootProps: () => T['element']
  getViewportProps: () => T['element']
  getContentProps: () => T['element']
  getLineProps: () => T['element']
  getScrollButtonProps: () => T['button']
  getLiveRegionProps: () => T['element']
}
