// 机器错误类型与错误码（§3.4.5 API 全表）。
// 每条错误含：错误码 + 具体位置（状态路径/名字）+ 供文档锚点检索的 code。

export type MachineErrorCode
  = | 'DUPLICATE_STATE_ID'
    | 'ORPHAN_INITIAL'
    | 'MISSING_INITIAL'
    | 'BAD_INITIAL'
    | 'UNKNOWN_ACTION'
    | 'UNKNOWN_GUARD'
    | 'UNKNOWN_EFFECT'
    | 'INLINE_IMPL'
    | 'REDUNDANT_TAG'
    | 'INVALID_DELAY'
    | 'BAD_DELAY_EVENT'
    | 'TRACK_UNSTABLE_DEP'
    | 'IMPURE_COMPUTED'
    | 'WATCH_SIDE_EFFECT'
    | 'EVENT_LOOP_LIMIT'

export class MachineError extends Error {
  readonly code: MachineErrorCode
  constructor(code: MachineErrorCode, message: string) {
    super(`[xh:machine:${code}] ${message}`)
    this.name = 'MachineError'
    this.code = code
  }
}
