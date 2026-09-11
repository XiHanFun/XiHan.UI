import type { Layer, RuntimeConfig } from '../../kernel'

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

/** 空 LayerRegistry lane 在 Escape 冒泡阶段执行的后备出口。 */
export interface EscapeFallbackOptions {
  config: RuntimeConfig
  /** 每次 Escape 都读取当前值；返回 false 时跳过该出口。 */
  isEnabled: () => boolean
  /** 本次 Escape 的 capture 票据仍有效时调用，并收到所属 Window 的同一原生事件。 */
  onEscape: (event: KeyboardEvent) => void
}
