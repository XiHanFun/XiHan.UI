/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 右键菜单的标准结构：触发区，定位层里的 content 按 collection 铺出条目、分组与分隔线；带 children 的条目是一个嵌套的子菜单。
// Vue / React 不写默认插槽时的缺省树、Web Components 不写部件（或只写 root）时元素生成的节点，都照这一份渲。

import type { StructureChild, StructureNode, StructureSlotted } from '../shared/structure'
import type { contextMenuAnatomy } from './context-menu.anatomy'
import type { ContextMenuApi } from './context-menu.types'
import { menuNodesStructure } from '../menu/menu.structure'

type ContextMenuPart = (typeof contextMenuAnatomy)['parts'][number]

/** 结构会产出的部件；root 由组件或元素自己给出，不在其列。 */
export const CONTEXT_MENU_STRUCTURE_PARTS = [
  'trigger',
  'positioner',
  'content',
  'item',
  'item-icon',
  'item-text',
  'item-indicator',
  'item-description',
  'item-shortcut',
  'item-suffix',
  'separator',
  'group',
  'group-label',
] as const satisfies readonly ContextMenuPart[]

/** anatomy 里不进标准结构的部件：指向锚点的箭头由作者手写结构时自己摆。 */
export const CONTEXT_MENU_STRUCTURE_OMITS = [
  'arrow',
] as const satisfies readonly ContextMenuPart[]

type ContextMenuStructureNode = StructureNode<(typeof CONTEXT_MENU_STRUCTURE_PARTS)[number]>

/** 结构里要铺哪几处作者内容。 */
export interface ContextMenuStructureOptions {
  /**
   * 作者给了哪些插槽的内容：trigger（触发区里的内容）；item（条目文字）、item-prefix（行首那一格 item-icon，压过 icon）、
   * item-suffix（行尾），后三个按条目的值带 key。子菜单那一层按数据铺，不认这几个插槽。
   */
  slotted?: StructureSlotted
}

const NOTHING_SLOTTED: StructureSlotted = () => false

/**
 * 右键菜单在 root 里的标准结构：触发区在前，内容归作者（trigger 插槽）；定位层在后，里面是 content 与按数据铺的节点。
 * 条目的 item 插槽只接管条目文字，标记位、说明与快捷键照数据铺。
 */
export function contextMenuStructure(model: Pick<ContextMenuApi, 'collection'>, options: ContextMenuStructureOptions = {}): StructureChild<ContextMenuStructureNode['part']>[] {
  const slotted = options.slotted ?? NOTHING_SLOTTED
  const trigger: ContextMenuStructureNode = slotted('trigger')
    ? { key: 'trigger', tag: 'div', part: 'trigger', slot: { name: 'trigger' } }
    : { key: 'trigger', tag: 'div', part: 'trigger' }
  return [
    trigger,
    {
      key: 'positioner',
      tag: 'div',
      part: 'positioner',
      children: [{ key: 'content', tag: 'div', part: 'content', children: menuNodesStructure(model.collection, slotted, { itemSlot: 'item-text' }) }],
    },
  ]
}
