/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 侧栏导航的标准结构：按 collection 铺出整棵导航树。
// Vue / React 不写默认插槽时的缺省树、Web Components 不写部件（或只写 root）时元素生成的节点，都照这一份渲。

import type { StructureChild, StructureNode } from '../shared/structure'
import type { sideNavAnatomy } from './side-nav.anatomy'
import type { SideNavApi, SideNavNode } from './side-nav.types'
import { structureInstance } from '../shared/structure-instance'

type SideNavPart = (typeof sideNavAnatomy)['parts'][number]

/** 结构会产出的部件；root 由组件或元素自己给出，不在其列。 */
export const SIDE_NAV_STRUCTURE_PARTS = [
  'list',
  'item',
  'branch',
  'branch-trigger',
  'branch-text',
  'branch-indicator',
  'positioner',
  'branch-content',
  'link',
  'link-text',
] as const satisfies readonly SideNavPart[]

/**
 * anatomy 里不进标准结构的部件：搜索框与空态、分组（collection 里没有分组这一层）由作者手写结构时自己摆。
 */
export const SIDE_NAV_STRUCTURE_OMITS = [
  'input',
  'group',
  'group-label',
  'group-list',
  'empty',
] as const satisfies readonly SideNavPart[]

type SideNavStructurePart = (typeof SIDE_NAV_STRUCTURE_PARTS)[number]

type SideNavStructureNode = StructureNode<SideNavStructurePart>

/** 一行里的内容：给了图标时图标在前，接着是行文字（文字取 label，缺省回退为 value）。 */
function rowContent(node: SideNavNode, text: 'link-text' | 'branch-text'): StructureChild<SideNavStructurePart>[] {
  const label: SideNavStructureNode = { key: text, tag: 'span', part: text, text: node.label ?? node.value }
  return node.icon ? [structureInstance('icon', 'icon', { icon: node.icon }), label] : [label]
}

/**
 * 一条入口：children 是数组即为分支，行按钮后面是子层；否则是叶子，li 里一条链接。
 * 折叠为图标栏后顶层分支的子层是弹出面板，外面套一层定位层，由元素或组件搬到浮层落点。
 */
function nodeStructure(model: Pick<SideNavApi, 'isPopoutPanel'>, node: SideNavNode): SideNavStructureNode {
  if (!Array.isArray(node.children)) {
    return {
      key: `item:${node.value}`,
      tag: 'li',
      part: 'item',
      children: [{ key: 'link', tag: 'a', part: 'link', attrs: { value: node.value }, children: rowContent(node, 'link-text') }],
    }
  }
  const content: SideNavStructureNode = {
    key: 'branch-content',
    tag: 'ul',
    part: 'branch-content',
    children: node.children.map(child => nodeStructure(model, child)),
  }
  return {
    key: `branch:${node.value}`,
    tag: 'li',
    part: 'branch',
    attrs: { value: node.value },
    children: [
      {
        key: 'branch-trigger',
        tag: 'button',
        part: 'branch-trigger',
        children: [...rowContent(node, 'branch-text'), { key: 'branch-indicator', tag: 'span', part: 'branch-indicator' }],
      },
      model.isPopoutPanel(node.value)
        ? { key: 'positioner', tag: 'div', part: 'positioner', children: [content] }
        : content,
    ],
  }
}

/**
 * 侧栏在 root（nav）里的标准结构：一个列表，按 collection 逐层铺叶子与分支，整棵树都在，
 * 收起的子层与搜索没命中的行由连接层写 hidden。没有入口时什么都不铺。
 */
export function sideNavStructure(model: Pick<SideNavApi, 'collection' | 'isPopoutPanel'>): SideNavStructureNode[] {
  if (model.collection.length === 0)
    return []
  return [{ key: 'list', tag: 'ul', part: 'list', children: model.collection.map(node => nodeStructure(model, node)) }]
}
