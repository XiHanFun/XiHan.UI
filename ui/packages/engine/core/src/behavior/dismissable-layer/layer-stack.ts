import type { Layer, LayerRegistry } from '../../kernel'
import { DATA_INERT_EXEMPT } from '../../kernel'

export interface InsideResult {
  inside: boolean
  onSurface: boolean
}

/** 事件是否落在带 inert 豁免标记的子树里（穿透 portal 与 shadow）；这类子树内的交互不算层外交互。 */
function isInInertExempt(e: Event): boolean {
  for (const node of e.composedPath()) {
    const el = node as Element
    if (typeof el.hasAttribute === 'function' && el.hasAttribute(DATA_INERT_EXEMPT))
      return true
  }
  return false
}

/** 用事件的合成路径判断目标属于层内 / 层的表面 / 层外（穿透 portal 与 shadow）。 */
export function isInside(e: Event, layer: Layer): InsideResult {
  const path = e.composedPath()
  const node = layer.node()
  if (node && path.includes(node))
    return { inside: true, onSurface: false }
  if (layer.branches().some(b => path.includes(b)))
    return { inside: true, onSurface: false }
  if (layer.surfaces().some(s => path.includes(s)))
    return { inside: false, onSurface: true }
  return { inside: false, onSurface: false }
}

/**
 * 从栈顶向下：连续未命中的层都应被消解，遇到第一个命中层即停止。
 * 落在 inert 豁免子树里的交互一律不消解任何层。
 * 返回给定层此刻是否应被这次外部交互消解。
 */
export function shouldDismiss(e: Event, registry: LayerRegistry, layer: Layer): boolean {
  if (isInInertExempt(e))
    return false
  const layers = registry.list()
  for (let i = layers.length - 1; i >= 0; i--) {
    const current = layers[i]!
    const { inside, onSurface } = isInside(e, current)
    if (inside)
      return false
    if (current === layer)
      return true
    if (onSurface)
      return false
  }
  return false
}
