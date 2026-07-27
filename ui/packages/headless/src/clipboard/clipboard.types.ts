import type { PropTypes } from '@xihan-ui/core'
import type { MachineSchema } from '@xihan-ui/machine'

/**
 * 复制状态。
 *
 * copying 是"写入还在路上"的过渡态：往系统剪贴板写是异步的，而且真的会失败
 * （非安全上下文、权限被拒、环境根本没有这个接口）。乐观地一点就跳 copied，
 * 失败时界面已经说了"复制好了"，撤不回来。
 */
export type ClipboardStatus = 'idle' | 'copying' | 'copied'

export interface ClipboardStatusChangeDetails {
  status: ClipboardStatus
}

export interface ClipboardCopyErrorDetails {
  /** 写入失败的原因：权限被拒或非安全上下文时是浏览器给的拒绝值，接口缺席时是本组件合成的 Error。 */
  error: unknown
  /** 这一次试图写进剪贴板的文本。 */
  value: string
}

/** 指示器的调用方声明：作者写两个指示器，各自说明自己属于哪一侧。 */
export interface ClipboardIndicatorProps {
  /** true = 复制成功那一侧的标记（对钩），false = 平时那一侧（复制图标）。 */
  copied: boolean
}

export interface ClipboardSchema extends MachineSchema {
  props: {
    /** 要复制的文本；缺省即复制空串。 */
    value?: string
    /** 复制成功后指示器保持多久（毫秒），默认 3000；<=0 或非有限数表示不自动回落。 */
    timeout?: number
    /** 状态每次落位时通知一次；挂载那一刻的 idle 是初始态，不通知。 */
    onStatusChange?: (details: ClipboardStatusChangeDetails) => void
    /** 写入失败时通知；此时状态已经回到 idle，界面上不会留下"复制成功"的假象。 */
    onCopyError?: (details: ClipboardCopyErrorDetails) => void
  }
  context: Record<string, never>
  computed: Record<string, never>
  refs: Record<string, never>
  state: ClipboardStatus
  event:
    /** 用户点了复制按钮，或作者调 api.copy()。写入在途时（copying）不接，避免同一次点击写两遍。 */
    | { type: 'COPY.TRIGGER' }
    /** 写入 promise 兑现，由 copying 的副作用回送。 */
    | { type: 'COPY.SUCCESS' }
    /** 写入 promise 拒绝，由 copying 的副作用回送，带上原始拒绝值。 */
    | { type: 'COPY.ERROR', error: unknown }
    /** 停留计时到点，指示器该收回去了。 */
    | { type: 'after.timeout' }
  tag: never
  guard: never
  action: 'invokeCopying' | 'invokeCopied' | 'invokeIdle' | 'invokeCopyError'
  effect: 'writeValue' | 'trackTimeout'
}

export interface ClipboardApi<T extends PropTypes = PropTypes> {
  status: ClipboardStatus
  /** 已经复制成功且还在停留窗口内。指示器与样式的唯一判据。 */
  copied: boolean
  /** 当前要复制的文本（prop 缺省时是空串）。 */
  value: string
  /** 走一次复制意图，与点按钮同一条路。 */
  copy: () => void
  getRootProps: () => T['element']
  getLabelProps: () => T['label']
  getControlProps: () => T['element']
  getInputProps: () => T['input']
  getTriggerProps: () => T['button']
  getIndicatorProps: (props: ClipboardIndicatorProps) => T['element']
}
