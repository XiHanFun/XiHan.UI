import type { Cleanup, Disposable, RuntimeConfig } from '../../kernel'
import { createPerDocumentRegistry, isDocument, isHTMLElement, isWindow } from '../../kernel'

export interface ScrollLockOptions {
  config: RuntimeConfig
}

export type ScrollLockHandle = Disposable

/** 加锁期间把让出来的滚动条宽度写在文档根上，供 fixed 定位的元素让位。 */
const GUTTER_VAR = '--xh-scroll-lock-gutter'

interface InlineValue {
  readonly value: string
  readonly priority: string
}

interface LockTarget {
  readonly el: HTMLElement
  readonly page: boolean
}

interface LockEpoch extends LockTarget {
  readonly cleanups: Cleanup[]
}

interface LockState {
  count: number
  epoch: LockEpoch | null
  transitioning: boolean
}

const registry = createPerDocumentRegistry<LockState>(() => ({
  count: 0,
  epoch: null,
  transitioning: false,
}))

function collectCleanups(cleanups: Cleanup[]): unknown[] {
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

function throwCollectedErrors(errors: unknown[], message: string): void {
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

function inlineValue(style: CSSStyleDeclaration, property: string): InlineValue {
  return {
    value: style.getPropertyValue(property),
    priority: style.getPropertyPriority(property),
  }
}

function sameInlineValue(left: InlineValue, right: InlineValue): boolean {
  return left.value === right.value && left.priority === right.priority
}

/** 只还原仍等于本轮锁写入值的声明，保留业务在锁期间主动改过的样式。 */
function setOwnedStyle(
  cleanups: Cleanup[],
  style: CSSStyleDeclaration,
  property: string,
  value: string,
  priority = 'important',
): void {
  const before = inlineValue(style, property)
  let applied = { value, priority }
  cleanups.push(() => {
    if (sameInlineValue(inlineValue(style, property), applied))
      style.setProperty(property, before.value, before.priority)
  })
  try {
    style.setProperty(property, value, priority)
  }
  catch (error) {
    // 宿主包装器可能先完成原生写入再抛错；尽力读取已提交结果，且绝不遮蔽主异常。
    try {
      applied = inlineValue(style, property)
    }
    catch {}
    throw error
  }
  // 以宿主实际接受的标准化结果为准；严格浏览器会保留 important，测试宿主也可如实降级。
  applied = inlineValue(style, property)
}

function resolveRealm(config: RuntimeConfig): { doc: Document, win: Window & typeof globalThis } {
  const doc = config.scope.getDoc()
  const win = config.scope.getWin()
  if (!isDocument(doc) || !isWindow(win) || doc.defaultView !== win || win.document !== doc)
    throw new Error('[xh] ScrollLock 的 Scope Document 与 Window 不一致')
  return { doc, win }
}

function pageTarget(doc: Document): LockTarget {
  const body = doc.body
  if (!isHTMLElement(body) || body.ownerDocument !== doc || !body.isConnected)
    throw new Error('[xh] ScrollLock 的页面目标需要已连接的原生 Document.body')
  return { el: body, page: true }
}

/** null、body、documentElement 与 scrollingElement 都归一为同一个页面目标。 */
function resolveTarget(config: RuntimeConfig, doc: Document): LockTarget {
  const resolveScrollRoot = config.scrollRoot
  if (typeof resolveScrollRoot !== 'function')
    throw new TypeError('[xh] ScrollLock 的 RuntimeConfig.scrollRoot 必须是函数')
  const requested: unknown = resolveScrollRoot()
  if (requested === null
    || requested === doc.body
    || requested === doc.documentElement
    || requested === doc.scrollingElement) {
    return pageTarget(doc)
  }
  if (!isHTMLElement(requested))
    throw new TypeError('[xh] ScrollLock 的 scrollRoot 必须返回原生 HTMLElement 或 null')
  if (requested.ownerDocument !== doc)
    throw new Error('[xh] ScrollLock 的 scrollRoot 必须属于 Scope Document')
  if (!requested.isConnected)
    throw new Error('[xh] ScrollLock 的 scrollRoot 必须已连接到 Scope Document')
  return { el: requested, page: false }
}

/** 量加锁后会消失的那条滚动条有多宽；只能在写入 overflow:hidden 前调用。 */
function measureGutter(target: LockTarget, doc: Document, win: Window): number {
  const { el, page } = target
  const gutterOwner = page ? doc.documentElement : el
  const style = win.getComputedStyle(gutterOwner)
  if (/(?:^|\s)stable(?:\s|$)/.test(style.getPropertyValue('scrollbar-gutter')))
    return 0
  if (page) {
    return Math.max(0, win.innerWidth - doc.documentElement.clientWidth)
  }
  const border = (Number.parseFloat(style.borderLeftWidth) || 0) + (Number.parseFloat(style.borderRightWidth) || 0)
  return Math.max(0, el.offsetWidth - el.clientWidth - border)
}

function createEpoch(target: LockTarget, doc: Document, win: Window & typeof globalThis): LockEpoch {
  const { el, page } = target
  if (page && typeof win.scrollTo !== 'function')
    throw new Error('[xh] ScrollLock 所属 Window 不支持 scrollTo')

  const scrollX = page ? win.scrollX : el.scrollLeft
  const scrollY = page ? win.scrollY : el.scrollTop
  const gutter = measureGutter(target, doc, win)
  const padding = Number.parseFloat(win.getComputedStyle(el).paddingInlineEnd) || 0
  const cleanups: Cleanup[] = []

  try {
    if (page) {
      // 先压滚动恢复，样式恢复会在它之前按 LIFO 完成。
      cleanups.push(() => win.scrollTo({ left: scrollX, top: scrollY, behavior: 'instant' }))
      setOwnedStyle(cleanups, el.style, 'position', 'fixed')
      setOwnedStyle(cleanups, el.style, 'top', `${-scrollY}px`)
      setOwnedStyle(cleanups, el.style, 'left', `${-scrollX}px`)
      setOwnedStyle(cleanups, el.style, 'width', '100%')
      setOwnedStyle(cleanups, el.style, 'box-sizing', 'border-box')
    }
    else {
      cleanups.push(() => {
        el.scrollLeft = scrollX
      })
      cleanups.push(() => {
        el.scrollTop = scrollY
      })
    }
    setOwnedStyle(cleanups, el.style, 'overflow', 'hidden')
    if (gutter > 0)
      setOwnedStyle(cleanups, el.style, 'padding-inline-end', `${padding + gutter}px`)
    setOwnedStyle(cleanups, doc.documentElement.style, GUTTER_VAR, `${gutter}px`)
  }
  catch (setupError) {
    throwWithCleanup(
      setupError,
      collectCleanups(cleanups),
      '[xh] ScrollLock 初始化与回滚同时失败',
    )
  }

  return { ...target, cleanups }
}

function releaseEpoch(epoch: LockEpoch): void {
  throwCollectedErrors(
    collectCleanups(epoch.cleanups),
    '[xh] ScrollLock 最终释放出现多个异常',
  )
}

/** 加一把滚动锁。相同 Document 与规范化目标共享；同一时刻混用不同目标会明确失败。 */
export function acquireScrollLock(options: ScrollLockOptions): ScrollLockHandle {
  const { config } = options
  const { doc, win } = resolveRealm(config)
  const state = registry.get(doc)
  if (state.transitioning)
    throw new Error('[xh] ScrollLock 正在切换当前 Document 的锁定 epoch')

  let epoch: LockEpoch
  state.transitioning = true
  try {
    const target = resolveTarget(config, doc)
    const current = state.epoch
    if (state.count > 0) {
      if (!current)
        throw new Error('[xh] ScrollLock 引用计数与当前 epoch 不一致')
      if (current.el !== target.el || current.page !== target.page)
        throw new Error('[xh] 同一 Document 的 ScrollLock 不能同时锁定不同目标')
      epoch = current
      state.count += 1
    }
    else {
      if (current)
        throw new Error('[xh] ScrollLock 空闲状态不能保留旧 epoch')
      epoch = createEpoch(target, doc, win)
      state.epoch = epoch
      state.count = 1
    }
  }
  finally {
    state.transitioning = false
  }

  let disposed = false
  return {
    dispose() {
      if (disposed)
        return
      if (state.transitioning)
        throw new Error('[xh] ScrollLock 正在切换当前 Document 的锁定 epoch')
      disposed = true
      if (state.epoch !== epoch || state.count <= 0)
        throw new Error('[xh] ScrollLock 句柄与当前 epoch 不一致')
      state.count -= 1
      if (state.count > 0)
        return

      // 先发布终态，再完整尝试本轮全部清理；异常也不会复活句柄或 epoch。
      state.epoch = null
      state.transitioning = true
      try {
        releaseEpoch(epoch)
      }
      finally {
        state.transitioning = false
      }
    },
  }
}
