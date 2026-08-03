import type { Disposable, Layer, RuntimeConfig } from '@xihan-ui/core'
import { contains, EV_MOUNT_AUTO_FOCUS, EV_UNMOUNT_AUTO_FOCUS } from '@xihan-ui/core'
import { dispatchCancelable } from '../dispatch'
import { acquireFocusGuards } from './focus-guards'
import { focusFirst, focusSafely, getTabbables, removeLinks } from './tabbable'

export interface FocusScopeOptions {
  config: RuntimeConfig
  layer: Layer
  container: () => HTMLElement | null
  /** Tab 到边界回绕；与 trapped 正交。 */
  loop?: boolean
  /** 焦点不能通过键盘/指针/程序方式逃逸；可在生命周期内变化。 */
  trapped: () => boolean
  branches?: () => Element[]
  onMountAutoFocus?: (e: CustomEvent) => void
  onUnmountAutoFocus?: (e: CustomEvent) => void
  initialFocus?: () => HTMLElement | null
  /** 卸载时是否把焦点归还给创建前的元素；默认 true。 */
  restoreFocus?: () => boolean
}

export function createFocusScope(o: FocusScopeOptions): Disposable {
  const { config, layer, container } = o
  const scope = config.scope
  const doc = scope.getDoc()
  const win = scope.getWin()
  const registry = config.layerRegistry

  let disposed = false
  let paused = registry.top() !== layer
  let lastFocused: HTMLElement | null = scope.getActiveElement()
  const previouslyFocused = scope.getActiveElement()

  const guardsCleanup = acquireFocusGuards(doc)

  function isInScope(el: Element | null): boolean {
    if (!el)
      return false
    const el2 = container()
    if (contains(el2, el))
      return true
    return (o.branches?.() ?? []).some(b => contains(b, el))
  }

  // —— 挂载自动聚焦 ——
  // 容器可能晚一拍才就位，按 initialFocus → 首个可聚焦元素 → 容器 的顺序取焦点，
  // 容器兜底只在最后一帧使用。
  let focusSettled = false
  function tryMountFocus(lastChance: boolean): void {
    if (focusSettled || disposed)
      return
    const el = container()
    if (!el)
      return // 容器还没就位，留待重试
    const active = scope.getActiveElement()
    // 焦点已落在容器后代则视为完成，落在容器本身不算
    if (isInScope(active) && active !== el) {
      focusSettled = true
      return
    }
    const proceed = dispatchCancelable(el, EV_MOUNT_AUTO_FOCUS, {})
    // onMountAutoFocus 里可 preventDefault 改写默认聚焦
    o.onMountAutoFocus?.(new CustomEvent(EV_MOUNT_AUTO_FOCUS))
    if (!proceed) {
      focusSettled = true
      return
    }
    const target = o.initialFocus?.() ?? null
    if (target) {
      focusSafely(target, { select: true })
      focusSettled = true
      return
    }
    if (focusFirst(removeLinks(getTabbables(el)), { select: true })) {
      focusSettled = true
      return
    }
    // 无可聚焦元素时，仅在最后一帧兜底聚焦容器
    if (lastChance) {
      focusSafely(el)
      focusSettled = true
    }
  }
  function scheduleFocus(remaining: number): void {
    win.requestAnimationFrame(() => {
      if (focusSettled || disposed)
        return
      tryMountFocus(remaining <= 1)
      if (!focusSettled && remaining > 1)
        scheduleFocus(remaining - 1)
    })
  }
  // —— 逃逸抢回 ——
  /**
   * 把焦点拉回域内。lastFocused 可能已经离场（那一条被删掉了），或者压根没被记过，
   * 此时退到域内第一个可聚焦元素——「抓不回来就放它走」等于陷阱漏了。
   */
  function pullBack(): void {
    if (lastFocused?.isConnected && isInScope(lastFocused)) {
      focusSafely(lastFocused)
      return
    }
    const el = container()
    if (el && !focusFirst(removeLinks(getTabbables(el)), { select: true }))
      focusSafely(el)
  }
  function onFocusIn(e: FocusEvent): void {
    if (disposed)
      return
    const target = e.target as HTMLElement | null
    // 记账不看 trapped：它可以在生命周期内打开，那一刻要有个新鲜的落点可回
    if (isInScope(target)) {
      lastFocused = target
      return
    }
    if (paused || !o.trapped())
      return
    pullBack()
  }
  function onFocusOut(e: FocusEvent): void {
    if (disposed || paused || !o.trapped())
      return
    const related = e.relatedTarget as HTMLElement | null
    // relatedTarget 为 null 一律放行（切 tab / 元素被移除）
    if (related === null)
      return
    if (!isInScope(related))
      pullBack()
  }

  // —— Tab 边界回绕 ——
  function onKeyDown(e: KeyboardEvent): void {
    if (disposed || paused || !o.loop || e.key !== 'Tab')
      return
    const el2 = container()
    if (!el2)
      return
    const tabbables = getTabbables(el2)
    if (tabbables.length === 0)
      return
    const first = tabbables[0]!
    const last = tabbables[tabbables.length - 1]!
    const active = scope.getActiveElement()
    if (!e.shiftKey && active === last) {
      e.preventDefault()
      focusSafely(first)
    }
    else if (e.shiftKey && active === first) {
      e.preventDefault()
      focusSafely(last)
    }
  }

  // 监听必须先于挂载聚焦装上：那一次聚焦同样要记进 lastFocused，
  // 否则首次逃逸时手里只有创建前的旧值（通常是 body），一拉就拉了个空。
  doc.addEventListener('focusin', onFocusIn, { capture: true })
  doc.addEventListener('focusout', onFocusOut, { capture: true })
  doc.addEventListener('keydown', onKeyDown, { capture: true })

  tryMountFocus(false)
  if (!focusSettled)
    scheduleFocus(3)

  const unsub = registry.subscribe((layers) => {
    paused = layers[layers.length - 1] !== layer
  })

  return {
    dispose() {
      if (disposed)
        return
      disposed = true
      doc.removeEventListener('focusin', onFocusIn, { capture: true })
      doc.removeEventListener('focusout', onFocusOut, { capture: true })
      doc.removeEventListener('keydown', onKeyDown, { capture: true })
      unsub()
      guardsCleanup()
      // 焦点返还延后一帧
      win.requestAnimationFrame(() => {
        if (!(o.restoreFocus?.() ?? true))
          return
        const anchor = container() ?? doc.body
        if (dispatchCancelable(anchor, EV_UNMOUNT_AUTO_FOCUS, {})) {
          o.onUnmountAutoFocus?.(new CustomEvent(EV_UNMOUNT_AUTO_FOCUS))
          if (previouslyFocused?.isConnected) {
            focusSafely(previouslyFocused, { select: true })
            return
          }
          // 原持有者已离场。不能靠 body.focus()——body 不在各引擎一致的可聚焦集合里，
          // 那样焦点会留在这个已经关掉的层里（WC 侧节点常驻，尤其明显）。显式松手。
          const active = scope.getActiveElement()
          if (active && isInScope(active))
            active.blur()
        }
      })
    },
  }
}
