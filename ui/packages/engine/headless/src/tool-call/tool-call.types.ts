/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 tool call 类型契约。

import type { ControlVariant, MachineSchema, PropTypes, Size, Tone } from '@xihan-ui/core'

/**
 * 一次工具调用所处的阶段。
 *
 * 前两档与最后两档和 AI 协议中的工具状态四值同形，中间多出 `awaiting-approval` 一档：
 * 协议层的审批只改变审批状态、不改变工具状态，没有该档时等待批准会被视为运行中。
 */
export type ToolCallPhase
  = | 'input-streaming'
    | 'input-available'
    | 'awaiting-approval'
    | 'output-available'
    | 'output-error'

/** 该档是否视为运行中。等待批准是等待，不是运行。 */
export function isToolCallRunning(phase: ToolCallPhase): boolean {
  return phase === 'input-streaming'
}

/** 该档是否视为已落定。等待批准与运行中都未落定，出错也是一种落定。 */
export function isToolCallSettled(phase: ToolCallPhase): boolean {
  return phase === 'output-available' || phase === 'output-error'
}

/** 该档是否视为失败。 */
export function isToolCallErrored(phase: ToolCallPhase): boolean {
  return phase === 'output-error'
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
  /** 本次开合的来源：用户点击、阶段变化自动、或程序调用。 */
  source: 'user' | 'auto' | 'api'
}

export interface ToolCallSchema extends MachineSchema {
  props: {
    /** 本次调用正在运行。适配器用 isToolCallRunning(phase) 折叠得出，作者只写 phase。 */
    running?: boolean
    open?: boolean
    defaultOpen?: boolean
    /** 运行时自动展开、结束时自动收起，默认开启；用户手动开合过一次即永久停用。 */
    autoDisclosure?: boolean
    disabled?: boolean
    onOpenChange?: (details: ToolCallOpenChangeDetails) => void
  }
  context: {
    /**
     * 按压通道：trigger 被 Space / Enter 或触屏手指按住期间为 true，该部件投影 data-pressed。
     * 抬起、失焦、指针取消，或按住途中转为禁用时撤下；与开合和阶段互相独立。
     * 本机器同时服务 tool-call 与 reasoning，两家的 trigger 都读它。
     */
    pressed: boolean
  }
  computed: Record<string, never>
  refs: Record<string, never>
  state: 'auto.collapsed' | 'auto.expanded' | 'held.collapsed' | 'held.expanded'
  event:
    | { type: 'TOGGLE' }
    | { type: 'OPEN' }
    | { type: 'CLOSE' }
    /** 开始运行。只在 auto 分支上有转移，进入 held 后不再触及。 */
    | { type: 'PHASE.ACTIVE' }
    /** 运行完成。同上。 */
    | { type: 'PHASE.SETTLE' }
    // 受控回写：宿主改 open 后由 watch 派发，无条件跳转、不再通知
    | { type: 'CONTROLLED.OPEN' }
    | { type: 'CONTROLLED.CLOSE' }
    /** 按压通道（shared/press）：trigger 被 Space / Enter 或触屏按住。 */
    | { type: 'PRESS.START' }
    /** trigger 抬起、失焦或指针取消。 */
    | { type: 'PRESS.END' }
  tag: never
  guard: 'isOpenControlled' | 'isAutoAllowed' | 'isAutoEnabled' | 'canPress'
  action:
    | 'invokeOnUserOpen'
    | 'invokeOnUserClose'
    | 'invokeOnAutoOpen'
    | 'invokeOnAutoClose'
    | 'invokeOnApiOpen'
    | 'invokeOnApiClose'
    | 'syncOpen'
    | 'syncRunning'
    | 'startPress'
    | 'endPress'
    | 'releaseWhenInert'
  effect: never
}

/** 视图属性，经 connect 的第二个参数传入：它们与状态机无关，也不应经全局文案的状态机名分类。 */
export interface ToolCallProps {
  /** 本次调用所处的阶段，默认 input-available。 */
  phase?: ToolCallPhase
  /** 本次调用开始的时刻，毫秒时间戳。 */
  startTime?: number
  /** 本次调用结束的时刻。可能缺席：仍在运行，或流被中止时兜底收尾不写该字段。 */
  endTime?: number
  /** 形态：outline 描边、subtle 底色分区、ghost 无壳内联。默认 outline。 */
  variant?: ControlVariant
  tone?: Tone
  size?: Size
  translations?: Partial<ToolCallTranslations>
}

export interface ToolCallApi<T extends PropTypes = PropTypes> {
  open: boolean
  phase: ToolCallPhase
  /** 该档是否视为运行中。 */
  running: boolean
  /** 该档是否视为已落定：运行完成，或失败。 */
  settled: boolean
  /** 该档是否视为失败。 */
  errored: boolean
  disabled: boolean
  /** 读屏文案，由宿主写入会话级的播报区。 */
  statusText: string
  /** 运行时长，毫秒；两个时刻任一缺席即 undefined。 */
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
  /** 参数仍在传输。 */
  inputStreaming: string
  /** 参数已齐，等待运行。 */
  inputAvailable: string
  /** 等待批准。 */
  awaitingApproval: string
  /** 已完成。 */
  outputAvailable: string
  /** 出错。 */
  outputError: string
  /**
   * 运行时长，形如 `Ran for {seconds}s`。
   * 模板串由调用方现场代入，连接层不做插值。
   */
  ranFor: string
}

/** 由两个时刻计算时长；任一缺席、或倒序，都无法计算。 */
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
