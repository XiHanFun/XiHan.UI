// 机器错误类型与错误码，以及投递进诊断通道的入口。
import { DIAGNOSTIC_CODES, isDev, reportDiagnostic } from '../kernel'

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

/** 投递进诊断通道，dev 下额外抛出；prod 下不抛，由订阅方决定怎么处置。 */
export function raiseMachineError(code: MachineErrorCode, message: string, machineName?: string): void {
  const error = new MachineError(code, message, machineName)
  reportDiagnostic({
    code: DIAGNOSTIC_CODES.machineError,
    level: 'error',
    message: error.message,
    scope: machineName,
    detail: { machineCode: code },
  })
  if (isDev())
    throw error
}

/** 上报机器在停机时携带的崩溃原因。 */
export function reportMachineCrash(reason: unknown, machineName?: string): void {
  reportDiagnostic({
    code: DIAGNOSTIC_CODES.machineError,
    level: 'error',
    message: reason instanceof Error ? reason.message : String(reason),
    scope: machineName,
    detail: { machineCode: 'MACHINE_CRASHED' satisfies MachineErrorCode },
  })
}
