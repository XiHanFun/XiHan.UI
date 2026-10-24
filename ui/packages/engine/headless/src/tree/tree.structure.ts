/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 树的标准结构：按有效树铺出标题与整棵树，分支一行一个控制行加一层子层，叶子一行一个条目。
// Vue / React 不写默认插槽时的缺省树、Web Components 不写部件（或只写 root）时元素生成的节点，都照这一份渲。
// 懒分支的取数反馈不在结构里：组件或元素在分支里自己补，手写结构时也一样。

import type { StructureNode, StructureSlotted } from '../shared/structure'
import type { treeAnatomy } from './tree.anatomy'
import type { TreeApi, TreeNode } from './tree.types'

type TreePart = (typeof treeAnatomy)['parts'][number]

/** 结构会产出的部件；root 由组件或元素自己给出，不在其列。 */
export const TREE_STRUCTURE_PARTS = [
  'label',
  'tree',
  'item',
  'item-text',
  'item-description',
  'item-indicator',
  'branch',
  'branch-control',
  'branch-trigger',
  'branch-text',
  'branch-description',
  'branch-content',
] as const satisfies readonly TreePart[]

/**
 * anatomy 里不进标准结构的部件：行尾内容、分支的自定义指示符、拖动把手与拖动播报区、整树的空态与在途占位
 * 由作者手写结构时自己摆；懒分支的四种取数反馈由组件或元素在分支里自己补。
 */
export const TREE_STRUCTURE_OMITS = [
  'item-suffix',
  'branch-indicator',
  'branch-loading',
  'branch-error',
  'branch-retry-trigger',
  'branch-empty',
  'node-drag-trigger',
  'empty',
  'loading',
  'live-region',
] as const satisfies readonly TreePart[]

type TreeStructureNode = StructureNode<(typeof TREE_STRUCTURE_PARTS)[number]>

/** 结构里要不要铺标题。 */
export interface TreeStructureOptions {
  /** 标题文字：给了就铺带这段文字的 label；label 插槽有内容时铺内容归作者的 label。 */
  label?: string
  /** 作者给了哪些插槽的内容：label。 */
  slotted?: StructureSlotted
}

const NOTHING_SLOTTED: StructureSlotted = () => false

/**
 * 一个节点：有效树里带 children 的是分支（懒分支在有效树里已补上子层），其余是条目；
 * 文字取 label，没有时取 value，写了 description 就多铺一行副文本。
 */
function nodeStructure(node: TreeNode): TreeStructureNode {
  const text = node.label ?? node.value
  if (node.children) {
    return {
      key: `branch:${node.value}`,
      tag: 'div',
      part: 'branch',
      attrs: { value: node.value },
      children: [
        {
          key: 'control',
          tag: 'div',
          part: 'branch-control',
          children: [
            { key: 'trigger', tag: 'span', part: 'branch-trigger' },
            { key: 'text', tag: 'span', part: 'branch-text', text },
            ...(node.description != null ? [{ key: 'description', tag: 'span', part: 'branch-description', text: node.description } satisfies TreeStructureNode] : []),
            { key: 'indicator', tag: 'span', part: 'item-indicator' },
          ],
        },
        { key: 'content', tag: 'div', part: 'branch-content', children: node.children.map(nodeStructure) },
      ],
    }
  }
  return {
    key: `item:${node.value}`,
    tag: 'div',
    part: 'item',
    attrs: { value: node.value },
    children: [
      { key: 'text', tag: 'span', part: 'item-text', text },
      ...(node.description != null ? [{ key: 'description', tag: 'span', part: 'item-description', text: node.description } satisfies TreeStructureNode] : []),
      { key: 'indicator', tag: 'span', part: 'item-indicator' },
    ],
  }
}

/**
 * 树在 root 里的标准结构：标题在前，整棵树在后。收起的分支照样铺出子层（由连接层收起），
 * 子树里的状态与滚动位置跟着保留；节点按值带 key，展开、取回与重排后按值复用。
 */
export function treeStructure(model: Pick<TreeApi, 'collection'>, options: TreeStructureOptions = {}): TreeStructureNode[] {
  const slotted = options.slotted ?? NOTHING_SLOTTED
  const nodes: TreeStructureNode[] = []
  if (slotted('label'))
    nodes.push({ key: 'label', tag: 'span', part: 'label', slot: { name: 'label' } })
  else if (options.label != null)
    nodes.push({ key: 'label', tag: 'span', part: 'label', text: options.label })
  nodes.push({ key: 'tree', tag: 'div', part: 'tree', children: model.collection.map(nodeStructure) })
  return nodes
}
