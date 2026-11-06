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

/**
 * 悬停就出现的层不经按下打开：它压在别的层上面不代表开在那一层里，所以它留在栈里时不按栈序挡住下面每一层。
 * 内联层（提示、导航面板）都是这样；别的层悬停就出现时登记 opensOnHover（悬停卡片、悬停展开的菜单）。
 * 交互落在它里面、或它还判不了这次交互时，只护着它开在其内容里的层：那一层的根节点装着它的根节点或某个分支。
 * 交互落在它外面时谁也不护：它否决层外票、收到关闭意图却没退栈（多半是正在播退场），下面的层连同它开在
 * 其内容里的那一层照常消解，一次按下把它和它所在的浮层一并收起。
 * 其余的层经按下、聚焦打开，打开它的那次交互没有收掉下面的层，栈序即嵌套，照旧挡住下面每一层。
 */
export function shieldsParentsOnly(layer: Layer): boolean {
  return layer.opensOnHover ?? layer.kind === 'inline'
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
  // 被命中的、悬停就出现的层留在原处的节点：更低的层把其中一个装在自己的内容里，就由它护着
  const guarded: Element[] = []
  for (let i = layers.length - 1; i >= 0; i--) {
    const current = layers[i]!
    const node = current === layer ? layerNode : current.node()
    const shielded = node !== null && guarded.some(origin => origin !== node && contains(node, origin))
    const { inside, onSurface } = shielded
      ? { inside: true, onSurface: false }
      : isInsideResolved(e, current, node)
    if (inside) {
      // 悬停就出现的层压在别的层上面不代表开在里面：它被命中只护着它开在其内容里的层
      if (current === layer || !shieldsParentsOnly(current))
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
 * 命中的是悬停就出现的层（内联层，或登记了 opensOnHover 的层）时只停在它开在其内容里的层上，与它无关的更低的层照常消解。
 * 落在 inert 豁免子树里的交互一律不消解任何层。
 * 返回给定层此刻是否应被这次外部交互消解。
 */
export function shouldDismiss(e: Event, registry: Pick<LayerRegistry, 'list'>, layer: Layer): boolean {
  return shouldDismissInSnapshot(e, registry.list(), layer, layer.node())
}
