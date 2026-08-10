// 把 Data Stream v1 线格式的帧归一成内部事件：坏 JSON 与缺 type 产出 error 事件，
// 不认识的 type 返回 null。
import type { FilePart } from '../model/part-kinds'
import type { SourceDocumentPart, SourceUrlPart } from '../model/source'
import type { MessageMetadata } from '../model/usage'
import type { NormalizedEvent } from '../reduce/events'
import type { RawFrame } from '../transport/sse-reader'
import { isDict, warn } from '@xihan-ui/kernel'
import { asBlockKey } from '../reduce/events'

export const DATA_STREAM_DONE = '[DONE]'

const DATA_PREFIX = 'data-'

function readString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

function parseFailure(receivedTime: number): NormalizedEvent {
  return { kind: 'error', errorText: 'AI 流数据帧无法解析', retryable: false, receivedTime }
}

/** 归一单个原始帧，返回 null 表示该帧不对应任何内部事件。 */
export function normalizeDataStreamV1(frame: RawFrame): NormalizedEvent | null {
  const { receivedTime } = frame

  // 结束哨兵不是 JSON，在解析之前先认掉
  if (frame.data.trim() === DATA_STREAM_DONE)
    return { kind: 'finish', receivedTime }

  let raw: unknown
  try {
    raw = JSON.parse(frame.data)
  }
  catch {
    return parseFailure(receivedTime)
  }

  if (!isDict(raw))
    return parseFailure(receivedTime)

  const type = readString(raw.type)
  if (type === undefined)
    return parseFailure(receivedTime)

  switch (type) {
    case 'start':
      return { kind: 'message-start', messageId: readString(raw.messageId) ?? '', role: 'assistant', receivedTime }

    case 'text-start':
      return { kind: 'text-start', block: asBlockKey(readString(raw.id) ?? ''), receivedTime }
    case 'text-delta':
      return {
        kind: 'text-delta',
        block: asBlockKey(readString(raw.id) ?? ''),
        delta: readString(raw.delta) ?? '',
        receivedTime,
      }
    case 'text-end':
      return { kind: 'text-end', block: asBlockKey(readString(raw.id) ?? ''), receivedTime }

    case 'reasoning-start':
      return { kind: 'reasoning-start', block: asBlockKey(readString(raw.id) ?? ''), receivedTime }
    case 'reasoning-delta':
      return {
        kind: 'reasoning-delta',
        block: asBlockKey(readString(raw.id) ?? ''),
        delta: readString(raw.delta) ?? '',
        receivedTime,
      }
    case 'reasoning-end':
      return { kind: 'reasoning-end', block: asBlockKey(readString(raw.id) ?? ''), receivedTime }

    case 'tool-input-start':
      return {
        kind: 'tool-input-start',
        toolCallId: readString(raw.toolCallId) ?? '',
        toolName: readString(raw.toolName) ?? '',
        receivedTime,
      }
    case 'tool-input-delta':
      return {
        kind: 'tool-input-delta',
        toolCallId: readString(raw.toolCallId) ?? '',
        delta: readString(raw.inputTextDelta) ?? '',
        receivedTime,
      }
    case 'tool-input-available':
      return {
        kind: 'tool-input-available',
        toolCallId: readString(raw.toolCallId) ?? '',
        // 未流式吐入参时该帧是工具的首帧，工具名只在此出现
        toolName: readString(raw.toolName),
        input: raw.input,
        receivedTime,
      }
    case 'tool-output-available':
      return { kind: 'tool-output', toolCallId: readString(raw.toolCallId) ?? '', output: raw.output, receivedTime }
    case 'tool-output-error':
      return {
        kind: 'tool-error',
        toolCallId: readString(raw.toolCallId) ?? '',
        errorText: readString(raw.errorText) ?? '',
        receivedTime,
      }
    case 'tool-approval-request':
      return {
        kind: 'tool-approval-request',
        toolCallId: readString(raw.toolCallId) ?? '',
        approvalId: readString(raw.approvalId) ?? '',
        isAutomatic: raw.isAutomatic === true,
        receivedTime,
      }

    case 'source-url': {
      const part: SourceUrlPart = {
        type: 'source-url',
        sourceId: readString(raw.sourceId) ?? '',
        url: readString(raw.url) ?? '',
        title: readString(raw.title),
      }
      return { kind: 'source', part, receivedTime }
    }
    case 'source-document': {
      const part: SourceDocumentPart = {
        type: 'source-document',
        sourceId: readString(raw.sourceId) ?? '',
        title: readString(raw.title),
        mediaType: readString(raw.mediaType),
      }
      return { kind: 'source', part, receivedTime }
    }

    case 'file': {
      const part: FilePart = {
        type: 'file',
        url: readString(raw.url) ?? '',
        mediaType: readString(raw.mediaType) ?? '',
        filename: readString(raw.filename),
      }
      return { kind: 'file', part, receivedTime }
    }

    case 'start-step':
      return { kind: 'step-start', receivedTime }

    case 'message-metadata': {
      const metadata = isDict(raw.messageMetadata) ? raw.messageMetadata as MessageMetadata : {}
      return { kind: 'message-metadata', metadata, receivedTime }
    }

    // retryable 留空，由 transport 填
    case 'error':
      return { kind: 'error', errorText: readString(raw.errorText) ?? '', receivedTime }

    case 'abort':
      return { kind: 'abort', reason: readString(raw.reason), receivedTime }

    case 'finish':
      return { kind: 'finish', receivedTime }

    // 认得但无对应事件
    case 'finish-step':
      return null

    default: {
      if (type.startsWith(DATA_PREFIX)) {
        return {
          kind: 'data',
          name: type.slice(DATA_PREFIX.length),
          data: raw.data,
          transient: raw.transient === true,
          receivedTime,
        }
      }
      warn(false, `ai: Data Stream v1 出现不认识的帧类型 ${type}，已丢弃`)
      return null
    }
  }
}
