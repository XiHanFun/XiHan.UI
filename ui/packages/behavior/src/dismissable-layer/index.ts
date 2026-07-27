import type { Disposable, Layer, RuntimeConfig } from '@xihan-ui/core'
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
  /** 上面两者任一发生时也派发一次，用于「两种都不关」的统一写法。 */
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
  // 消解后短暂忽略随之而来的 focusin，避免同一次外部交互触发两次
  let justDismissed = false

  function onEscape(e: KeyboardEvent): void {
    if (disposed || e.key !== 'Escape')
      return
    // 只有栈顶层响应，天然逐层关闭
    if (registry.top() !== layer)
      return
    const el = node()
    // 用一个自建的可取消事件来表决"这次关不关"，作者层（DOM 监听）与机器层（回调）
    // 投同一张票，与外部交互那两路同构。
    // 不拿原生 keydown 当票据：合成的 KeyboardEvent 默认 cancelable=false，
    // 在它身上调 preventDefault 是空操作，closeOnEscape=false 就成了一句空话。
    // 原生事件仍带在 detail 里，回调要看 key / 修饰键时取得到。
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

  // 延后注册：避免打开自己的那次 pointerdown 立刻把自己关掉
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
