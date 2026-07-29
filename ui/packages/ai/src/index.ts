// @xihan-ui/ai 的公开出口：消息模型、Data Stream v1 归一、parts 归约、会话容器与 SSE 传输。

export type { ChatRequest, Role, UIMessage } from './model/message'
export {
  isDataPart,
  isErrorPart,
  isFilePart,
  isReasoningPart,
  isSourcePart,
  isTextPart,
  isToolPart,
} from './model/part-kinds'
export type {
  DataPart,
  ErrorPart,
  FilePart,
  ReasoningPart,
  StepStartPart,
  TextPart,
  ToolApprovalState,
  ToolApprovalStatus,
  ToolPart,
  ToolState,
  UIMessagePart,
} from './model/part-kinds'
export type { CitationAnchor, SourceDocumentPart, SourcePart, SourceUrlPart } from './model/source'
export type { CostBreakdown, MessageMetadata, TokenUsage } from './model/usage'
export { DATA_STREAM_DONE, normalizeDataStreamV1 } from './normalize/datastream-v1'
export type { BlockIndex, ToolIndex } from './reduce/block-registry'
export { withEntry, withoutEntry } from './reduce/block-registry'
export { asBlockKey } from './reduce/events'
export type { BlockKey, NormalizedEvent } from './reduce/events'
export { createReduceState, reduceEvent } from './reduce/parts-reducer'
export type { ReduceState } from './reduce/parts-reducer'
export { createThreadStore } from './store/thread-store'
export type { ThreadSnapshot, ThreadStatus, ThreadStore, ThreadStoreOptions } from './store/thread-store'
export { createFrameBatcher } from './store/throttle'
export type { FrameBatcher, FrameBatcherOptions } from './store/throttle'
export { TYPEWRITER_DEFAULT_CHARS_PER_SEC, visibleLength } from './store/typewriter'
export type { TypewriterOpts } from './store/typewriter'
export { createHttpSseTransport, DATA_STREAM_HEADER, DATA_STREAM_VERSION } from './transport/http-sse'
export type { HttpSseTransportOptions } from './transport/http-sse'
export { createSseReader } from './transport/sse-reader'
export type { RawFrame, SseReaderOptions } from './transport/sse-reader'
export type { Transport } from './transport/transport'
