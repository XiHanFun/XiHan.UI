// 定时副作用工具。用在 implementations.effects 里，返回值天然就是 cleanup。
// 延时事件命名约定：由定时器发出的事件必须命名为 after.<delayName>，delayName 与 prop 名一致。
import { isDev } from '@xihan-ui/core'
import { MachineError } from './errors'

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
    if (isDev())
      throw new MachineError('INVALID_DELAY', `delay must be a finite non-negative number, got ${delay}`)
    return () => {}
  }
  const id = setTimeout(fn, delay)
  return () => clearTimeout(id)
}

/** 周期副作用。与 setTimeoutEffect 同构。 */
export function setIntervalEffect(fn: () => void, ms: number | (() => number)): VoidFunction {
  const delay = resolveDelay(ms)
  if (!Number.isFinite(delay) || delay < 0) {
    if (isDev())
      throw new MachineError('INVALID_DELAY', `delay must be a finite non-negative number, got ${delay}`)
    return () => {}
  }
  const id = setInterval(fn, delay)
  return () => clearInterval(id)
}
