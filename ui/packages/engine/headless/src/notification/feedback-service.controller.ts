export interface FeedbackServiceRecord {
  id?: string
}

/** 记录队列仍由 notificationMachine 持有；控制器只经这个端口调用它。 */
export interface FeedbackServiceQueue<TCreate extends FeedbackServiceRecord, TUpdate> {
  create: (options: TCreate) => string
  update: (id: string, options: TUpdate) => void
  dismiss: (id: string) => void
  dismissAll: () => void
}

export interface FeedbackServiceControllerState {
  /** 服务级暂停，与单条的指针/焦点暂停并存。 */
  readonly paused: boolean
}

export interface FeedbackServiceControllerOptions {
  /** 用于已卸载错误，例如 toast / notification。 */
  name: string
  /** Toast 使用自己的稳定前缀；Notification 留给 notificationMachine 生成 id。 */
  idPrefix?: string
  /** 单条退场后是否还要经队列端口删除记录，缺省需要。 */
  dismissOnUnmounted?: boolean
  /** 服务级暂停变化后通知宿主重渲或 paint。 */
  onStateChange?: (state: FeedbackServiceControllerState) => void
}

export interface FeedbackServiceController<TCreate extends FeedbackServiceRecord, TUpdate> {
  readonly state: FeedbackServiceControllerState
  attach: (queue: FeedbackServiceQueue<TCreate, TUpdate> | null) => void
  create: (options: TCreate, onAction?: () => void) => string
  update: (id: string, options: TUpdate) => void
  dismiss: (id: string) => void
  dismissAll: () => void
  /** 队列因 max/priority 挤条后，用实际存活 id 回收孤立动作。 */
  syncItems: (ids: Iterable<string>) => void
  /** 单条真实退场完成：清动作表，并按宿主队列形态决定是否补删记录。 */
  unmounted: (id: string) => void
  invokeAction: (id: string) => void
  pauseAll: () => void
  resumeAll: () => void
  /** 已求值的 Promise 三态；input 函数的调用时机仍由公开适配器合同决定。 */
  trackPromise: <T>(
    input: Promise<T>,
    loading: TCreate,
    success: (value: T) => TUpdate,
    error: (reason: unknown) => TUpdate,
    onAction?: () => void,
  ) => Promise<T>
  dispose: () => void
}

/** Toast 与 Notification 命令式服务共享的框架无关生命周期控制器。 */
export function createFeedbackServiceController<TCreate extends FeedbackServiceRecord, TUpdate>(
  options: FeedbackServiceControllerOptions,
): FeedbackServiceController<TCreate, TUpdate> {
  let queue: FeedbackServiceQueue<TCreate, TUpdate> | null = null
  const actions = new Map<string, () => void>()
  let paused = false
  let disposed = false
  let sequence = 0
  let state = snapshot()

  function snapshot(): FeedbackServiceControllerState {
    return { paused }
  }

  function notify(): void {
    state = snapshot()
    options.onStateChange?.(state)
  }

  function useQueue(): FeedbackServiceQueue<TCreate, TUpdate> | null {
    if (disposed)
      throw new Error(`${options.name} 服务已卸载`)
    return queue
  }

  function create(record: TCreate, onAction?: () => void): string {
    const current = useQueue()
    if (!current)
      return ''
    const next = options.idPrefix && record.id == null
      ? { ...record, id: `${options.idPrefix}-${++sequence}` }
      : record
    const id = current.create(next)
    if (onAction)
      actions.set(id, onAction)
    return id
  }

  const controller: FeedbackServiceController<TCreate, TUpdate> = {
    get state() {
      return state
    },
    attach(next) {
      if (!disposed)
        queue = next
    },
    create,
    update(id, patch) {
      useQueue()?.update(id, patch)
    },
    dismiss(id) {
      const current = useQueue()
      if (!current)
        return
      actions.delete(id)
      current.dismiss(id)
    },
    dismissAll() {
      const current = useQueue()
      if (!current)
        return
      actions.clear()
      current.dismissAll()
    },
    syncItems(ids) {
      if (disposed)
        return
      const living = new Set(ids)
      for (const id of actions.keys()) {
        if (!living.has(id))
          actions.delete(id)
      }
    },
    unmounted(id) {
      actions.delete(id)
      if (!disposed && (options.dismissOnUnmounted ?? true))
        queue?.dismiss(id)
    },
    invokeAction(id) {
      if (!disposed)
        actions.get(id)?.()
    },
    pauseAll() {
      if (!useQueue())
        return
      paused = true
      notify()
    },
    resumeAll() {
      if (!useQueue())
        return
      paused = false
      notify()
    },
    trackPromise(input, loading, success, error, onAction) {
      if (!useQueue())
        return input
      const id = create(loading, onAction)
      return input.then(
        (value) => {
          if (!disposed)
            queue?.update(id, success(value))
          return value
        },
        (reason: unknown) => {
          if (!disposed)
            queue?.update(id, error(reason))
          throw reason
        },
      )
    },
    dispose() {
      if (disposed)
        return
      disposed = true
      queue = null
      actions.clear()
      paused = false
      state = snapshot()
    },
  }

  return controller
}
