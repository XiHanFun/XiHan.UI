/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 菜单的标准结构：触发器，定位层里的 content 按 collection 铺出条目、分组与分隔线；带 children 的条目是一个嵌套的子菜单。
// Vue / React 不写默认插槽时的缺省树、Web Components 不写部件时元素生成的节点，都照这一份渲。

import type { StructureChild, StructureNode, StructureSlotted } from '../shared/structure'
import type { menuAnatomy } from './menu.anatomy'
import type { MenuApi, MenuNodeMeta, MenuStructureOptions } from './menu.types'
import { groupAdjacentRuns } from '@xihan-ui/core'
import { structureInstance } from '../shared/structure-instance'

type MenuPart = (typeof menuAnatomy)['parts'][number]

/** 结构会产出的部件；菜单没有 root，部件直接长在组件或元素里。 */
export const MENU_STRUCTURE_PARTS = [
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
] as const satisfies readonly MenuPart[]

/** anatomy 里不进标准结构的部件：指向锚点的箭头由作者手写结构时自己摆。 */
export const MENU_STRUCTURE_OMITS = [
  'arrow',
] as const satisfies readonly MenuPart[]

type MenuStructureNode = StructureNode<(typeof MENU_STRUCTURE_PARTS)[number]>

const NOTHING_SLOTTED: StructureSlotted = () => false

/** 按数据铺条目要读的元信息：菜单栏的条目没有标记位文字。 */
export type MenuNodesStructureMeta = Omit<MenuNodeMeta, 'indicator'> & { readonly indicator?: string | null }

/** 按数据铺条目时的选项。 */
export interface MenuNodesStructureOptions {
  /** item 插槽接管哪一格：item 是整条（缺省，菜单的写法），item-text 只接管条目文字（右键菜单与菜单栏的写法）。 */
  readonly itemSlot?: 'item' | 'item-text'
}

/**
 * 一条条目：带 children 的是嵌套的子菜单；item 插槽有内容时整条或条目文字归作者；其余按数据铺标记位、文字、说明、
 * 快捷键与行尾，没有的格不铺。勾选与单选条目没写标记位时也留一格空的给勾。
 */
function itemStructure(meta: MenuNodesStructureMeta, slotted: StructureSlotted, options: MenuNodesStructureOptions): StructureChild<MenuStructureNode['part']> {
  if (meta.children) {
    return structureInstance(`submenu:${meta.value}`, 'menu', {
      collection: [...meta.children],
      submenu: true,
      value: meta.value,
      label: meta.label,
      ...(meta.disabled ? { disabled: true } : {}),
    })
  }
  const base = { key: `item:${meta.value}`, tag: 'div', part: 'item', attrs: { value: meta.value } } as const
  const itemSlotted = slotted('item', meta.value)
  if (itemSlotted && options.itemSlot !== 'item-text')
    return { ...base, slot: { name: 'item', key: meta.value }, data: meta }
  const children: MenuStructureNode[] = []
  if (slotted('item-prefix', meta.value))
    children.push({ key: 'indicator', tag: 'span', part: 'item-indicator', slot: { name: 'item-prefix', key: meta.value }, data: meta })
  else if (meta.indicator != null)
    children.push({ key: 'indicator', tag: 'span', part: 'item-indicator', text: meta.indicator })
  else if (meta.kind !== 'item')
    children.push({ key: 'indicator', tag: 'span', part: 'item-indicator' })
  children.push(itemSlotted
    ? { key: 'text', tag: 'span', part: 'item-text', slot: { name: 'item', key: meta.value }, data: meta }
    : { key: 'text', tag: 'span', part: 'item-text', text: meta.label })
  if (meta.description != null)
    children.push({ key: 'description', tag: 'span', part: 'item-description', text: meta.description })
  if (meta.shortcut != null)
    children.push({ key: 'shortcut', tag: 'span', part: 'item-shortcut', text: meta.shortcut })
  if (slotted('item-suffix', meta.value))
    children.push({ key: 'suffix', tag: 'span', part: 'item-suffix', slot: { name: 'item-suffix', key: meta.value }, data: meta })
  return { ...base, children }
}

function separator(meta: MenuNodesStructureMeta): MenuStructureNode {
  return { key: `separator:${meta.value}`, tag: 'div', part: 'separator' }
}

/**
 * content 里的节点：相邻且同组的条目铺成一个 group（有组标题时排在组首），条目上的 separatorBefore 在它前面铺一道分隔线，
 * 段首的分隔线落在 group 外面；整份菜单的第一条不铺分隔线。
 */
export function menuNodesStructure(
  collection: readonly MenuNodesStructureMeta[],
  slotted: StructureSlotted = NOTHING_SLOTTED,
  options: MenuNodesStructureOptions = {},
): StructureChild<MenuStructureNode['part']>[] {
  return groupAdjacentRuns(collection, node => node.group).flatMap((run, runIndex) => {
    const head = run[0]
    const lead = runIndex > 0 && head.separatorBefore ? [separator(head)] : []
    if (head.group == null)
      return [...lead, itemStructure(head, slotted, options)]
    const groupLabel = run.find(node => node.groupLabel != null)?.groupLabel ?? null
    const group: MenuStructureNode = {
      key: `group:${head.group}`,
      tag: 'div',
      part: 'group',
      attrs: { value: head.group },
      children: [
        ...(groupLabel != null ? [{ key: 'label', tag: 'span', part: 'group-label', text: groupLabel } satisfies MenuStructureNode] : []),
        ...run.flatMap((node, index) => [
          ...(index > 0 && node.separatorBefore ? [separator(node)] : []),
          itemStructure(node, slotted, options),
        ]),
      ],
    }
    return [...lead, group]
  })
}

/** 菜单的标准结构：触发器在前，定位层在后，定位层里是 content 与按数据铺的节点。 */
export function menuStructure(model: Pick<MenuApi, 'collection'>, options: MenuStructureOptions = {}): StructureChild<MenuStructureNode['part']>[] {
  const slotted = options.slotted ?? NOTHING_SLOTTED
  let trigger: MenuStructureNode
  if (options.submenu) {
    const value = options.value ?? ''
    trigger = slotted('item', value)
      ? { key: 'trigger', tag: 'div', part: 'trigger', attrs: { value }, slot: { name: 'item', key: value } }
      : { key: 'trigger', tag: 'div', part: 'trigger', attrs: { value }, text: options.label ?? value }
  }
  else if (slotted('trigger')) {
    trigger = { key: 'trigger', tag: 'button', part: 'trigger', slot: { name: 'trigger' } }
  }
  else {
    trigger = options.label != null ? { key: 'trigger', tag: 'button', part: 'trigger', text: options.label } : { key: 'trigger', tag: 'button', part: 'trigger' }
  }
  return [
    trigger,
    {
      key: 'positioner',
      tag: 'div',
      part: 'positioner',
      children: [{ key: 'content', tag: 'div', part: 'content', children: menuNodesStructure(model.collection, slotted) }],
    },
  ]
}
