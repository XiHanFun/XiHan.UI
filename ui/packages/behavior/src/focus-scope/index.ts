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
  // 容器可能晚一拍才由适配器渲染出来（如 Dialog 内容在状态进入 open 后才挂载）；
  // 此刻容器为 null 就下一帧重试一次，否则焦点永远进不去。
  function attemptMountFocus(): boolean {
    const el = container()
    if (!el)
      return false
    if (!isInScope(scope.getActiveElement())) {
      const proceed = dispatchCancelable(el, EV_MOUNT_AUTO_FOCUS, {})
      // onMountAutoFocus 里可 preventDefault 改写默认聚焦
      o.onMountAutoFocus?.(new CustomEvent(EV_MOUNT_AUTO_FOCUS))
      if (proceed) {
        const target = o.initialFocus?.() ?? null
        if (target)
          focusSafely(target, { select: true })
        else if (!focusFirst(removeLinks(getTabbables(el)), { select: true }))
          focusSafely(el)
      }
    }
    return true
  }
  if (!attemptMountFocus()) {
    win.requestAnimationFrame(() => {
      if (!disposed)
        attemptMountFocus()
    })
  }

  // —— 逃逸抢回 ——
  function onFocusIn(e: FocusEvent): void {
    if (disposed || paused || !o.trapped())
      return
    const target = e.target as HTMLElement | null
    if (isInScope(target)) {
      lastFocused = target
      return
    }
    focusSafely(lastFocused)
  }
  function onFocusOut(e: FocusEvent): void {
    if (disposed || paused || !o.trapped())
      return
    const related = e.relatedTarget as HTMLElement | null
    // relatedTarget 为 null 一律放行（切 tab / 元素被移除），插手会错乱或打满 CPU
    if (related === null)
      return
    if (!isInScope(related))
      focusSafely(lastFocused)
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

  doc.addEventListener('focusin', onFocusIn, { capture: true })
  doc.addEventListener('focusout', onFocusOut, { capture: true })
  doc.addEventListener('keydown', onKeyDown, { capture: true })

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
      // 焦点返还延后一拍，避免被后续 DOM 操作覆盖
      win.requestAnimationFrame(() => {
        if (!(o.restoreFocus?.() ?? true))
          return
        const anchor = container() ?? doc.body
        if (dispatchCancelable(anchor, EV_UNMOUNT_AUTO_FOCUS, {})) {
          o.onUnmountAutoFocus?.(new CustomEvent(EV_UNMOUNT_AUTO_FOCUS))
          const back = previouslyFocused && previouslyFocused.isConnected ? previouslyFocused : doc.body
          focusSafely(back, { select: true })
        }
      })
    },
  }
}
