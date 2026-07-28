// 机器错误类型与错误码。
// 每条错误含：错误码 + 具体位置（状态路径/名字）+ 便于程序匹配的 code。

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
    | 'EVENT_LOOP'
    | 'SEND_BEFORE_MOUNT'
    | 'MISSING_SCOPE_ID'
    | 'MACHINE_CRASHED'
    | 'MISSING_ACTION'
    | 'MISSING_GUARD'
    | 'MISSING_EFFECT'
    | 'UNSTABLE_PROPS'
    | 'BAD_TARGET'

export class MachineError extends Error {
  readonly code: MachineErrorCode
  readonly machineName?: string
  constructor(code: MachineErrorCode, message: string, machineName?: string) {
    super(`[xh:machine:${code}]${machineName ? ` (${machineName})` : ''} ${message}`)
    this.name = 'MachineError'
    this.code = code
    this.machineName = machineName
  }
}
