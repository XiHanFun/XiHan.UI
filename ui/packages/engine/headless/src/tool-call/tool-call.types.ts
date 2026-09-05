import type { MachineSchema, PropTypes, Size, Tone } from '@xihan-ui/core'

/**
 * 一次工具调用走到哪一步。
 *
 * 前两档与最后两档和 AI 协议里的工具状态四值同形，中间多出 `awaiting-approval` 一档：
 * 协议层的审批只改审批状态、不改工具状态，没有这一档的话「在等人批准」会被当成「在跑」。
 */
export type ToolCallPhase
  = | 'input-streaming'
    | 'input-available'
    | 'awaiting-approval'
    | 'output-available'
    | 'output-error'

/** 这一档算不算「正在跑」。等人批准是在等，不是在跑。 */
export function isToolCallRunning(phase: ToolCallPhase): boolean {
  return phase === 'input-streaming'
}

/** 阶段对应的语气，给徽章之类的纯样式联动用。 */
export function toneOfToolCallPhase(phase: ToolCallPhase): Tone {
  switch (phase) {
    case 'input-streaming':
      return 'info'
    case 'awaiting-approval':
      return 'warning'
    case 'output-available':
      return 'success'
    case 'output-error':
      return 'danger'
    default:
      return 'neutral'
  }
}

export interface ToolCallOpenChangeDetails {
  open: boolean
  /** 这一次开合是谁引起的：用户点的、阶段变化自动的，还是程序调的。 */
  source: 'user' | 'auto' | 'api'
}

export interface ToolCallSchema extends MachineSchema {
  props: {
    /** 这次调用正在跑。适配器用 isToolCallRunning(phase) 折出来，作者只写 phase。 */
    running?: boolean
    open?: boolean
    defaultOpen?: boolean
    /** 跑起来自动展开、结束自动收起，默认开；用户手动开合过一次即永久停用。 */
    autoDisclosure?: boolean
    disabled?: boolean
    onOpenChange?: (details: ToolCallOpenChangeDetails) => void
  }
  context: Record<string, never>
  computed: Record<string, never>
  refs: Record<string, never>
  state: 'auto.collapsed' | 'auto.expanded' | 'held.collapsed' | 'held.expanded'
  event:
    | { type: 'TOGGLE' }
    | { type: 'OPEN' }
    | { type: 'CLOSE' }
    /** 跑起来了。只在 auto 分支上有转移，进了 held 就再也够不着。 */
    | { type: 'PHASE.ACTIVE' }
    /** 跑完了。同上。 */
    | { type: 'PHASE.SETTLE' }
    // 受控回写：宿主改 open 后由 watch 派发，无条件跳转、不再通知
    | { type: 'CONTROLLED.OPEN' }
    | { type: 'CONTROLLED.CLOSE' }
  tag: never
  guard: 'isOpenControlled' | 'isAutoAllowed' | 'isAutoEnabled'
  action: 'invokeOnUserOpen' | 'invokeOnUserClose' | 'invokeOnAutoOpen' | 'invokeOnAutoClose' | 'invokeOnApiOpen' | 'invokeOnApiClose' | 'syncOpen' | 'syncRunning'
  effect: never
}

/** 视图属性，走 connect 的第二参：它们与机器无关，也不该经全局文案的机器名分桶。 */
export interface ToolCallProps {
  /** 这次调用走到哪一步，默认 input-available。 */
  phase?: ToolCallPhase
  /** 这次调用开始的时刻，毫秒时间戳。 */
  startTime?: number
  /** 这次调用结束的时刻。**可能缺席**：还在跑，或者流被中止时兜底收尾不写这一个。 */
  endTime?: number
  tone?: Tone
  size?: Size
  translations?: Partial<ToolCallTranslations>
}

export interface ToolCallApi<T extends PropTypes = PropTypes> {
  open: boolean
  phase: ToolCallPhase
  /** 这一档算不算在跑。 */
  running: boolean
  disabled: boolean
  /** 读屏用的一句话，由宿主写进会话级的那一个播报区。 */
  statusText: string
  /** 跑了多久，毫秒；两个时刻任一缺席即 undefined。 */
  durationMs: number | undefined
  setOpen: (next: boolean) => void
  getRootProps: () => T['element']
  getTriggerProps: () => T['button']
  getIndicatorProps: () => T['element']
  getLabelProps: () => T['element']
  getSummaryProps: () => T['element']
  getStatusProps: () => T['element']
  getDurationProps: () => T['element']
  getApprovalProps: () => T['element']
  getContentProps: () => T['element']
  getInputProps: () => T['element']
  getOutputProps: () => T['element']
  getErrorProps: () => T['element']
}

export interface ToolCallTranslations {
  /** 参数还在传。 */
  inputStreaming: string
  /** 参数齐了，等着跑。 */
  inputAvailable: string
  /** 等人批准。 */
  awaitingApproval: string
  /** 已完成。 */
  outputAvailable: string
  /** 出错了。 */
  outputError: string
  /**
   * 跑了多久，形如 `Ran for {seconds}s`。
   * 模板串由调用方现场代入，连接层不做插值。
   */
  ranFor: string
}

/** 两个时刻算时长；任一缺席、或倒着走，都算不出来。 */
export function toolCallDuration(startTime?: number, endTime?: number): number | undefined {
  if (startTime === undefined || endTime === undefined)
    return undefined
  const ms = endTime - startTime
  return Number.isFinite(ms) && ms >= 0 ? ms : undefined
}

/** 阶段对应的兜底播报文案。 */
export function toolCallStatusText(phase: ToolCallPhase, translations?: Partial<ToolCallTranslations>): string {
  switch (phase) {
    case 'input-streaming':
      return translations?.inputStreaming ?? 'Preparing…'
    case 'awaiting-approval':
      return translations?.awaitingApproval ?? 'Waiting for approval'
    case 'output-available':
      return translations?.outputAvailable ?? 'Completed'
    case 'output-error':
      return translations?.outputError ?? 'Failed'
    default:
      return translations?.inputAvailable ?? 'Running…'
  }
}
