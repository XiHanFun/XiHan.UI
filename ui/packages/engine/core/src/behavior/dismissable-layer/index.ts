import type { Disposable } from '../../kernel'
import type { DismissLayerOptions, EscapeFallbackOptions } from './types'
import { registerDismissLayer, registerEscapeFallback } from './hub'

export type { DismissLayerOptions, DismissReason, EscapeFallbackOptions } from './types'

export function createDismissLayer(options: DismissLayerOptions): Disposable {
  return registerDismissLayer(options)
}

/**
 * 给显式 LayerRegistry 的空栈 Escape 注册一个后备出口。
 * 同一 lane 只执行注册顺序中最后一个当前启用的出口。
 */
export function createEscapeFallback(options: EscapeFallbackOptions): Disposable {
  return registerEscapeFallback(options)
}
