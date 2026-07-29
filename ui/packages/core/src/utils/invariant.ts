// 不变式断言。dev 下抛错/告警，prod 下静默。
import { isDev } from './dev'

export function invariant(condition: unknown, message: string): asserts condition {
  if (!condition && isDev())
    throw new Error(`[xh:invariant] ${message}`)
}

export function warn(condition: unknown, message: string): void {
  if (!condition && isDev())
    console.error(`[xh:warn] ${message}`)
}
