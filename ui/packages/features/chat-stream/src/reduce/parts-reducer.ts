// 把归一事件归约成一条消息：parts 只追加不改序，异常事件走警告并丢弃。
import type { Role, UIMessage } from '../model/message'
import type { ReasoningPart, TextPart, ToolPart, UIMessagePart } from '../model/part-kinds'
import type { BlockIndex, ToolIndex } from './block-registry'
import type { BlockKey, NormalizedEvent } from './events'
import { warn } from '@xihan-ui/core'
import { withEntry, withoutEntry } from './block-registry'

export interface ReduceState {
  readonly message: UIMessage
  readonly openBlocks: BlockIndex
  readonly openTools: ToolIndex
}

export function createReduceState(id: string, role: Role = 'assistant'): ReduceState {
  return {
    message: { id, role, parts: [] },
    openBlocks: new Map<BlockKey, number>(),
    openTools: new Map<string, number>(),
  }
}

/** 判断 part 是否为指定种类的生长中块。 */
function isGrowingPart(part: UIMessagePart | undefined, kind: 'text' | 'reasoning'): part is ReasoningPart | TextPart {
  return part !== undefined && part.type === kind
}

function replacePart(state: ReduceState, index: number, part: UIMessagePart): ReduceState {
  const parts = state.message.parts.slice()
  parts[index] = part
  return { ...state, message: { ...state.message, parts } }
}

function appendPart(state: ReduceState, part: UIMessagePart): ReduceState {
  return { ...state, message: { ...state.message, parts: [...state.message.parts, part] } }
}

function openBlock(state: ReduceState, block: BlockKey, part: ReasoningPart | TextPart): ReduceState {
  const index = state.message.parts.length
  const next = appendPart(state, part)
  return { ...next, openBlocks: withEntry(next.openBlocks, block, index) }
}

function growBlock(state: ReduceState, block: BlockKey, kind: 'text' | 'reasoning', delta: string): ReduceState {
  const index = state.openBlocks.get(block)
  if (index === undefined) {
    warn(false, `ai: ${kind} 增量落在已收尾或从未开始的块 ${block} 上，已丢弃`)
    return state
  }
  const part = state.message.parts[index]
  if (!isGrowingPart(part, kind)) {
    warn(false, `ai: 块 ${block} 的下标没指向 ${kind} 块，增量已丢弃`)
    return state
  }
  return replacePart(state, index, { ...part, text: part.text + delta })
}

/** 收尾一个块并从开放表移除；endTime 仅写入推理块，块不存在时静默返回。 */
function closeBlock(state: ReduceState, block: BlockKey, endTime?: number): ReduceState {
  const index = state.openBlocks.get(block)
  if (index === undefined)
    return state
  const openBlocks = withoutEntry(state.openBlocks, block)
  const part = state.message.parts[index]
  if (part === undefined || (part.type !== 'text' && part.type !== 'reasoning'))
    return { ...state, openBlocks }
  const closed = part.type === 'reasoning' && endTime !== undefined
    ? { ...part, streaming: false, endTime }
    : { ...part, streaming: false }
  return { ...replacePart(state, index, closed), openBlocks }
}

function patchTool(
  state: ReduceState,
  toolCallId: string,
  patch: (part: ToolPart) => ToolPart,
  close = false,
): ReduceState {
  const index = state.openTools.get(toolCallId)
  if (index === undefined) {
    warn(false, `ai: 工具调用 ${toolCallId} 不在进行中的调用表里，事件已丢弃`)
    return state
  }
  const part = state.message.parts[index]
  if (part === undefined || part.type !== 'tool') {
    warn(false, `ai: 工具调用 ${toolCallId} 的下标没指向 tool 块，事件已丢弃`)
    return state
  }
  const next = replacePart(state, index, patch(part))
  return close ? { ...next, openTools: withoutEntry(next.openTools, toolCallId) } : next
}

/** 收尾所有开着的块与工具调用，并清空两张开放表。 */
function closeAllBlocks(state: ReduceState): ReduceState {
  if (state.openBlocks.size === 0 && state.openTools.size === 0)
    return state
  const parts = state.message.parts.slice()
  for (const index of state.openBlocks.values()) {
    const part = parts[index]
    if (part !== undefined && (part.type === 'text' || part.type === 'reasoning'))
      parts[index] = { ...part, streaming: false }
  }
  // 没等到结果的工具调用一律标成 output-error，且不写 errorText。
  // 开放表清空后再没有事件能改写它们，漏掉任何一态都会让徽标永远停在运行中
  for (const index of state.openTools.values()) {
    const part = parts[index]
    if (part !== undefined && part.type === 'tool' && part.state !== 'output-available' && part.state !== 'output-error')
      parts[index] = { ...part, state: 'output-error' }
  }
  return {
    ...state,
    message: { ...state.message, parts },
    openBlocks: new Map<BlockKey, number>(),
    openTools: new Map<string, number>(),
  }
}

/** 把一条归一事件归约进状态，返回新状态。 */
export function reduceEvent(state: ReduceState, ev: NormalizedEvent): ReduceState {
  switch (ev.kind) {
    case 'message-start':
      return { ...state, message: { ...state.message, id: ev.messageId, role: ev.role } }

    case 'text-start':
      return openBlock(state, ev.block, { type: 'text', text: '', streaming: true })
    case 'text-delta':
      return growBlock(state, ev.block, 'text', ev.delta)
    case 'text-end':
      return closeBlock(state, ev.block)

    case 'reasoning-start':
      return openBlock(state, ev.block, { type: 'reasoning', text: '', streaming: true, startTime: ev.receivedTime })
    case 'reasoning-delta':
      return growBlock(state, ev.block, 'reasoning', ev.delta)
    case 'reasoning-end':
      return closeBlock(state, ev.block, ev.receivedTime)

    case 'tool-input-start': {
      const index = state.message.parts.length
      const next = appendPart(state, {
        type: 'tool',
        toolCallId: ev.toolCallId,
        toolName: ev.toolName,
        state: 'input-streaming',
        rawInput: '',
      })
      return { ...next, openTools: withEntry(next.openTools, ev.toolCallId, index) }
    }
    case 'tool-input-delta':
      // 流式期只累积 rawInput，不解析
      return patchTool(state, ev.toolCallId, part => ({ ...part, rawInput: part.rawInput + ev.delta }))
    case 'tool-input-available': {
      // 调用表里没有且帧上带了 toolName 时补建工具块；缺 toolName 则交由 patchTool 丢弃
      if (state.openTools.get(ev.toolCallId) === undefined && ev.toolName !== undefined) {
        const index = state.message.parts.length
        const next = appendPart(state, {
          type: 'tool',
          toolCallId: ev.toolCallId,
          toolName: ev.toolName,
          state: 'input-available',
          rawInput: '',
          input: ev.input,
        })
        return { ...next, openTools: withEntry(next.openTools, ev.toolCallId, index) }
      }
      return patchTool(state, ev.toolCallId, part => ({ ...part, input: ev.input, state: 'input-available' }))
    }
    case 'tool-output':
      return patchTool(state, ev.toolCallId, part => ({ ...part, output: ev.output, state: 'output-available' }), true)
    case 'tool-error':
      return patchTool(state, ev.toolCallId, part => ({ ...part, errorText: ev.errorText, state: 'output-error' }), true)
    case 'tool-approval-request':
      return patchTool(state, ev.toolCallId, part => ({
        ...part,
        approval: { approvalId: ev.approvalId, isAutomatic: ev.isAutomatic, status: 'pending' },
      }))

    case 'source':
      return appendPart(state, ev.part)
    case 'file':
      return appendPart(state, ev.part)

    case 'data':
      if (ev.transient) {
        // 瞬态数据由 store 分流到 onData，不进 parts
        warn(false, `ai: 瞬态 data 帧 ${ev.name} 不该进 reducer，已丢弃`)
        return state
      }
      return appendPart(state, { type: 'data', name: ev.name, data: ev.data })

    case 'step-start':
      return appendPart(state, { type: 'step-start' })

    case 'message-metadata':
      return { ...state, message: { ...state.message, metadata: ev.metadata } }

    case 'error':
      return appendPart(state, { type: 'error', errorText: ev.errorText, retryable: ev.retryable })

    // 结束与取消都只收尾开着的块，不追加 ErrorPart
    case 'finish':
    case 'abort':
      return closeAllBlocks(state)

    default:
      // 未知 kind 原样返回
      return state
  }
}
