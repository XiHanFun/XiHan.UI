// 帧批处理器：把一帧内的多次调度合并成一次执行，无 rAF 时退化为 setTimeout。

/** 无 rAF 时的退化间隔，约合 60fps 的一帧。 */
const FALLBACK_FRAME_MS = 16

export interface FrameBatcherOptions {
  /** 自定义帧调度，默认 globalThis.requestAnimationFrame，缺席时用 setTimeout(fn, 16)。 */
  requestFrame?: (fn: () => void) => number
  cancelFrame?: (handle: number) => void
}

export interface FrameBatcher {
  /** 请求一次批处理，一帧内多次调用只执行一次。 */
  schedule: () => void
  /** 立刻执行待处理的批。 */
  flush: () => void
  cancel: () => void
}

export function createFrameBatcher(run: () => void, options?: FrameBatcherOptions): FrameBatcher {
  // 请求与取消成对选取同一套实现
  const nativeRaf = typeof globalThis.requestAnimationFrame === 'function'
    && typeof globalThis.cancelAnimationFrame === 'function'
  const requestFrame = options?.requestFrame
    ?? (nativeRaf
      ? (fn: () => void): number => globalThis.requestAnimationFrame(fn)
      : (fn: () => void): number => setTimeout(fn, FALLBACK_FRAME_MS))
  const cancelFrame = options?.cancelFrame
    ?? (nativeRaf
      ? (handle: number): void => globalThis.cancelAnimationFrame(handle)
      : (handle: number): void => clearTimeout(handle))

  let handle: number | null = null
  // 自增令牌，用于作废注入的 cancelFrame 没能取消掉的帧
  let token = 0

  const drop = (): void => {
    if (handle === null)
      return
    cancelFrame(handle)
    handle = null
    token += 1
  }

  const schedule = (): void => {
    if (handle !== null)
      return
    const current = token
    handle = requestFrame(() => {
      if (current !== token)
        return
      // 先清 handle 再执行，使 run 内部的 schedule 能排上下一帧
      handle = null
      run()
    })
  }

  const flush = (): void => {
    if (handle === null)
      return
    drop()
    run()
  }

  return { schedule, flush, cancel: drop }
}
