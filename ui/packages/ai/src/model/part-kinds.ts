// 消息内容块的各种形态，以及它们的判别守卫。
// 判别键统一是 `type`，联合类型自身就是那张"有哪些块"的表，所以不再另存一份常量表。
import type { SourceDocumentPart, SourceUrlPart } from './source'

export interface TextPart {
  readonly type: 'text'
  readonly text: string
  /** 仍在生长：渲染层据此走"只重渲最后一块"的路径。 */
  readonly streaming?: boolean
}

export interface ReasoningPart {
  readonly type: 'reasoning'
  readonly text: string
  readonly streaming?: boolean
  /** 思考起止（毫秒时间戳），差值即"思考了多久"。由帧到达时刻推得，不在 reducer 内读时钟。 */
  readonly startTime?: number
  readonly endTime?: number
}

/** 工具调用四态是外部驱动的受控投影，不是本地状态机。 */
export type ToolState = 'input-streaming' | 'input-available' | 'output-available' | 'output-error'

/** 审批的外部事实态。提交中（approving/denying）是 UI 本地态，不进消息模型。 */
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
  /** 流式期的破碎 JSON 原文。渲染层只当字符串显示，绝不 JSON.parse。 */
  readonly rawInput: string
  /** 仅当 state !== 'input-streaming' 才有值。 */
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

/** Generative UI 与业务态载体。name 对齐协议的 data-<name>。 */
export interface DataPart {
  readonly type: 'data'
  readonly name: string
  readonly data: unknown
}

export interface StepStartPart {
  readonly type: 'step-start'
}

/** 流内错误。retryable 由宿主的 transport 映射填入，内核不自行判定。 */
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
