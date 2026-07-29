// 帧批处理器：把一帧内的多次"状态变了"合并成一次发布。
//
// 流式增量按 token 到达，不合并就是每秒几十次全量重渲。
// rAF 从选项注入，本文件不碰 DOM：没有 rAF 的环境（SSR / node 测试）退化成 setTimeout。

/** 无 rAF 时的退化间隔，约等于 60fps 的一帧。 */
const FALLBACK_FRAME_MS = 16

export interface FrameBatcherOptions {
  /** 注入帧调度，测试用。默认 globalThis.requestAnimationFrame，缺席时退化为 setTimeout(fn, 16)。 */
  requestFrame?: (fn: () => void) => number
  cancelFrame?: (handle: number) => void
}

export interface FrameBatcher {
  /** 请求一次批处理；一帧内多次调用只跑一次。 */
  schedule: () => void
  /** 立刻跑掉待处理的批（流结束时用，别让最后一帧拖到下一帧）。 */
  flush: () => void
  cancel: () => void
}

export function createFrameBatcher(run: () => void, options?: FrameBatcherOptions): FrameBatcher {
  // 请求与取消必须成对，所以一次性决定用哪一套，不逐个回退
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
  // 宿主注入的 cancelFrame 有可能是空实现，取消不掉的帧靠这个自增令牌作废
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
      // 先清 handle 再跑：否则 run 内部再 schedule 会被当成"本帧已排队"吞掉
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
