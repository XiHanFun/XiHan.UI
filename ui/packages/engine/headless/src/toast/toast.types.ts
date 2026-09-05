import type { MachineSchema, PropTypes } from '@xihan-ui/core'

/** 轻提示的语气。loading 例外：它表达"事情还没完"，不自动消失。 */
export type ToastType = 'info' | 'success' | 'warning' | 'error' | 'loading'

/**
 * 对外的三段式生命周期。
 * visible 在机器内部再分 running / paused 两个子态（计时器挂在 running 上），对外不区分。
 */
export type ToastStatus = 'visible' | 'dismissing' | 'unmounted'

/** 暂停来源。可同时有多个按住计时，最后一个松开才继续走。 */
export type ToastPauseSource = 'pointer' | 'focus' | 'page-idle' | 'api'

/** 那一摞落在视口的哪一格。第一段是纵向、第二段是横向（start/end 跟随文字方向）。 */
export type ToastPlacement
  = | 'top-start' | 'top' | 'top-end'
    | 'middle-start' | 'middle' | 'middle-end'
    | 'bottom-start' | 'bottom' | 'bottom-end'

/**
 * 服务档队列里存的一条，只放可搬运的纯数据（无回调、无 DOM）。
 * 没有 placement：一次操作的反馈该落在哪儿是整个服务的口径，不该逐条各去一处。
 */
export interface ToastRecord {
  id: string
  title?: string
  type?: ToastType
  duration?: number
  removeDelay?: number
  /**
   * 出不出关闭按钮。不写时由服务档的默认模板判断：到点自己走的不出，
   * 走不掉的（loading、duration 给 0）才出——那种条子没有叉就没有出口。
   */
  closable?: boolean
}

/** create 的入参：id 可省，省了就现生成一个并由 create 返回。 */
export type ToastOptions = Omit<ToastRecord, 'id'> & { id?: string }

export interface ToastStatusChangeDetails {
  /** 队列身份；未指定 id 时回落到实例 scope id。 */
  id: string
  status: ToastStatus
}

export interface ToastActionDetails {
  id: string
}

export interface ToastTranslations {
  close: string
}

export interface ToastSchema extends MachineSchema {
  props: {
    /** 队列身份。服务档用它做 create/update/dismiss 的寻址键。 */
    id?: string
    /** 标题文本；作者没在 title 部件里写内容时由适配器填入。 */
    title?: string
    /**
     * 补充说明。轻提示自己不出这一层——两层文本是 notification 的活；
     * 这条 prop 留着是因为 notification 的单条卡片复用同一台机器。
     */
    description?: string
    /** 语气，默认 info。error 走 alert + assertive，loading 不自动消失。 */
    type?: ToastType
    /** 停留毫秒，默认 5000。<=0 或非有限数即不自动消失。 */
    duration?: number
    /** 退场窗口毫秒，默认 200：进入 dismissing 后停留这么久再转 unmounted，留给退场动画。 */
    removeDelay?: number
    /** 是否显示可用的关闭按钮，默认 true。 */
    closable?: boolean
    /** 页面切到后台时暂停计时，默认 false。由服务档统一下发。 */
    pauseOnPageIdle?: boolean
    translations?: Partial<ToastTranslations>
    /** 生命周期落位时通知：dismissing 与 unmounted 各一次。宿主据此把条目移出队列。 */
    onStatusChange?: (details: ToastStatusChangeDetails) => void
    /** 操作按钮被按下。 */
    onAction?: (details: ToastActionDetails) => void
  }
  context: {
    /**
     * 还剩多少毫秒要走。暂停时把已经跑掉的一段扣掉，恢复时接着走剩下的。
     * Infinity 表示不自动消失。
     */
    remaining: number
    /** 当前按住计时的来源集合，空集即计时在走。 */
    pausedBy: ToastPauseSource[]
  }
  computed: Record<string, never>
  refs: Record<string, never>
  state: 'visible' | 'visible.running' | 'visible.paused' | 'dismissing' | 'unmounted'
  event:
    /** 立即进入退场（关闭按钮、宿主命令）。 */
    | { type: 'TOAST.DISMISS' }
    /** 操作按钮被按下：先发 onAction，再进入退场。 */
    | { type: 'TOAST.ACTION' }
    | { type: 'TOAST.PAUSE', src: ToastPauseSource }
    | { type: 'TOAST.RESUME', src: ToastPauseSource }
    /** 时长预算被改写（type / duration 变了），重算并重起计时器。 */
    | { type: 'TOAST.RESET' }
    | { type: 'after.duration' }
    | { type: 'after.removeDelay' }
  tag: never
  guard: 'isLastPauseSource'
  action:
    | 'addPauseSource'
    | 'removePauseSource'
    | 'resetDuration'
    | 'syncDuration'
    | 'invokeAction'
    | 'invokeDismissing'
    | 'invokeUnmounted'
  effect: 'trackDuration' | 'waitForRemoveDelay' | 'trackPageIdle'
}

export interface ToastApi<T extends PropTypes = PropTypes> {
  id: string
  status: ToastStatus
  type: ToastType
  title: string | undefined
  /** 计时被按住中。倒计时的可见反馈由使用者自己渲染，这个标记是留给他的钩子——自带皮肤不画。 */
  paused: boolean
  closable: boolean
  /** 剩余毫秒；不自动消失时为 Infinity。 */
  remaining: number
  dismiss: () => void
  pause: () => void
  resume: () => void
  getRootProps: () => T['element']
  getTitleProps: () => T['element']
  getActionTriggerProps: () => T['button']
  getCloseTriggerProps: () => T['button']
}
