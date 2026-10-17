/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 菜单栏的标准结构：一排入口按钮在前，各自菜单的定位层在后，定位层里的 content 按这张菜单的 items 铺出条目、分组与分隔线；
// 带 children 的条目是一个嵌套的子菜单。Vue / React 不写默认插槽时的缺省树、Web Components 不写部件（或只写 root）时
// 元素生成的节点，都照这一份渲。

import type { StructureChild, StructureNode, StructureSlotted } from '../shared/structure'
import type { menubarAnatomy } from './menubar.anatomy'
import type { MenubarApi } from './menubar.types'
import { menuNodesStructure } from '../menu/menu.structure'

type MenubarPart = (typeof menubarAnatomy)['parts'][number]

/** 结构会产出的部件；root 由组件或元素自己给出，不在其列。 */
export const MENUBAR_STRUCTURE_PARTS = [
  'trigger',
  'positioner',
  'content',
  'item',
  'item-text',
  'item-indicator',
  'item-description',
  'item-shortcut',
  'item-suffix',
  'separator',
  'group',
  'group-label',
] as const satisfies readonly MenubarPart[]

/** anatomy 里不进标准结构的部件：指向锚点的箭头由作者手写结构时自己摆。 */
export const MENUBAR_STRUCTURE_OMITS = [
  'arrow',
] as const satisfies readonly MenubarPart[]

type MenubarStructureNode = StructureNode<(typeof MENUBAR_STRUCTURE_PARTS)[number]>

/** 结构里要铺哪几处作者内容。 */
export interface MenubarStructureOptions {
  /**
   * 作者给了哪些插槽的内容：item（条目文字）、item-prefix（行首标记位）、item-suffix（行尾），按条目的值带 key。
   * 入口按钮的文字取入口的 label；子菜单那一层按数据铺，不认这几个插槽。
   */
  slotted?: StructureSlotted
}

/**
 * 菜单栏在 root 里的标准结构：每个入口一颗按钮（文字取 label），排完入口再排各自菜单的定位层；
 * 入口、定位层与 content 写着同一个 value 配对。条目的 item 插槽只接管条目文字，标记位、说明与快捷键照数据铺。
 */
export function menubarStructure(model: Pick<MenubarApi, 'collection'>, options: MenubarStructureOptions = {}): StructureChild<MenubarStructureNode['part']>[] {
  const triggers = model.collection.map((menu): MenubarStructureNode => ({
    key: `trigger:${menu.value}`,
    tag: 'button',
    part: 'trigger',
    attrs: { value: menu.value },
    text: menu.label,
  }))
  const positioners = model.collection.map((menu): MenubarStructureNode => ({
    key: `positioner:${menu.value}`,
    tag: 'div',
    part: 'positioner',
    attrs: { value: menu.value },
    children: [{
      key: 'content',
      tag: 'div',
      part: 'content',
      attrs: { value: menu.value },
      children: menuNodesStructure(menu.items, options.slotted, { itemSlot: 'item-text' }),
    }],
  }))
  return [...triggers, ...positioners]
}
