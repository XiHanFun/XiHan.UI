/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 命令面板的标准结构：触发按钮（给了内容才铺），遮罩，定位层里的面板依次是检索框、结果列表、空态与在途占位、页脚。
// Vue / React 不写默认插槽时的缺省树、Web Components 不写部件时元素生成的节点，都照这一份渲。

import type { StructureChild, StructureNode, StructureSlotted } from '../shared/structure'
import type { commandAnatomy } from './command.anatomy'
import type { CommandGroupMeta, CommandNodeMeta } from './command.types'
import { COMMAND_UNGROUPED } from './command.filter'

type CommandPart = (typeof commandAnatomy)['parts'][number]

/** 结构会产出的部件；命令面板没有 root，部件直接长在组件或元素里。 */
export const COMMAND_STRUCTURE_PARTS = [
  'trigger',
  'backdrop',
  'positioner',
  'content',
  'input',
  'list',
  'group',
  'group-label',
  'item',
  'item-prefix',
  'item-text',
  'item-description',
  'item-shortcut',
  'item-suffix',
  'empty',
  'loading',
  'footer',
] as const satisfies readonly CommandPart[]

/** anatomy 里不进标准结构的部件：没有。 */
export const COMMAND_STRUCTURE_OMITS = [] as const satisfies readonly CommandPart[]

type CommandStructureNode = StructureNode<(typeof COMMAND_STRUCTURE_PARTS)[number]>

/** 结构里要铺哪几处作者内容。 */
export interface CommandStructureOptions {
  /** 空态提示文字；empty 插槽有内容时以插槽为准。 */
  empty?: string
  /**
   * 作者给了哪些插槽的内容：trigger（触发按钮里的内容）、empty、footer；item（条目文字）、item-prefix（行首）、
   * item-suffix（行尾），后三个按条目的值带 key。
   */
  slotted?: StructureSlotted
}

const NOTHING_SLOTTED: StructureSlotted = () => false

/** 一条命令：行首、文字、副文本、快捷键、行尾，没有的格不铺；item 插槽只接管条目文字。 */
function itemStructure(node: CommandNodeMeta, slotted: StructureSlotted): CommandStructureNode {
  const children: CommandStructureNode[] = []
  if (slotted('item-prefix', node.value))
    children.push({ key: 'prefix', tag: 'span', part: 'item-prefix', slot: { name: 'item-prefix', key: node.value }, data: node })
  children.push(slotted('item', node.value)
    ? { key: 'text', tag: 'span', part: 'item-text', slot: { name: 'item', key: node.value }, data: node }
    : { key: 'text', tag: 'span', part: 'item-text', text: node.label })
  if (node.description != null)
    children.push({ key: 'description', tag: 'span', part: 'item-description', text: node.description })
  if (node.shortcut != null)
    children.push({ key: 'shortcut', tag: 'span', part: 'item-shortcut', text: node.shortcut })
  if (slotted('item-suffix', node.value))
    children.push({ key: 'suffix', tag: 'span', part: 'item-suffix', slot: { name: 'item-suffix', key: node.value }, data: node })
  return { key: `item:${node.value}`, tag: 'div', part: 'item', attrs: { value: node.value }, children }
}

/**
 * 命令面板的标准结构。tree 是整份清单分好的组（resolveCommandGroups 不过滤时的结果）：过滤由 connect 给不在结果里的
 * 条目与被筛空的分组写 hidden，结构不随检索串增删节点。没归组的那批直接铺条目，不套分组外壳。
 * 空态与在途占位是结果列表的兄弟，不进 role=listbox；空态的内容归作者（empty 插槽）或取 empty 文字，页脚给了内容才铺。
 */
export function commandStructure(tree: readonly CommandGroupMeta[], options: CommandStructureOptions = {}): StructureChild<CommandStructureNode['part']>[] {
  const slotted = options.slotted ?? NOTHING_SLOTTED
  const list = tree.flatMap((group): CommandStructureNode[] => group.value === COMMAND_UNGROUPED
    ? group.items.map(node => itemStructure(node, slotted))
    : [{
        key: `group:${group.value}`,
        tag: 'div',
        part: 'group',
        attrs: { value: group.value },
        children: [
          { key: 'label', tag: 'span', part: 'group-label', text: group.label },
          ...group.items.map(node => itemStructure(node, slotted)),
        ],
      }])
  const empty: CommandStructureNode = slotted('empty')
    ? { key: 'empty', tag: 'div', part: 'empty', slot: { name: 'empty' } }
    : options.empty != null ? { key: 'empty', tag: 'div', part: 'empty', text: options.empty } : { key: 'empty', tag: 'div', part: 'empty' }
  return [
    ...(slotted('trigger') ? [{ key: 'trigger', tag: 'button', part: 'trigger', slot: { name: 'trigger' } } satisfies CommandStructureNode] : []),
    { key: 'backdrop', tag: 'div', part: 'backdrop' },
    {
      key: 'positioner',
      tag: 'div',
      part: 'positioner',
      children: [{
        key: 'content',
        tag: 'div',
        part: 'content',
        children: [
          { key: 'input', tag: 'input', part: 'input' },
          { key: 'list', tag: 'div', part: 'list', children: list },
          empty,
          { key: 'loading', tag: 'div', part: 'loading' },
          ...(slotted('footer') ? [{ key: 'footer', tag: 'footer', part: 'footer', slot: { name: 'footer' } } satisfies CommandStructureNode] : []),
        ],
      }],
    },
  ]
}
