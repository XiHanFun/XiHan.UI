// 事件 → 消息的归约。
//
// 三条不变量决定了这里的每一处写法：
//   1. 单调追加：parts 只增不改序；已收尾的块永不被后续增量触及。
//   2. 工具入参守卫：流式期只碰 rawInput，只有 input-available 才写结构化 input。
//   3. transient 隔离：瞬态 data 不进 parts（store 已提前分流，这里只兜底）。
//
// 纯函数：不读时钟（时间戳一律来自事件的 receivedTime）、不做 IO、不抛。
// 任何异常态都走 dev 警告 + 丢弃，绝不让一帧坏数据打挂整条会话。
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

/** 文本与推理共用同一套"生长中的块"读写路径，判别只差一个 type 字面量。 */
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

/** endTime 只对推理块有意义；文本块不记时间。未命中静默——重复的 end 帧不值得报警。 */
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

/** 收尾所有还开着的块。流正常结束与被取消走同一条路：都只是"别再长了"。 */
function closeAllBlocks(state: ReduceState): ReduceState {
  if (state.openBlocks.size === 0 && state.openTools.size === 0)
    return state
  const parts = state.message.parts.slice()
  for (const index of state.openBlocks.values()) {
    const part = parts[index]
    if (part !== undefined && (part.type === 'text' || part.type === 'reasoning'))
      parts[index] = { ...part, streaming: false }
  }
  // 流断在工具调用中间：入参没吐完，这条调用不可能再有结果了。
  // 留在 input-streaming 会让界面一直转圈等一个永远不来的回包。
  // 不塞 errorText——措辞归渲染层，这里只如实标出「它没走完」，
  // errorText 为空正好把「流断了」与「服务端明确报的错」区分开
  for (const index of state.openTools.values()) {
    const part = parts[index]
    if (part !== undefined && part.type === 'tool' && part.state === 'input-streaming')
      parts[index] = { ...part, state: 'output-error' }
  }
  return {
    ...state,
    message: { ...state.message, parts },
    openBlocks: new Map<BlockKey, number>(),
    openTools: new Map<string, number>(),
  }
}

/** 纯函数。不读时钟、不做 IO、不抛（异常态 → dev 警告 + 丢弃，fail-closed）。 */
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
      // 只碰 rawInput：流式期的 JSON 是破碎的，parse 一定失败，parse 成功更可怕（半个对象）
      return patchTool(state, ev.toolCallId, part => ({ ...part, rawInput: part.rawInput + ev.delta }))
    case 'tool-input-available': {
      // tool-input-start 是可选前导帧。服务端一次性给出入参时只发这一帧，
      // 调用表里自然查不到——此时按帧上带的 toolName 现场补建，否则整条工具调用连同它的输出会全部消失。
      // 没有 toolName 就补不出来，仍旧走 patchTool 的丢弃路径（fail-closed，不造一个叫不出名字的工具）
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
        // store 会提前把瞬态数据分流到 onData，走到这里说明接线漏了
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

    // 取消是用户意图不是错误，所以不追加 ErrorPart，只把开着的块收尾
    case 'finish':
    case 'abort':
      return closeAllBlocks(state)

    default:
      // 类型上到不了这里；协议将来加了新 kind 时原样放行，别让旧客户端崩
      return state
  }
}
