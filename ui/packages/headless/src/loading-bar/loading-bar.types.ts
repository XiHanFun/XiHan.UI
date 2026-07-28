import type { PropTypes } from '@xihan-ui/core'
import type { MachineSchema } from '@xihan-ui/machine'

/** 三段式：没在加载 / 在加载 / 冲到头正在淡出。也就是机器的全部状态与 data-state 的取值。 */
export type LoadingBarPhase = 'idle' | 'loading' | 'finishing'

export interface LoadingBarValueChangeDetails {
  /** 已经夹进 [0, 100] 的进度值。不确定进度时它是本组件编出来的数，不代表真实完成度。 */
  value: number
}

export interface LoadingBarTranslations {
  /** 读屏念出的名字。progressbar 没有可见标题，名字只能从这里来。 */
  root: string
}

export interface LoadingBarSchema extends MachineSchema {
  props: {
    /**
     * 受控进度值（0-100）。给了它就是**确定进度**：宽度照它显示，
     * 内部的爬升整个让位，机器一个字都不往里写。
     */
    value?: number
    /** 非受控初值，缺省 0。 */
    defaultValue?: number
    /**
     * 加载开关：true 开始，false 结束（冲到 100 再淡出归零）。
     * 只由宿主说了算，组件不会自己把它翻回去，因此没有配套的 onLoadingChange。
     */
    loading?: boolean
    /** 条子厚度：数字按像素，字符串按任意 CSS 长度。缺省 2px。 */
    height?: string | number
    /** 进度段颜色（任意 CSS 颜色）。不给就用皮肤的品牌色。 */
    color?: string
    /** 不确定进度时自行往前爬，默认开。关掉即停在起步值等宿主收尾。 */
    trickle?: boolean
    /** 爬升节拍毫秒，默认 200；<=0 或非有限数等同于关掉爬升。 */
    trickleSpeed?: number
    /** 起步值，默认 8：开始那一下先跳到这里。 */
    minimum?: number
    /** 冲到 100 之后留给淡出的窗口毫秒，默认 200。窗口走完才归零并收起。 */
    fadeDuration?: number
    translations?: Partial<LoadingBarTranslations>
    /**
     * 进度值变化。
     * 不确定进度下，每爬一步、冲到 100、归零都会通知一次：报的就是此刻画面上的宽度。
     */
    onValueChange?: (details: LoadingBarValueChangeDetails) => void
  }
  context: {
    /** 进度值。受控（value 给定）时 cell 直读 prop，内部写入只发 onValueChange。 */
    value: number
  }
  computed: Record<string, never>
  refs: Record<string, never>
  state: LoadingBarPhase
  event:
    /** loading prop 翻成 true，或淡出途中又开始加载。 */
    | { type: 'LOADING.START' }
    /** loading prop 翻成 false：冲到 100 进入淡出。 */
    | { type: 'LOADING.END' }
    /** 爬升参数（trickle / trickleSpeed / value）被改写，计时器要按新参数重挂。 */
    | { type: 'TRICKLE.SYNC' }
    /** 爬升节拍到点。 */
    | { type: 'after.trickleSpeed' }
    /** 淡出窗口走完，归零收起。 */
    | { type: 'after.fadeDuration' }
  tag: never
  guard: never
  action: 'syncLoading' | 'syncTrickle' | 'primeValue' | 'advanceValue' | 'completeValue' | 'resetValue'
  effect: 'trackTrickle' | 'waitForFade'
}

export interface LoadingBarApi<T extends PropTypes = PropTypes> {
  phase: LoadingBarPhase
  /** 当前显示的进度值（0-100，已夹取）。也是 range 的宽度百分比。 */
  value: number
  /** 条子当下露不露面：idle 之外都露面。 */
  visible: boolean
  /** 不确定进度：没给 value，宽度是爬出来的，读屏那边也就没有 aria-valuenow。 */
  indeterminate: boolean
  getRootProps: () => T['element']
  getTrackProps: () => T['element']
  getRangeProps: () => T['element']
}
