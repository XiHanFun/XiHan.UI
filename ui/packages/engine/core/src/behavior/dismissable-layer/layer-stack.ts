import type { Layer, LayerRegistry } from '../../kernel'
import { DATA_INERT_EXEMPT } from '../../kernel'
import { dismissPathIncludes } from './route'

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

/** 对已经解析好的层节点判断目标属于层内 / 层的表面 / 层外。 */
function isInsideResolved(e: Event, layer: Layer, node: HTMLElement | null): InsideResult {
  const path = e.composedPath()
  if (node !== null && path.includes(node))
    return { inside: true, onSurface: false }
  if (dismissPathIncludes(path, layer.branches()))
    return { inside: true, onSurface: false }
  return { inside: false, onSurface: dismissPathIncludes(path, layer.surfaces()) }
}

/** 用事件的合成路径判断目标属于层内 / 层的表面 / 层外（穿透 portal 与 shadow）。 */
export function isInside(e: Event, layer: Layer): InsideResult {
  return isInsideResolved(e, layer, layer.node())
}

/** 在一份固定层栈快照上仲裁；目标层节点同样固定，避免一次计算读到两代节点。 */
function shouldDismissInSnapshot(
  e: Event,
  layers: readonly Layer[],
  layer: Layer,
  layerNode: HTMLElement | null,
): boolean {
  if (isInInertExempt(e))
    return false
  for (let i = layers.length - 1; i >= 0; i--) {
    const current = layers[i]!
    const { inside, onSurface } = isInsideResolved(e, current, current === layer ? layerNode : current.node())
    if (inside)
      return false
    if (current === layer)
      return true
    if (onSurface)
      return false
  }
  return false
}

/**
 * 从栈顶向下：连续未命中的层都应被消解，遇到第一个命中层即停止。
 * 落在 inert 豁免子树里的交互一律不消解任何层。
 * 返回给定层此刻是否应被这次外部交互消解。
 */
export function shouldDismiss(e: Event, registry: Pick<LayerRegistry, 'list'>, layer: Layer): boolean {
  return shouldDismissInSnapshot(e, registry.list(), layer, layer.node())
}
