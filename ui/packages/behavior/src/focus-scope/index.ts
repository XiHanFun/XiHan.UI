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
  // 容器可能晚一拍才就位（Vue：content 进 open 后才挂载；WC：content 常驻但先 hidden、
  // 同一拍才变可见）。首选 initialFocus/首个可聚焦元素；容器兜底只在最后一帧才用，
  // 否则"焦点落在容器本身"会被当作已完成、错过之后才出现的可聚焦元素。
  let focusSettled = false
  function tryMountFocus(lastChance: boolean): void {
    if (focusSettled || disposed)
      return
    const el = container()
    if (!el)
      return // 容器还没就位，留待重试
    const active = scope.getActiveElement()
    // 焦点已落在容器的某个后代（真正可聚焦元素）→ 完成；落在容器本身则不算，继续找
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
    // 尚无可聚焦元素（容器可能仍隐藏）：最后一帧才兜底聚焦容器，否则留待重试
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
  tryMountFocus(false)
  if (!focusSettled)
    scheduleFocus(3)

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
