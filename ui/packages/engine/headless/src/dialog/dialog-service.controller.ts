/** 命令式对话框动作异常；保留原始原因，展示文案由适配器决定。 */
export interface DialogServiceActionError {
  cause: unknown
}

/** 核心只读取动作端口；标题、正文与框架节点等渲染数据由泛型原样携带。 */
export interface DialogServiceControllerSpec {
  onOk?: () => unknown
  onActionError?: (error: DialogServiceActionError) => void | Promise<void>
}

/** 一次请求的稳定身份。退出完成必须带回这份身份，迟到通知才不会串到下一项。 */
export interface DialogServiceRequest<TSpec> {
  readonly spec: TSpec
}

export interface DialogServiceControllerState<TSpec> {
  readonly current: DialogServiceRequest<TSpec> | null
  readonly exiting: DialogServiceRequest<TSpec> | null
  readonly open: boolean
  readonly busy: boolean
  readonly actionError: DialogServiceActionError | null
  readonly failure: { readonly cause: unknown } | null
}

export interface DialogServiceControllerOptions<TSpec> {
  /** 状态快照变化后通知宿主；DOM 与框架更新全部留在这个端口之外。 */
  onStateChange?: (state: DialogServiceControllerState<TSpec>) => void
}

export interface DialogServiceController<TSpec> {
  readonly state: DialogServiceControllerState<TSpec>
  /** 排队一次请求；Promise 在确认/取消当刻结算，不等待退场。 */
  request: (spec: TSpec) => Promise<boolean>
  /** 确认当前请求；动作返回 false 时保持打开，异常进入 actionError。 */
  confirmCurrent: () => Promise<void>
  /** 结算当前请求并开始退场。 */
  close: (accepted: boolean) => void
  /** 只完成给定请求的退场；返回是否真正推进了队列。 */
  finishExit: (request: DialogServiceRequest<TSpec> | null) => boolean
  /** 宿主失败：拒绝当前及排队请求，后续请求继续拒绝同一原因。 */
  fail: (cause: unknown) => void
  /** 卸载：当前及排队请求全部按取消结算。 */
  dispose: () => void
}

interface RequestEntry<TSpec> extends DialogServiceRequest<TSpec> {
  resolve: (accepted: boolean) => void
  reject: (cause: unknown) => void
  settled: boolean
  attempt: number
}

/**
 * 命令式 DialogService 的框架无关控制器。
 *
 * 队列、结算、退出身份、动作 attempt 与失败清场只在这里存在；适配器仅渲染 state，
 * 并在真实退出完成时把捕获的 request 身份交回 finishExit。
 */
export function createDialogServiceController<TSpec extends DialogServiceControllerSpec>(
  options: DialogServiceControllerOptions<TSpec> = {},
): DialogServiceController<TSpec> {
  const queue: RequestEntry<TSpec>[] = []
  let current: RequestEntry<TSpec> | null = null
  let exiting: RequestEntry<TSpec> | null = null
  let open = false
  let busy = false
  let actionError: DialogServiceActionError | null = null
  let failure: { cause: unknown } | null = null
  let disposed = false
  let state = snapshot()

  function snapshot(): DialogServiceControllerState<TSpec> {
    return { current, exiting, open, busy, actionError, failure }
  }

  function notify(): void {
    state = snapshot()
    options.onStateChange?.(state)
  }

  function next(): boolean {
    if (disposed || failure || current || queue.length === 0)
      return false
    current = queue.shift()!
    actionError = null
    busy = false
    open = true
    notify()
    return true
  }

  function settle(request: RequestEntry<TSpec>, accepted: boolean): boolean {
    if (request.settled)
      return false
    request.settled = true
    actionError = null
    request.resolve(accepted)
    return true
  }

  function reject(request: RequestEntry<TSpec>, cause: unknown): boolean {
    if (request.settled)
      return false
    request.settled = true
    actionError = null
    request.reject(cause)
    return true
  }

  function beginExit(request: RequestEntry<TSpec>): void {
    if (disposed || failure || current !== request)
      return
    exiting = request
    open = false
    notify()
  }

  function isAttemptActive(request: RequestEntry<TSpec>, attempt: number): boolean {
    return !disposed && !failure && current === request && !request.settled && request.attempt === attempt
  }

  const controller: DialogServiceController<TSpec> = {
    get state() {
      return state
    },
    request(spec) {
      if (failure)
        return Promise.reject(failure.cause)
      if (disposed)
        return Promise.reject(new Error('dialog 服务已卸载'))
      return new Promise<boolean>((resolve, rejectPromise) => {
        queue.push({ spec, resolve, reject: rejectPromise, settled: false, attempt: 0 })
        next()
      })
    },
    async confirmCurrent() {
      const request = current
      if (!request || request.settled || busy || disposed || failure)
        return
      const attempt = ++request.attempt
      actionError = null
      if (request.spec.onOk) {
        busy = true
        notify()
        if (!isAttemptActive(request, attempt))
          return
        try {
          const verdict = await request.spec.onOk()
          if (!isAttemptActive(request, attempt))
            return
          if (verdict === false) {
            busy = false
            notify()
            return
          }
        }
        catch (cause) {
          if (!isAttemptActive(request, attempt))
            return
          busy = false
          const error = { cause }
          actionError = error
          notify()
          if (!isAttemptActive(request, attempt))
            return
          try {
            await request.spec.onActionError?.(error)
          }
          catch (notificationCause) {
            if (isAttemptActive(request, attempt)) {
              reject(request, notificationCause)
              beginExit(request)
            }
          }
          return
        }
        busy = false
        notify()
      }
      if (isAttemptActive(request, attempt)) {
        settle(request, true)
        beginExit(request)
      }
    },
    close(accepted) {
      const request = current
      if (!request || disposed || failure)
        return
      settle(request, accepted)
      beginExit(request)
    },
    finishExit(request) {
      if (!request || disposed || failure || current !== request || exiting !== request || open)
        return false
      exiting = null
      current = null
      busy = false
      if (!next())
        notify()
      return true
    },
    fail(cause) {
      if (disposed || failure)
        return
      failure = { cause }
      const pending = current ? [current, ...queue.splice(0)] : queue.splice(0)
      for (const request of pending)
        reject(request, cause)
      current = null
      exiting = null
      actionError = null
      open = false
      busy = false
      notify()
    },
    dispose() {
      if (disposed)
        return
      disposed = true
      const pending = current ? [current, ...queue.splice(0)] : queue.splice(0)
      for (const request of pending)
        settle(request, false)
      current = null
      exiting = null
      actionError = null
      open = false
      busy = false
      notify()
    },
  }

  return controller
}
