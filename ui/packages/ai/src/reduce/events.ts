// 中间语：各家协议方言先归一到这一套事件，reducer 只认这一套。
// 这层单独成文件，是为了让 normalize 与 reduce 共享同一份契约，而不是 normalize 反向依赖 reducer 实现。

import type { Role } from '../model/message'
import type { FilePart } from '../model/part-kinds'
import type { SourceDocumentPart, SourceUrlPart } from '../model/source'
import type { MessageMetadata } from '../model/usage'

/**
 * 块标识。不透明字符串：禁止对它做数值运算，也禁止假设单调递增。
 *
 * 各方言的原始标识形态不同（v1 是字符串 id、Anthropic 是数字 index、
 * OpenAI Responses 是三段下标），归一时各自拼成一个字符串即可，本类型不关心怎么拼。
 */
export type BlockKey = string & { readonly __brand: 'BlockKey' }

export const asBlockKey = (raw: string): BlockKey => raw as BlockKey

/** receivedTime 由 transport 打戳，normalize 与 reducer 全程不读时钟。 */
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
    // toolName 可选：tool-input-start 只是前导帧，服务端不流式吐入参时压根不发它，
    // 那种情况下工具名只能从这一帧带过来，否则整条调用没法建
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
