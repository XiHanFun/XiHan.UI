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
