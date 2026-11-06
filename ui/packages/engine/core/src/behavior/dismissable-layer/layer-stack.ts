/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 layer stack 相关实现。

import type { Layer, LayerRegistry } from '../../kernel'
import { contains, DATA_INERT_EXEMPT } from '../../kernel'
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
  // 被命中的内联层留在原处的节点：更低的层把其中一个装在自己的内容里，就由它护着
  const guarded: Element[] = []
  for (let i = layers.length - 1; i >= 0; i--) {
    const current = layers[i]!
    const node = current === layer ? layerNode : current.node()
    const shielded = node !== null && guarded.some(origin => origin !== node && contains(node, origin))
    const { inside, onSurface } = shielded
      ? { inside: true, onSurface: false }
      : isInsideResolved(e, current, node)
    if (inside) {
      // 内联层悬停就出现，压在别的层上面不代表开在里面：它被命中只护着它开在其内容里的层
      if (current === layer || current.kind !== 'inline')
        return false
      if (node)
        guarded.push(node)
      guarded.push(...current.branches())
      continue
    }
    if (current === layer)
      return true
    if (onSurface)
      return false
  }
  return false
}

/**
 * 从栈顶向下：连续未命中的层都应被消解，遇到第一个命中层即停止；
 * 命中的是内联层时只停在它开在其内容里的层上，与它无关的更低的层照常消解。
 * 落在 inert 豁免子树里的交互一律不消解任何层。
 * 返回给定层此刻是否应被这次外部交互消解。
 */
export function shouldDismiss(e: Event, registry: Pick<LayerRegistry, 'list'>, layer: Layer): boolean {
  return shouldDismissInSnapshot(e, registry.list(), layer, layer.node())
}
