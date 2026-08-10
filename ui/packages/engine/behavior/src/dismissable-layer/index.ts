import type { Disposable, Layer, RuntimeConfig } from '@xihan-ui/kernel'
import { isInside, shouldDismiss } from './layer-stack'

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

const EV_ESCAPE = 'xh.dismiss.escapeKeyDown'
const EV_POINTER_OUTSIDE = 'xh.dismiss.pointerDownOutside'
const EV_FOCUS_OUTSIDE = 'xh.dismiss.focusOutside'
const EV_INTERACT_OUTSIDE = 'xh.dismiss.interactOutside'

export function createDismissLayer(o: DismissLayerOptions): Disposable {
  const { config, layer, onDismiss } = o
  const registry = config.layerRegistry
  const doc = config.scope.getDoc()
  const win = config.scope.getWin()
  const node = (): HTMLElement | null => layer.node()

  let disposed = false
  // 消解后短暂忽略随之而来的 focusin
  let justDismissed = false

  function onEscape(e: KeyboardEvent): void {
    if (disposed || e.key !== 'Escape')
      return
    // 只有栈顶层响应 Escape
    if (registry.top() !== layer)
      return
    const el = node()
    const vote = new CustomEvent(EV_ESCAPE, { bubbles: false, cancelable: true, detail: { originalEvent: e } })
    el?.dispatchEvent(vote)
    o.onEscapeKeyDown?.(vote)
    if (vote.defaultPrevented)
      return
    onDismiss('escape-key')
  }

  function fireInteractOutside(el: HTMLElement, specificType: string, specificCb?: (e: CustomEvent) => void): boolean {
    const specific = new CustomEvent(specificType, { bubbles: false, cancelable: true, detail: {} })
    el.dispatchEvent(specific)
    specificCb?.(specific)
    const interact = new CustomEvent(EV_INTERACT_OUTSIDE, { bubbles: false, cancelable: true, detail: {} })
    el.dispatchEvent(interact)
    o.onInteractOutside?.(interact)
    return !specific.defaultPrevented && !interact.defaultPrevented
  }

  function onPointerDown(e: PointerEvent): void {
    if (disposed)
      return
    const el = node()
    if (!el || isInside(e, layer).inside)
      return
    if (!shouldDismiss(e, registry, layer))
      return
    if (fireInteractOutside(el, EV_POINTER_OUTSIDE, o.onPointerDownOutside)) {
      justDismissed = true
      win.requestAnimationFrame(() => {
        justDismissed = false
      })
      onDismiss('pointer-down-outside')
    }
  }

  function onFocusIn(e: FocusEvent): void {
    if (disposed || justDismissed)
      return
    const el = node()
    if (!el || isInside(e, layer).inside)
      return
    if (!shouldDismiss(e, registry, layer))
      return
    if (fireInteractOutside(el, EV_FOCUS_OUTSIDE, o.onFocusOutside))
      onDismiss('focus-outside')
  }

  // 延后注册，跳过打开自己的那次 pointerdown
  let registered = false
  function register(): void {
    if (disposed || registered)
      return
    registered = true
    doc.addEventListener('keydown', onEscape, { capture: true })
    doc.addEventListener('pointerdown', onPointerDown, { capture: true })
    doc.addEventListener('focusin', onFocusIn, { capture: true })
  }
  queueMicrotask(register)
  win.setTimeout(register, 0)

  return {
    dispose() {
      if (disposed)
        return
      disposed = true
      doc.removeEventListener('keydown', onEscape, { capture: true })
      doc.removeEventListener('pointerdown', onPointerDown, { capture: true })
      doc.removeEventListener('focusin', onFocusIn, { capture: true })
    },
  }
}
