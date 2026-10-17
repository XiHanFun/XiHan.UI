/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导航菜单的标准结构：列表里一项一个 li，带 href 的入口是直达链接，其余是入口按钮加面板；列表末尾是指示条。
// Vue / React 不写默认插槽时的缺省树、Web Components 不写部件（或只写 root）时元素生成的节点，都照这一份渲。

import type { StructureChild, StructureNode, StructureSlotted } from '../shared/structure'
import type { navigationMenuAnatomy } from './navigation-menu.anatomy'
import type { NavigationMenuApi, NavigationMenuNodeMeta } from './navigation-menu.types'

type NavigationMenuPart = (typeof navigationMenuAnatomy)['parts'][number]

/** 结构会产出的部件；root 由组件或元素自己给出，不在其列。 */
export const NAVIGATION_MENU_STRUCTURE_PARTS = [
  'list',
  'item',
  'trigger',
  'content',
  'branch-trigger',
  'branch-indicator',
  'branch-content',
  'link',
  'indicator',
] as const satisfies readonly NavigationMenuPart[]

/** anatomy 里不进标准结构的部件：入口里的方向标记与共享面板外壳都由作者手写结构时自己摆。 */
export const NAVIGATION_MENU_STRUCTURE_OMITS = [
  'trigger-indicator',
  'viewport',
] as const satisfies readonly NavigationMenuPart[]

type NavigationMenuStructureNode = StructureNode<(typeof NAVIGATION_MENU_STRUCTURE_PARTS)[number]>

/** 结构里要铺哪几处作者内容。 */
export interface NavigationMenuStructureOptions {
  /** 作者给了哪些插槽的内容：panel（某个入口的整块面板内容），按入口的值带 key。 */
  slotted?: StructureSlotted
}

const NOTHING_SLOTTED: StructureSlotted = () => false

/** 一条链接：写着 href，指向当前页的写着 current。 */
function link(node: NavigationMenuNodeMeta, key: string): NavigationMenuStructureNode {
  const attrs: Record<string, string> = {}
  if (node.href != null)
    attrs.href = node.href
  if (node.current)
    attrs.current = ''
  return { key, tag: 'a', part: 'link', attrs, text: node.label }
}

/** 面板里的条目：带 children 的铺为一枝子级（开关里是文字与展开方向标记，容器紧跟开关之后），其余铺为链接。 */
function panelEntries(entries: readonly NavigationMenuNodeMeta[]): StructureChild<NavigationMenuStructureNode['part']>[] {
  return entries.flatMap((entry): StructureChild<NavigationMenuStructureNode['part']>[] => entry.children.length > 0
    ? [
        {
          key: `branch-trigger:${entry.value}`,
          tag: 'button',
          part: 'branch-trigger',
          attrs: { value: entry.value },
          children: [
            { key: 'label', literal: entry.label },
            { key: 'indicator', tag: 'span', part: 'branch-indicator', attrs: { value: entry.value } },
          ],
        },
        {
          key: `branch-content:${entry.value}`,
          tag: 'div',
          part: 'branch-content',
          attrs: { value: entry.value },
          children: entry.children.map(child => link(child, `link:${child.value}`)),
        },
      ]
    : [link(entry, `link:${entry.value}`)])
}

/**
 * 导航菜单在 root 里的标准结构：一个列表，一项一个 li。带 href 的入口铺为直达链接；其余铺为入口按钮（文字取 label）
 * 加紧跟其后的面板，面板内容给了 panel 插槽就归作者，否则按这一项的 children 铺；列表末尾是指示条。
 */
export function navigationMenuStructure(model: Pick<NavigationMenuApi, 'collection'>, options: NavigationMenuStructureOptions = {}): StructureChild<NavigationMenuStructureNode['part']>[] {
  const slotted = options.slotted ?? NOTHING_SLOTTED
  const items = model.collection.map((node): NavigationMenuStructureNode => ({
    key: `item:${node.value}`,
    tag: 'li',
    part: 'item',
    children: node.href != null
      ? [link(node, 'link')]
      : [
          { key: 'trigger', tag: 'button', part: 'trigger', attrs: { value: node.value }, text: node.label },
          slotted('panel', node.value)
            ? { key: 'content', tag: 'div', part: 'content', attrs: { value: node.value }, slot: { name: 'panel', key: node.value }, data: node }
            : { key: 'content', tag: 'div', part: 'content', attrs: { value: node.value }, children: panelEntries(node.children) },
        ],
  }))
  return [{
    key: 'list',
    tag: 'ul',
    part: 'list',
    children: [...items, { key: 'indicator', tag: 'li', part: 'indicator' }],
  }]
}
