// 不变式断言。两者都投递进诊断通道；invariant 在 dev 下额外抛错。
import { reportDiagnostic } from '../diagnostics/channel'
import { DIAGNOSTIC_CODES } from '../diagnostics/codes'
import { isDev } from './dev'

export function invariant(condition: unknown, message: string): asserts condition {
  if (condition)
    return
  reportDiagnostic({ code: DIAGNOSTIC_CODES.invariant, level: 'error', message })
  if (isDev())
    throw new Error(`[xh:invariant] ${message}`)
}

export function warn(condition: unknown, message: string): void {
  if (condition)
    return
  reportDiagnostic({ code: DIAGNOSTIC_CODES.warn, level: 'warn', message })
}
