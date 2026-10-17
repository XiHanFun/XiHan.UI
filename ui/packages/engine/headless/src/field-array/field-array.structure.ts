/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 字段数组的标准结构：列表排布是一行一个条目（行号、作者内容、把手），表格排布是表格本体里的表头与各行；
// 最后是新增把手。行号、换序与删除把手、表头由结构铺，每行（表格排布下每格）的控件归作者。
// Vue / React 不写默认插槽时的缺省树、Web Components 不写部件（或只写 root）时元素生成的节点，都照这一份渲。

import type { StructureNode } from '../shared/structure'
import type { fieldArrayAnatomy } from './field-array.anatomy'
import type { FieldArrayApi, FieldArrayColumn, FieldArrayItem } from './field-array.types'

type FieldArrayPart = (typeof fieldArrayAnatomy)['parts'][number]

/** 结构会产出的部件；root 由组件或元素自己给出，不在其列。 */
export const FIELD_ARRAY_STRUCTURE_PARTS = [
  'table',
  'header',
  'column-header',
  'item',
  'item-label',
  'item-content',
  'item-cell',
  'item-action',
  'add-trigger',
  'item-delete-trigger',
  'move-up-trigger',
  'move-down-trigger',
] as const satisfies readonly FieldArrayPart[]

/** anatomy 里不进标准结构的部件。 */
export const FIELD_ARRAY_STRUCTURE_OMITS = [] as const satisfies readonly FieldArrayPart[]

type FieldArrayStructurePart = (typeof FIELD_ARRAY_STRUCTURE_PARTS)[number]

type FieldArrayNode = StructureNode<FieldArrayStructurePart>

/** 表格排布下一格作者内容的载荷：所在的行与列。 */
export interface FieldArrayCellSlotData {
  item: FieldArrayItem
  column: FieldArrayColumn
}

type FieldArrayStructureModel = Pick<FieldArrayApi, 'items' | 'layout' | 'columns' | 'movable' | 'translations'>

/** 一行：行号，作者内容（列表排布是一整块，表格排布是一列一格），把手。 */
function itemNode(model: FieldArrayStructureModel, item: FieldArrayItem): FieldArrayNode {
  const index = String(item.index)
  const body: FieldArrayNode[] = model.layout === 'table'
    ? model.columns.map((column): FieldArrayNode => ({
        key: `cell:${column.id}`,
        tag: 'div',
        part: 'item-cell',
        attrs: { value: column.id },
        slot: { name: 'item-cell', key: `${item.key}:${column.id}` },
        data: { item, column } satisfies FieldArrayCellSlotData,
      }))
    : [{ key: 'content', tag: 'div', part: 'item-content', slot: { name: 'item-content', key: item.key }, data: item }]
  const actions: FieldArrayNode[] = model.movable
    ? [
        { key: 'move-up', tag: 'button', part: 'move-up-trigger' },
        { key: 'move-down', tag: 'button', part: 'move-down-trigger' },
      ]
    : []
  actions.push({ key: 'delete', tag: 'button', part: 'item-delete-trigger' })
  return {
    key: `item:${item.key}`,
    tag: 'div',
    part: 'item',
    attrs: { index },
    children: [
      { key: 'label', tag: 'span', part: 'item-label', text: String(item.index + 1) },
      ...body,
      { key: 'action', tag: 'div', part: 'item-action', children: actions },
    ],
  }
}

/**
 * 字段数组在 root 里的标准结构。
 * - 列表排布：各行直接排在 root 里；每行是行号、作者内容（slot 名 item-content，key 是行 key）与把手。
 * - 表格排布：表格本体里先是表头（每列一个列头，文字由组件按列的 label 填），再是各行；行里每列一格作者内容
 *   （slot 名 item-cell，key 是「行 key:列 id」）。
 * - 把手：开了 movable 时先铺上移与下移，再是删除；最后是 root 里的新增把手，文字取 translations.addTrigger。
 * 行 key 由组件分配，换序时作者内容跟着行走。
 */
export function fieldArrayStructure(model: FieldArrayStructureModel): FieldArrayNode[] {
  const rows = model.items.map(item => itemNode(model, item))
  const add: FieldArrayNode = { key: 'add-trigger', tag: 'button', part: 'add-trigger', text: model.translations.addTrigger }
  if (model.layout !== 'table')
    return [...rows, add]
  return [
    {
      key: 'table',
      tag: 'div',
      part: 'table',
      children: [
        {
          key: 'header',
          tag: 'div',
          part: 'header',
          children: model.columns.map((column): FieldArrayNode => ({ key: `column:${column.id}`, tag: 'div', part: 'column-header', attrs: { value: column.id } })),
        },
        ...rows,
      ],
    },
    add,
  ]
}
