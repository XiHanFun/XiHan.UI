import type { Tone } from '@xihan-ui/core'

export interface LoadingBarServiceControllerState {
  /** 当前在途任务数；恒为非负整数。 */
  readonly pending: number
  /** 当前收尾或加载语气。 */
  readonly tone: Tone
  /** 确定进度；undefined 表示交给 LoadingBar 自行爬升。 */
  readonly value: number | undefined
}

export interface LoadingBarServiceControllerOptions {
  /** 正常加载与收尾语气，缺省 brand。 */
  tone?: Tone
  /** error() 收尾语气，缺省 danger。 */
  errorTone?: Tone
  /** 状态快照变化后通知宿主。 */
  onStateChange?: (state: LoadingBarServiceControllerState) => void
}

export interface LoadingBarServiceController {
  readonly state: LoadingBarServiceControllerState
  start: () => void
  finish: () => void
  error: () => void
  finishAll: () => void
  set: (value: number) => void
  dispose: () => void
}

/** 命令式 LoadingBar 服务的框架无关计数与状态控制器。 */
export function createLoadingBarServiceController(
  options: LoadingBarServiceControllerOptions = {},
): LoadingBarServiceController {
  const tone = options.tone ?? 'brand'
  const errorTone = options.errorTone ?? 'danger'
  let pending = 0
  let currentTone = tone
  let value: number | undefined
  let disposed = false
  let state = snapshot()

  function snapshot(): LoadingBarServiceControllerState {
    return { pending, tone: currentTone, value }
  }

  function notify(): void {
    state = snapshot()
    options.onStateChange?.(state)
  }

  function settle(nextTone: Tone): void {
    if (disposed)
      return
    pending = 0
    currentTone = nextTone
    value = undefined
    notify()
  }

  return {
    get state() {
      return state
    },
    start() {
      if (disposed)
        return
      pending += 1
      currentTone = tone
      value = undefined
      notify()
    },
    finish() {
      if (disposed)
        return
      pending = Math.max(0, pending - 1)
      if (pending === 0)
        value = undefined
      notify()
    },
    error: () => settle(errorTone),
    finishAll: () => settle(tone),
    set(next) {
      if (disposed)
        return
      value = next
      notify()
    },
    dispose() {
      if (disposed)
        return
      disposed = true
      pending = 0
      value = undefined
      state = snapshot()
    },
  }
}
