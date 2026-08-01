// 定时副作用工具，用在 implementations.effects 里，返回值即 cleanup。
// 由定时器发出的事件命名为 after.<delayName>，delayName 与 prop 名一致。
import { raiseMachineError } from './errors'

function resolveDelay(ms: number | (() => number)): number {
  return typeof ms === 'function' ? ms() : ms
}

/**
 * 到点后执行一次（通常 send 一个 after.* 事件）。
 * @param fn 到点回调
 * @param ms 毫秒；可传 getter 以读取 prop
 */
export function setTimeoutEffect(fn: () => void, ms: number | (() => number)): VoidFunction {
  const delay = resolveDelay(ms)
  if (!Number.isFinite(delay) || delay < 0) {
    raiseMachineError('INVALID_DELAY', `delay must be a finite non-negative number, got ${delay}`)
    return () => {}
  }
  const id = setTimeout(fn, delay)
  return () => clearTimeout(id)
}

/** 按周期重复执行，返回值清除定时器。 */
export function setIntervalEffect(fn: () => void, ms: number | (() => number)): VoidFunction {
  const delay = resolveDelay(ms)
  if (!Number.isFinite(delay) || delay < 0) {
    raiseMachineError('INVALID_DELAY', `delay must be a finite non-negative number, got ${delay}`)
    return () => {}
  }
  const id = setInterval(fn, delay)
  return () => clearInterval(id)
}
