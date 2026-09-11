import type { Cleanup } from '../types'
import type { PortalVisualBridge } from './portal-visual-bridge'
import { createPortalVisualBridge } from './portal-visual-bridge'

/**
 * 一个物理搬迁根在租约开始前的精确落点。占位节点始终插在根的原位置，释放时只替换
 * 这个占位节点，不按父节点末尾等相对位置猜测归位点。
 */
interface PortalSlot {
  readonly root: HTMLElement
  readonly placeholder: Comment
}

export interface PortalLeaseOptions {
  /** Portal 在逻辑组件树里的来源；视觉环境由既有 PortalVisualBridge 持续投影到壳。 */
  readonly source: Element
  /** 同一 Document 内、已经连接的实际 Portal 目标。 */
  readonly target: Element
  /** 此次租约独占搬迁的根；允许来自多个作者父节点。 */
  readonly roots: readonly HTMLElement[]
  /**
   * 壳已经创建、视觉桥已经就绪，但 roots 尚未搬迁时调用。
   *
   * 适配器可在这里把逻辑所有权挂在壳上；返回的清理会在 roots 精确归位之后执行。
   */
  readonly onShellReady?: (shell: HTMLElement) => Cleanup | void
}

export interface PortalLease {
  readonly source: Element
  readonly target: Element
  readonly roots: readonly HTMLElement[]
  /** 本租约独占的无盒壳，承接视觉桥和适配器逻辑所有权。 */
  readonly shell: HTMLElement
  /** 幂等地停止视觉桥、原位归还所有 roots，并删除壳。 */
  release: () => void
}

function throwCollectedErrors(errors: unknown[], message: string): void {
  if (errors.length === 1)
    throw errors[0]
  if (errors.length > 1)
    throw new AggregateError(errors, message, { cause: errors[0] })
}

function throwWithRollback(primary: unknown, rollbackErrors: unknown[], message: string): never {
  if (!rollbackErrors.length)
    throw primary
  throw new AggregateError([primary, ...rollbackErrors], message, { cause: primary })
}

function validate(options: PortalLeaseOptions): void {
  const { source, target, roots } = options
  const doc = source.ownerDocument
  if (target.ownerDocument !== doc)
    throw new Error('[xh] Portal 租约的来源与目标必须属于同一 Document')
  if (!target.isConnected)
    throw new Error('[xh] Portal 租约的目标必须连接在来源 Document')
  if (!roots.length)
    throw new Error('[xh] Portal 租约至少需要一个可搬迁根')

  const seen = new Set<HTMLElement>()
  for (const root of roots) {
    if (root.ownerDocument !== doc)
      throw new Error('[xh] Portal 租约的全部 roots 必须属于来源 Document')
    if (!root.parentNode)
      throw new Error('[xh] Portal 租约的 root 必须先挂入作者结构')
    if (seen.has(root))
      throw new Error('[xh] Portal 租约的 roots 不能重复')
    if (root === target || root.contains(target))
      throw new Error('[xh] Portal 租约的目标不能位于被搬迁 root 中')
    seen.add(root)
  }
  for (let index = 0; index < roots.length; index++) {
    const root = roots[index]!
    for (let other = index + 1; other < roots.length; other++) {
      const next = roots[other]!
      if (root.contains(next) || next.contains(root))
        throw new Error('[xh] Portal 租约的 roots 不能互为祖先')
    }
  }
}

function restoreSlots(slots: readonly PortalSlot[]): unknown[] {
  const errors: unknown[] = []
  for (const slot of slots) {
    try {
      if (!slot.placeholder.parentNode)
        throw new Error('[xh] Portal 租约的占位节点已被移除，无法恢复作者结构')
      slot.placeholder.replaceWith(slot.root)
    }
    catch (error) {
      errors.push(error)
    }
  }
  return errors
}

/**
 * 建立一次物理 Portal 租约。
 *
 * Core 负责 placeholder、独占 shell、视觉桥、事务回滚和精确归位；适配器仅通过
 * onShellReady 把框架/组件特有的逻辑所有权接到 shell，不在各端复刻物理搬迁生命周期。
 */
export function createPortalLease(options: PortalLeaseOptions): PortalLease {
  validate(options)
  const { source, target, roots } = options
  const doc = source.ownerDocument
  const shell = doc.createElement('div')
  shell.dataset.xhPortalShell = ''
  shell.style.display = 'contents'
  const slots: PortalSlot[] = []
  let bridge: PortalVisualBridge | null = null
  let shellCleanup: Cleanup | null = null

  try {
    for (const root of roots) {
      const parent = root.parentNode!
      const placeholder = doc.createComment('xh-portal-root')
      parent.insertBefore(placeholder, root)
      slots.push({ root, placeholder })
    }
    target.appendChild(shell)
    bridge = createPortalVisualBridge({ source, shell })
    shellCleanup = options.onShellReady?.(shell) ?? null
    for (const slot of slots)
      shell.appendChild(slot.root)
  }
  catch (primary) {
    const rollbackErrors: unknown[] = []
    try {
      bridge?.dispose()
    }
    catch (error) {
      rollbackErrors.push(error)
    }
    rollbackErrors.push(...restoreSlots(slots))
    try {
      shellCleanup?.()
    }
    catch (error) {
      rollbackErrors.push(error)
    }
    try {
      shell.remove()
    }
    catch (error) {
      rollbackErrors.push(error)
    }
    throwWithRollback(primary, rollbackErrors, '[xh] Portal 租约初始化与回滚同时失败')
  }

  let released = false
  return {
    source,
    target,
    roots: Object.freeze([...roots]),
    shell,
    release() {
      if (released)
        return
      // 先发布终态：即使某个作者 DOM 或适配器 cleanup 抛错，也不得半释放后被重复执行。
      released = true
      const errors: unknown[] = []
      try {
        bridge!.dispose()
      }
      catch (error) {
        errors.push(error)
      }
      errors.push(...restoreSlots(slots))
      try {
        shellCleanup?.()
      }
      catch (error) {
        errors.push(error)
      }
      try {
        shell.remove()
      }
      catch (error) {
        errors.push(error)
      }
      throwCollectedErrors(errors, '[xh] Portal 租约释放出现多个异常')
    },
  }
}
