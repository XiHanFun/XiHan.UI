/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 穿梭框的标准结构：左右两个面板，中间是两颗搬运按钮。
// Vue / React 不写默认插槽时的缺省树、Web Components 不写部件（或只写 root）时元素生成的节点，都照这一份渲。

import type { StructureNode } from '../shared/structure'
import type { transferAnatomy } from './transfer.anatomy'
import type { TransferApi, TransferItem, TransferSide } from './transfer.types'

type TransferPart = (typeof transferAnatomy)['parts'][number]

/** 结构会产出的部件；root 由组件或元素自己给出，不在其列。 */
export const TRANSFER_STRUCTURE_PARTS = [
  'source-panel',
  'target-panel',
  'panel-header',
  'panel-title',
  'panel-count',
  'select-all-trigger',
  'search',
  'list',
  'item',
  'item-checkbox',
  'item-text',
  'item-description',
  'empty',
  'loading',
  'to-target-trigger',
  'to-source-trigger',
] as const satisfies readonly TransferPart[]

/** anatomy 里不进标准结构的部件：表单影子由组件自己按值装配，分组与条目行尾由作者手写结构时自己摆。 */
export const TRANSFER_STRUCTURE_OMITS = [
  'hidden-input',
  'group',
  'group-label',
  'item-suffix',
] as const satisfies readonly TransferPart[]

type TransferStructurePart = (typeof TRANSFER_STRUCTURE_PARTS)[number]

type TransferNode = StructureNode<TransferStructurePart>

type TransferStructureModel = Pick<TransferApi, 'oneWay' | 'searchable' | 'visibleItems' | 'translations'>

/** 一个条目：勾选标记、文字，有副文本时再铺一行。 */
function itemStructure(item: TransferItem): TransferNode {
  const children: TransferNode[] = [
    { key: 'checkbox', tag: 'span', part: 'item-checkbox' },
    { key: 'text', tag: 'span', part: 'item-text', text: item.label },
  ]
  if (item.description != null)
    children.push({ key: 'description', tag: 'span', part: 'item-description', text: item.description })
  return { key: `item:${item.value}`, tag: 'div', part: 'item', attrs: { value: item.value }, children }
}

/** 一侧面板：头部（标题、计数、全选），开了搜索时一个搜索框，再是本侧的条目、空态与在途占位。 */
function panelStructure(model: TransferStructureModel, side: TransferSide): TransferNode {
  const t = model.translations
  const part = side === 'source' ? 'source-panel' : 'target-panel'
  const children: TransferNode[] = [{
    key: 'header',
    tag: 'div',
    part: 'panel-header',
    children: [
      { key: 'title', tag: 'span', part: 'panel-title', text: side === 'source' ? t.sourceTitle : t.targetTitle },
      { key: 'count', tag: 'span', part: 'panel-count' },
      { key: 'select-all', tag: 'button', part: 'select-all-trigger', text: t.selectAll },
    ],
  }]
  if (model.searchable)
    children.push({ key: 'search', tag: 'input', part: 'search' })
  children.push(
    { key: 'list', tag: 'div', part: 'list', children: model.visibleItems(side).map(itemStructure) },
    { key: 'empty', tag: 'div', part: 'empty', text: t.empty },
    { key: 'loading', tag: 'div', part: 'loading', text: t.loading },
  )
  return { key: part, tag: 'div', part, children }
}

/**
 * 穿梭框在 root 里的标准结构，次序是左侧面板、移到右侧、移回左侧（单向时不铺）、右侧面板。
 * 面板标题、全选、空态与在途的字取 translations；搬运按钮里不放字，箭头由皮肤画，名字由连接层给。
 * 每侧只铺本侧当前可见的条目，条目换侧时从一侧撤掉、在另一侧铺出。
 */
export function transferStructure(model: TransferStructureModel): TransferNode[] {
  const nodes: TransferNode[] = [
    panelStructure(model, 'source'),
    { key: 'to-target-trigger', tag: 'button', part: 'to-target-trigger' },
  ]
  if (!model.oneWay)
    nodes.push({ key: 'to-source-trigger', tag: 'button', part: 'to-source-trigger' })
  nodes.push(panelStructure(model, 'target'))
  return nodes
}
