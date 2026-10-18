/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 图标的标准结构：<svg> 根里一个 glyph 空壳，图元铺在空壳中。
// Web Components 不写部件时元素生成的节点、Vue / React 的 XhIcon 不给插槽内容时铺的 glyph 都照这一份渲。

import type { StructureNode } from '../shared/structure'
import type { iconAnatomy } from './icon.anatomy'

type IconPart = (typeof iconAnatomy)['parts'][number]

/** 结构会产出的部件；root（<svg>）由组件或元素自己给出，不在其列。 */
export const ICON_STRUCTURE_PARTS = [
  'glyph',
] as const satisfies readonly IconPart[]

/** anatomy 里不进标准结构的部件：没有。 */
export const ICON_STRUCTURE_OMITS = [] as const satisfies readonly IconPart[]

type IconNode = StructureNode<(typeof ICON_STRUCTURE_PARTS)[number]>

/** 图标在 root（<svg>）里的标准结构：一个 glyph 空壳。 */
export function iconStructure(): IconNode[] {
  return [{ key: 'glyph', tag: 'g', part: 'glyph' }]
}
