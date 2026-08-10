// normalize 与 reduce 之间的共享事件契约，各协议方言先归一到这一套事件。

import type { Role } from '../model/message'
import type { FilePart } from '../model/part-kinds'
import type { SourceDocumentPart, SourceUrlPart } from '../model/source'
import type { MessageMetadata } from '../model/usage'

/** 块标识，不透明字符串，由各方言在归一时自行拼出。 */
export type BlockKey = string & { readonly __brand: 'BlockKey' }

export const asBlockKey = (raw: string): BlockKey => raw as BlockKey

/** 归一后的事件联合，receivedTime 由 transport 打戳。 */
export type NormalizedEvent
  = | { kind: 'message-start', messageId: string, role: Role, receivedTime: number }
    | { kind: 'text-start', block: BlockKey, receivedTime: number }
    | { kind: 'text-delta', block: BlockKey, delta: string, receivedTime: number }
    | { kind: 'text-end', block: BlockKey, receivedTime: number }
    | { kind: 'reasoning-start', block: BlockKey, receivedTime: number }
    | { kind: 'reasoning-delta', block: BlockKey, delta: string, receivedTime: number }
    | { kind: 'reasoning-end', block: BlockKey, receivedTime: number }
    | { kind: 'tool-input-start', toolCallId: string, toolName: string, receivedTime: number }
    | { kind: 'tool-input-delta', toolCallId: string, delta: string, receivedTime: number }
    // 服务端未流式吐入参时不发 tool-input-start，工具名由本事件带来
    | { kind: 'tool-input-available', toolCallId: string, toolName?: string, input: unknown, receivedTime: number }
    | { kind: 'tool-output', toolCallId: string, output: unknown, receivedTime: number }
    | { kind: 'tool-error', toolCallId: string, errorText: string, receivedTime: number }
    | { kind: 'tool-approval-request', toolCallId: string, approvalId: string, isAutomatic: boolean, receivedTime: number }
    | { kind: 'source', part: SourceUrlPart | SourceDocumentPart, receivedTime: number }
    | { kind: 'file', part: FilePart, receivedTime: number }
    | { kind: 'data', name: string, data: unknown, transient: boolean, receivedTime: number }
    | { kind: 'step-start', receivedTime: number }
    | { kind: 'message-metadata', metadata: MessageMetadata, receivedTime: number }
    | { kind: 'error', errorText: string, retryable?: boolean, receivedTime: number }
    | { kind: 'finish', receivedTime: number }
    | { kind: 'abort', reason?: string, receivedTime: number }
