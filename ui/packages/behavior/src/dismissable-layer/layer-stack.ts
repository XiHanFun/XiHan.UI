import type { Layer, LayerRegistry } from '@xihan-ui/core'

export interface InsideResult {
  inside: boolean
  onSurface: boolean
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
 * 返回给定层此刻是否应被这次外部交互消解。
 */
export function shouldDismiss(e: Event, registry: LayerRegistry, layer: Layer): boolean {
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
