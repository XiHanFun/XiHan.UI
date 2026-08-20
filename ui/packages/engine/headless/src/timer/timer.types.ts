import type { PropTypes, Size } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'

/** 一段数字的单位，也是条目上 data-unit 的取值。 */
export type TimerUnit = 'days' | 'hours' | 'minutes' | 'seconds' | 'milliseconds'

/** 四段状态：没起步 / 在走 / 停在半路 / 走到终点，同时是 data-state 的取值。 */
export type TimerPhase = 'idle' | 'running' | 'paused' | 'completed'

/** 起停按钮这一下要做的事，落成 control 上的 data-action。 */
export type TimerControlAction = 'start' | 'pause' | 'resume' | 'reset'

/** 拆开的五段。 */
export interface TimerSegments {
  /** 天。它是最大的一段，不再往上进位。 */
  days: number
  /** 时，0-23。天单独成段，所以这里满 24 就进位。 */
  hours: number
  /** 分，0-59。 */
  minutes: number
  /** 秒，0-59。 */
  seconds: number
  /** 毫秒，0-999。 */
  milliseconds: number
}

export interface TimerTickDetails {
  /** 这一拍该显示的毫秒。 */
  value: number
  /** 从起跑到这一拍累计走了多少毫秒，与方向和起始值无关。 */
  elapsed: number
}

export interface TimerCompleteDetails {
  /** 到点那一刻的显示值，恒等于终点值。 */
  value: number
  /** 这一轮总共走了多少毫秒。 */
  elapsed: number
}

/** 条目自报家门：它是哪一段。 */
export interface TimerItemProps {
  unit: TimerUnit
}

/** 读屏用的文案，默认英文。 */
export interface TimerTranslations {
  /** 时间区的名字：屏幕上只有几组数字与分隔符，读屏念不出哪一段是分、哪一段是秒。 */
  time: (segments: TimerSegments) => string
  /** 起停按钮在「没起步」时的名字：按钮里常常只有一个图标，读屏念不出这一下是做什么。 */
  start: string
  /** 起停按钮在「在走」时的名字。 */
  pause: string
  /** 起停按钮在「停在半路」时的名字。 */
  resume: string
  /** 起停按钮在「走到终点」时的名字。 */
  reset: string
}

export interface TimerSchema extends MachineSchema {
  props: {
    /** 起始值毫秒，缺省 0。正计时从它往上走，倒计时从它往下走。 */
    startMs?: number
    /**
     * 终点值毫秒。倒计时缺省 0；正计时不给它就一直走下去，没有终点也不会通知走完。
     * 终点落在起点的反方向（倒计时给了比起点还大的终点）时这一轮长度为 0：
     * 显示值停在起点上，一开跑就到点。
     */
    targetMs?: number
    /** 倒着走，缺省假。 */
    countdown?: boolean
    /** 挂载即开跑，缺省假。它只在挂载那一刻读一次，之后改它不再有作用。 */
    autoStart?: boolean
    /**
     * 刷新间隔毫秒，缺省 1000，下限一帧。
     * 它只决定数字多久跳一次；到点由另一个精确落在终点上的定时器判定，不受它影响。
     */
    interval?: number
    /** 尺寸：sm / md / lg。 */
    size?: Size
    translations?: Partial<TimerTranslations>
    /** 每一拍通知一次。到点那一拍只发 onComplete。 */
    onTick?: (details: TimerTickDetails) => void
    /** 走到终点通知一次；中途被暂停或归零不通知。 */
    onComplete?: (details: TimerCompleteDetails) => void
  }
  context: {
    /**
     * 累计已走毫秒。暂停、到点与每一拍都把当前这一段结算进来，
     * 继续时从它接着算，所以停停走走也不会把中间那段时间算丢或算重。
     */
    elapsed: number
  }
  computed: Record<string, never>
  refs: {
    /** 本段连续走动开始时的累计值。 */
    baseElapsed: number
    /** 本段连续走动的起跑时刻，取自单调时钟。 */
    startedAt: number
  }
  state: 'idle' | 'running' | 'paused' | 'completed'
  event:
    /** 从头开跑：累计清零。 */
    | { type: 'RUN.START' }
    /** 停在当前的累计值上。 */
    | { type: 'RUN.PAUSE' }
    /** 从累计值接着走。 */
    | { type: 'RUN.RESUME' }
    /** 归零并停下。 */
    | { type: 'RUN.RESET' }
    /** 到了一拍。 */
    | { type: 'CLOCK.TICK' }
    /** 到了终点。 */
    | { type: 'CLOCK.SETTLE' }
    /** 起止值或间隔被改写，时钟按新的这一轮重挂。 */
    | { type: 'CLOCK.SYNC' }
  tag: never
  guard: 'isSettled'
  action: 'clearElapsed' | 'invokeComplete' | 'invokeTick' | 'settleElapsed' | 'syncClock'
  effect: 'runClock'
}

export interface TimerApi<T extends PropTypes = PropTypes> {
  phase: TimerPhase
  /** 当前该显示的毫秒，已夹在起点与终点之间。 */
  value: number
  /** 累计走了多少毫秒，与方向和起始值无关。 */
  elapsed: number
  running: boolean
  paused: boolean
  completed: boolean
  countdown: boolean
  /** 显示值拆开的五段。 */
  segments: TimerSegments
  /** 某一段补零后的字面：天不补零，时分秒两位，毫秒三位。 */
  segmentText: (unit: TimerUnit) => string
  /** 起停按钮这一下要做的事。 */
  controlAction: TimerControlAction
  /** 起停按钮的读屏名字，也是按钮里没写内容时该显示的字。 */
  controlLabel: string
  /** 从头开跑。 */
  start: () => void
  pause: () => void
  resume: () => void
  /** 归零并停下。 */
  reset: () => void
  getRootProps: () => T['element']
  getAreaProps: () => T['element']
  getItemProps: (props: TimerItemProps) => T['element']
  getSeparatorProps: () => T['element']
  getControlProps: () => T['button']
}
