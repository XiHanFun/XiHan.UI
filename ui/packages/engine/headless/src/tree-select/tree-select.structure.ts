/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 树选择的标准结构：按 collection 铺出标题、盒（触发器与可选的清空钮）与浮层里的树。
// Vue / React 不写默认插槽时的缺省树、Web Components 不写部件（或只写 root）时元素生成的节点，都照这一份渲。

import type { StructureNode, StructureSlotted } from '../shared/structure'
import type { treeSelectAnatomy } from './tree-select.anatomy'
import type { TreeSelectApi, TreeSelectNode } from './tree-select.types'

type TreeSelectPart = (typeof treeSelectAnatomy)['parts'][number]

/** 结构会产出的部件；root 由组件或元素自己给出，不在其列。 */
export const TREE_SELECT_STRUCTURE_PARTS = [
  'label',
  'control',
  'trigger',
  'value-text',
  'tag-list',
  'indicator',
  'clear-trigger',
  'positioner',
  'content',
  'input',
  'tree',
  'item',
  'item-text',
  'item-indicator',
  'branch',
  'branch-control',
  'branch-trigger',
  'branch-text',
  'branch-content',
] as const satisfies readonly TreeSelectPart[]

/**
 * anatomy 里不进标准结构的部件：条目副文本与行尾、分支的指示符与取数反馈、整树的空态与在途占位、
 * 底部操作区与表单影子由作者手写结构时自己摆。分支的取数反馈由组件或元素在分支里自己补。
 */
export const TREE_SELECT_STRUCTURE_OMITS = [
  'item-description',
  'item-suffix',
  'branch-indicator',
  'branch-loading',
  'branch-error',
  'branch-retry-trigger',
  'branch-empty',
  'empty',
  'loading',
  'footer',
  'hidden-input',
] as const satisfies readonly TreeSelectPart[]

type TreeSelectStructurePart = (typeof TREE_SELECT_STRUCTURE_PARTS)[number]

/** 委派给 tag 的部件：标签与 +N 那一枚，名字取元素委派声明里的。 */
type TreeSelectTagPart = 'tag' | 'overflow-tag'

type TreeSelectStructureNode = StructureNode<TreeSelectStructurePart | TreeSelectTagPart>

/** 结构里要不要铺这几个可选部件。 */
export interface TreeSelectStructureOptions {
  /** 标题文字：给了就铺带这段文字的 label；label 插槽有内容时铺内容归作者的 label。 */
  label?: string
  /** 盒里带不带清空按钮，缺省不带。 */
  clearable?: boolean
  /** 浮层里树的前面带不带搜索框，缺省不带。 */
  searchable?: boolean
  /** 作者给了哪些插槽的内容：label。 */
  slotted?: StructureSlotted
}

type TreeSelectStructureModel = Pick<TreeSelectApi, 'collection' | 'multiple' | 'tags'>

/** 一个节点：带 children（或声明了 hasChildren 的懒分支）的是分支，其余是条目；文字取 label，没有时取 value。 */
function nodeStructure(node: TreeSelectNode): TreeSelectStructureNode {
  const text = node.label ?? node.value
  if (node.children || node.hasChildren) {
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
            { key: 'indicator', tag: 'span', part: 'item-indicator' },
          ],
        },
        { key: 'content', tag: 'div', part: 'branch-content', children: (node.children ?? []).map(nodeStructure) },
      ],
    }
  }
  return {
    key: `item:${node.value}`,
    tag: 'div',
    part: 'item',
    attrs: { value: node.value },
    children: [
      { key: 'indicator', tag: 'span', part: 'item-indicator' },
      { key: 'text', tag: 'span', part: 'item-text', text },
    ],
  }
}

const NOTHING_SLOTTED: StructureSlotted = () => false

/**
 * 树选择在 root 里的标准结构，次序是标题、盒、浮层。
 * 盒里触发器在前、清空按钮在后（按钮不能套按钮），展开箭头是触发器里的指示符；
 * 多选的已选项在触发器里排成标签（只作展示），摆不下的折进 +N。浮层里开了搜索时搜索框排在树之前，
 * collection 此刻已是按检索词裁剪后的树。
 */
export function treeSelectStructure(model: TreeSelectStructureModel, options: TreeSelectStructureOptions = {}): TreeSelectStructureNode[] {
  const slotted = options.slotted ?? NOTHING_SLOTTED
  const trigger: TreeSelectStructureNode = {
    key: 'trigger',
    tag: 'button',
    part: 'trigger',
    children: [
      { key: 'value-text', tag: 'span', part: 'value-text' },
      ...(model.multiple
        ? [{
          key: 'tag-list',
          tag: 'span',
          part: 'tag-list',
          children: [
            ...model.tags.map((tag): TreeSelectStructureNode => ({ key: `tag:${tag.value}`, tag: 'span', component: 'tag', part: 'tag', attrs: { value: tag.value }, text: tag.label })),
            { key: 'overflow-tag', tag: 'span', component: 'tag', part: 'overflow-tag' },
          ],
        } satisfies TreeSelectStructureNode]
        : []),
      { key: 'indicator', tag: 'span', part: 'indicator' },
    ],
  }
  const nodes: TreeSelectStructureNode[] = []
  if (slotted('label'))
    nodes.push({ key: 'label', tag: 'span', part: 'label', slot: { name: 'label' } })
  else if (options.label != null)
    nodes.push({ key: 'label', tag: 'span', part: 'label', text: options.label })
  nodes.push(
    {
      key: 'control',
      tag: 'div',
      part: 'control',
      children: options.clearable ? [trigger, { key: 'clear-trigger', tag: 'button', part: 'clear-trigger' }] : [trigger],
    },
    {
      key: 'positioner',
      tag: 'div',
      part: 'positioner',
      children: [{
        key: 'content',
        tag: 'div',
        part: 'content',
        children: [
          ...(options.searchable ? [{ key: 'input', tag: 'input', part: 'input' } satisfies TreeSelectStructureNode] : []),
          { key: 'tree', tag: 'div', part: 'tree', children: model.collection.map(nodeStructure) },
        ],
      }],
    },
  )
  return nodes
}
