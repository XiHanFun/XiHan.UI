import type { Cleanup, Disposable, Layer, RuntimeConfig } from '../../kernel'
import { EV_ESCAPE_KEY_DOWN, EV_FOCUS_OUTSIDE, EV_INTERACT_OUTSIDE, EV_POINTER_DOWN_OUTSIDE, isHTMLElement } from '../../kernel'
import { shouldDismissInSnapshot } from './layer-stack'

export type DismissReason = 'escape-key' | 'pointer-down-outside' | 'focus-outside' | 'programmatic'

export interface DismissLayerOptions {
  config: RuntimeConfig
  layer: Layer
  onDismiss: (reason: DismissReason) => void
  /** 收到 Escape 时的表决票：preventDefault 即这次别关。原生 keydown 在 detail.originalEvent 里。 */
  onEscapeKeyDown?: (e: CustomEvent<{ originalEvent: KeyboardEvent }>) => void
  onPointerDownOutside?: (e: CustomEvent) => void
  onFocusOutside?: (e: CustomEvent) => void
  /** 上面两者任一发生时也派发一次。 */
  onInteractOutside?: (e: CustomEvent) => void
}

interface InteractionTicket {
  /** LayerRegistry 在交互开始时返回的冻结快照；对象身份同时充当 revision。 */
  readonly snapshot: readonly Layer[]
  /** 本次交互固定使用的层节点。 */
  readonly node: HTMLElement | null
}

function drainCleanups(cleanups: Cleanup[]): unknown[] {
  const errors: unknown[] = []
  while (cleanups.length) {
    try {
      cleanups.pop()!()
    }
    catch (error) {
      errors.push(error)
    }
  }
  return errors
}

function throwCleanupErrors(errors: unknown[], message: string): void {
  if (errors.length === 1)
    throw errors[0]
  if (errors.length > 1)
    throw new AggregateError(errors, message, { cause: errors[0] })
}

function throwWithCleanup(primary: unknown, cleanupErrors: unknown[], message: string): never {
  if (!cleanupErrors.length)
    throw primary
  throw new AggregateError([primary, ...cleanupErrors], message, { cause: primary })
}

export function createDismissLayer(o: DismissLayerOptions): Disposable {
  const { config, layer, onDismiss } = o
  const registry = config.layerRegistry
  const doc = config.scope.getDoc()
  const win = config.scope.getWin()
  if (registry.ownerDocument !== doc)
    throw new Error('[xh] DismissableLayer 的 LayerRegistry 与 Scope 必须属于同一 Document')
  if (doc.defaultView !== win || win.document !== doc)
    throw new Error('[xh] DismissableLayer 的 Scope Document 与 Window 不一致')
  if (typeof win.CustomEvent !== 'function')
    throw new Error('[xh] DismissableLayer 所属 Window 不支持 CustomEvent')
  if (typeof win.queueMicrotask !== 'function')
    throw new Error('[xh] DismissableLayer 所属 Window 不支持 queueMicrotask')
  if (typeof win.requestAnimationFrame !== 'function' || typeof win.cancelAnimationFrame !== 'function')
    throw new Error('[xh] DismissableLayer 所属 Window 不支持动画帧调度')

  const initialSnapshot = registry.list()
  if (!Object.isFrozen(initialSnapshot))
    throw new Error('[xh] DismissableLayer 的 LayerRegistry.list() 必须返回冻结快照')
  if (!initialSnapshot.includes(layer))
    throw new Error('[xh] DismissableLayer 的 layer 必须已注册到 config.layerRegistry')

  const resolveNode = (): HTMLElement | null => {
    const current = layer.node()
    if (current === null)
      return null
    if (!isHTMLElement(current))
      throw new Error('[xh] DismissableLayer 的 layer.node() 必须是原生 HTMLElement')
    if (current.ownerDocument !== doc)
      throw new Error('[xh] DismissableLayer 的 layer.node() 必须属于 config.scope 的 Document')
    return current
  }

  // 动态 getter 在监听注册前先验一次；之后每张交互票仍会重新解析并校验。
  resolveNode()
  const afterInitialNode = registry.list()
  if (afterInitialNode !== initialSnapshot || !afterInitialNode.includes(layer))
    throw new Error('[xh] DismissableLayer 的 layer.node() 在初始化期间改变了 LayerRegistry 快照')

  let disposed = false
  let armed = false
  let handling = false
  // pointer 消解后短暂忽略随之而来的 focusin。
  let justDismissed = false
  let justDismissedFrame: number | null = null
  const cleanups: Cleanup[] = []

  function clearJustDismissed(): void {
    const frame = justDismissedFrame
    // 先清状态再调用宿主能力：cancel 抛错也不能把句柄与焦点抑制留在存活态。
    justDismissedFrame = null
    justDismissed = false
    if (frame !== null)
      win.cancelAnimationFrame(frame)
  }

  function markJustDismissed(): void {
    clearJustDismissed()
    justDismissed = true
    try {
      justDismissedFrame = win.requestAnimationFrame(() => {
        justDismissedFrame = null
        justDismissed = false
      })
    }
    catch (error) {
      justDismissedFrame = null
      justDismissed = false
      throw error
    }
  }

  function captureTicket(): InteractionTicket | null {
    if (disposed)
      return null
    const snapshot = registry.list()
    if (!Object.isFrozen(snapshot))
      throw new Error('[xh] DismissableLayer 的 LayerRegistry.list() 必须返回冻结快照')
    // 先查登记身份再读动态节点：已退栈的层不应再触发 getter 的业务副作用。
    if (!snapshot.includes(layer))
      return null
    const currentNode = resolveNode()
    if (disposed || registry.list() !== snapshot)
      return null
    return Object.freeze({ snapshot, node: currentNode })
  }

  function isTicketCurrent(ticket: InteractionTicket): boolean {
    if (disposed || registry.list() !== ticket.snapshot || !ticket.snapshot.includes(layer))
      return false
    const currentNode = resolveNode()
    return !disposed
      && registry.list() === ticket.snapshot
      && currentNode === ticket.node
  }

  function dispatchVote<T>(
    ticket: InteractionTicket,
    vote: CustomEvent<T>,
    callback?: (event: CustomEvent<T>) => void,
  ): boolean {
    ticket.node?.dispatchEvent(vote)
    if (!isTicketCurrent(ticket))
      return false
    callback?.(vote)
    return isTicketCurrent(ticket)
  }

  function stillDismisses(event: Event, ticket: InteractionTicket): boolean {
    if (!isTicketCurrent(ticket))
      return false
    // 表决回调可能动态改写 branches/surfaces；提交前必须在同一层栈快照上重新仲裁。
    const decision = shouldDismissInSnapshot(event, ticket.snapshot, layer, ticket.node)
    return decision && isTicketCurrent(ticket)
  }

  function fireInteractOutside(
    originalEvent: Event,
    ticket: InteractionTicket,
    specificType: string,
    specificCb?: (e: CustomEvent) => void,
  ): boolean {
    const specific = new win.CustomEvent(specificType, { bubbles: false, cancelable: true, detail: {} })
    if (!dispatchVote(ticket, specific, specificCb))
      return false
    const interact = new win.CustomEvent(EV_INTERACT_OUTSIDE, { bubbles: false, cancelable: true, detail: {} })
    if (!dispatchVote(ticket, interact, o.onInteractOutside))
      return false
    return !specific.defaultPrevented
      && !interact.defaultPrevented
      && stillDismisses(originalEvent, ticket)
  }

  function onEscape(e: KeyboardEvent): void {
    if (disposed || !armed || handling || e.key !== 'Escape')
      return
    handling = true
    try {
      const ticket = captureTicket()
      if (!ticket || ticket.snapshot[ticket.snapshot.length - 1] !== layer)
        return
      const vote = new win.CustomEvent(EV_ESCAPE_KEY_DOWN, {
        bubbles: false,
        cancelable: true,
        detail: { originalEvent: e },
      })
      if (!dispatchVote(ticket, vote, o.onEscapeKeyDown) || vote.defaultPrevented)
        return
      onDismiss('escape-key')
    }
    finally {
      handling = false
    }
  }

  function onPointerDown(e: PointerEvent): void {
    if (disposed || !armed || handling)
      return
    handling = true
    try {
      const ticket = captureTicket()
      if (!ticket?.node || !shouldDismissInSnapshot(e, ticket.snapshot, layer, ticket.node))
        return
      if (!isTicketCurrent(ticket))
        return
      if (!fireInteractOutside(e, ticket, EV_POINTER_DOWN_OUTSIDE, o.onPointerDownOutside))
        return
      markJustDismissed()
      try {
        if (!isTicketCurrent(ticket)) {
          clearJustDismissed()
          return
        }
        onDismiss('pointer-down-outside')
      }
      catch (primaryError) {
        const cleanupErrors: unknown[] = []
        try {
          clearJustDismissed()
        }
        catch (cleanupError) {
          cleanupErrors.push(cleanupError)
        }
        throwWithCleanup(
          primaryError,
          cleanupErrors,
          '[xh] DismissableLayer 的 pointer 提交与焦点抑制清理同时失败',
        )
      }
    }
    finally {
      handling = false
    }
  }

  function onFocusIn(e: FocusEvent): void {
    if (disposed || !armed || handling || justDismissed)
      return
    handling = true
    try {
      const ticket = captureTicket()
      if (!ticket?.node || !shouldDismissInSnapshot(e, ticket.snapshot, layer, ticket.node))
        return
      if (!isTicketCurrent(ticket))
        return
      if (fireInteractOutside(e, ticket, EV_FOCUS_OUTSIDE, o.onFocusOutside))
        onDismiss('focus-outside')
    }
    finally {
      handling = false
    }
  }

  // 监听器同步取得，任何 add/queue 失败都会在 createDismissLayer 返回前回滚，
  // 让外层浮层初始化事务能继续撤销 LayerRegistry 等先行资源。
  try {
    // remover 先入栈，覆盖宿主包装器先完成 native add、随后才抛错的部分提交。
    cleanups.push(() => doc.removeEventListener('keydown', onEscape, true))
    doc.addEventListener('keydown', onEscape, true)
    cleanups.push(() => doc.removeEventListener('pointerdown', onPointerDown, true))
    doc.addEventListener('pointerdown', onPointerDown, true)
    cleanups.push(() => doc.removeEventListener('focusin', onFocusIn, true))
    doc.addEventListener('focusin', onFocusIn, true)
    // 最后取得的动态资源最先释放：RAF → focus → pointer → keydown。
    cleanups.push(clearJustDismissed)
    // 只延后武装，避开打开浮层的同一次 pointerdown；监听注册本身不得逃出初始化事务。
    win.queueMicrotask(() => {
      if (!disposed && registry.list().includes(layer))
        armed = true
    })
  }
  catch (setupError) {
    disposed = true
    armed = false
    throwWithCleanup(
      setupError,
      drainCleanups(cleanups),
      '[xh] DismissableLayer 初始化与回滚同时失败',
    )
  }

  return {
    dispose() {
      if (disposed)
        return
      // 先终态再跑宿主 cleanup：任一 cleanup 抛错时也不会重新响应事件或重复释放。
      disposed = true
      armed = false
      throwCleanupErrors(
        drainCleanups(cleanups),
        '[xh] DismissableLayer 清理出现多个异常',
      )
    },
  }
}
