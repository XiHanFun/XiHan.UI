// 消息内容块的各种形态及其判别守卫，判别键统一为 `type`。
import type { SourceDocumentPart, SourceUrlPart } from './source'

export interface TextPart {
  readonly type: 'text'
  readonly text: string
  /** 该块是否仍在流式增长。 */
  readonly streaming?: boolean
}

export interface ReasoningPart {
  readonly type: 'reasoning'
  readonly text: string
  readonly streaming?: boolean
  /** 思考起止的毫秒时间戳，取自帧到达时刻。 */
  readonly startTime?: number
  readonly endTime?: number
}

/** 工具调用的四种外部状态。 */
export type ToolState = 'input-streaming' | 'input-available' | 'output-available' | 'output-error'

/** 工具审批状态。 */
export type ToolApprovalStatus = 'pending' | 'approved' | 'denied' | 'expired'

export interface ToolApprovalState {
  readonly approvalId: string
  readonly isAutomatic: boolean
  readonly status: ToolApprovalStatus
  readonly reason?: string
}

export interface ToolPart {
  readonly type: 'tool'
  readonly toolCallId: string
  readonly toolName: string
  readonly state: ToolState
  /** 流式期累积的入参 JSON 原文。 */
  readonly rawInput: string
  /** 解析后的入参，仅当 state !== 'input-streaming' 时有值。 */
  readonly input?: unknown
  readonly output?: unknown
  readonly errorText?: string
  readonly approval?: ToolApprovalState
}

export interface FilePart {
  readonly type: 'file'
  readonly url: string
  readonly mediaType: string
  readonly filename?: string
}

/** 自定义数据块，name 对应协议的 data-<name>。 */
export interface DataPart {
  readonly type: 'data'
  readonly name: string
  readonly data: unknown
}

export interface StepStartPart {
  readonly type: 'step-start'
}

/** 流内错误块，retryable 由传输层填入。 */
export interface ErrorPart {
  readonly type: 'error'
  readonly errorText: string
  readonly retryable?: boolean
}

export type UIMessagePart
  = | TextPart
    | ReasoningPart
    | ToolPart
    | SourceUrlPart
    | SourceDocumentPart
    | FilePart
    | DataPart
    | StepStartPart
    | ErrorPart

export function isTextPart(part: UIMessagePart): part is TextPart {
  return part.type === 'text'
}

export function isReasoningPart(part: UIMessagePart): part is ReasoningPart {
  return part.type === 'reasoning'
}

export function isToolPart(part: UIMessagePart): part is ToolPart {
  return part.type === 'tool'
}

export function isSourcePart(part: UIMessagePart): part is SourceUrlPart | SourceDocumentPart {
  return part.type === 'source-url' || part.type === 'source-document'
}

export function isFilePart(part: UIMessagePart): part is FilePart {
  return part.type === 'file'
}

export function isDataPart(part: UIMessagePart): part is DataPart {
  return part.type === 'data'
}

export function isErrorPart(part: UIMessagePart): part is ErrorPart {
  return part.type === 'error'
}
