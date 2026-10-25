/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 表格的标准结构：表头逐层铺列头（拖拽把手、列名、排序钮、筛选钮、改宽把手），表体逐行逐格，再是在途与空态占位。
// Vue / React 不写默认插槽时的缺省树、Web Components 只写 root 时元素生成的节点，都照这一份渲。
// root 是 grid 系角色，子节点只能是行与行组：数据驱动模式的分页排在 root 之后，由 tablePaginationStructure 另给。

import type { StructureChild, StructureInstanceNode, StructureNode, StructureSlotted } from '../shared/structure'
import type { StructureVirtualItem, VirtualStructurePart } from '../shared/virtual-structure'
import type { tableAnatomy } from './table.anatomy'
import type { TableApi, TableColumn, TableField, TableFieldValue, TableHeaderCell, TableRecord, TableRecordOf, TableVisibleRow } from './table.types'
import { structureInstance } from '../shared/structure-instance'
import { virtualWindowStructure } from '../shared/virtual-structure'
import { tableColumnField } from './table.pipeline'

type TablePart = (typeof tableAnatomy)['parts'][number]

/** 结构会产出的部件；root 由组件或元素自己给出，不在其列。 */
export const TABLE_STRUCTURE_PARTS = [
  'header',
  'body',
  'row',
  'column-header',
  'column-label',
  'cell',
  'select-all-trigger',
  'row-select-trigger',
  'sort-trigger',
  'column-resize-trigger',
  'column-drag-trigger',
  'empty',
  'loading',
] as const satisfies readonly TablePart[]

/**
 * anatomy 里不进标准结构的部件：标题、工具条、列设置区与表尾由作者手写结构时自己摆；展开把手与详情行、
 * 行拖拽把手、取下一页按钮跟着手写的业务走；播报区由根组件或元素自己挂在 root 之外。
 */
export const TABLE_STRUCTURE_OMITS = [
  'footer',
  'caption',
  'toolbar',
  'column-list',
  'column-visibility-trigger',
  'row-drag-trigger',
  'expand-trigger',
  'expanded-row',
  'load-more-trigger',
  'live-region',
] as const satisfies readonly TablePart[]

type TableStructurePart = (typeof TABLE_STRUCTURE_PARTS)[number]

type TableNode = StructureNode<TableStructurePart>

/** 结构要读的那部分 api。 */
export type TableStructureModel = Pick<
  TableApi,
  'columns' | 'headerRows' | 'visibleRows' | 'draggableColumns' | 'selectionMode' | 'rowNumber' | 'recordOf' | 'cellText' | 'dataDriven' | 'filterValue' | 'setFilter' | 'translations'
>

export interface TableStructureOptions {
  /** 开了虚拟化时窗口里的条目（Virtualizer 的 virtualItems）；不开时省略，整页的数据行都铺。 */
  readonly virtualItems?: readonly StructureVirtualItem[]
  /** 作者给了哪些插槽的内容：cell（按 `<行 id>:<列 id>` 带 key）与 empty。 */
  readonly slotted?: StructureSlotted
}

/**
 * cell 插槽的参数：作者据此在格子里放徽标、链接这类内容；text 是不接管时会显示的那段文字，别的列照常交出它即可。
 * 给了行类型时 record 是那个类型，按 field 判出是哪个字段后 value 也跟着收窄；不读字段的列 field 为 null。
 */
export type TableCellSlotData<TRow extends object = TableRecord> = {
  readonly row: string
  readonly column: TableColumn
  /** 这一行的记录；手写 rows 的表格没有记录。 */
  readonly record: TableRecordOf<TRow> | undefined
  readonly text: string
} & (
  | { [K in TableField<TRow>]: { readonly field: K, readonly value: TableFieldValue<TRow, K> | undefined } }[TableField<TRow>]
  | { readonly field: null, readonly value: undefined }
)

const NOTHING_SLOTTED: StructureSlotted = () => false

const label = (text: string): TableNode => ({ key: 'label', tag: 'span', part: 'column-label', text })

/** 列头里那颗筛选钮：一张勾选型菜单，钮里没有字，漏斗由皮肤画，名字取 translations.filter(列名)。 */
function filterMenu(model: TableStructureModel, column: TableColumn): StructureInstanceNode {
  const options = column.filterOptions ?? []
  return structureInstance('filter', 'menu', {
    collection: options.map(option => ({ value: option.value, label: option.label ?? option.value, kind: 'checkbox' })),
    checkboxValue: model.filterValue[column.id] ?? [],
    onCheckboxValueChange: ({ value }) => model.setFilter(column.id, value),
    translations: { trigger: model.translations.filter(column.label ?? column.id) },
    size: 'sm',
    placement: 'bottom-end',
  })
}

/** 一列的列头里铺什么：按列的用途（前缀列）与声明（排序、筛选、改宽、拖拽）。 */
function leafHeaderContent(model: TableStructureModel, column: TableColumn): StructureChild<TableStructurePart>[] {
  if (column.kind === 'select')
    return model.selectionMode === 'multiple' ? [{ key: 'select-all', tag: 'span', part: 'select-all-trigger' }] : []
  if (column.kind === 'index')
    return [label('#')]
  if (column.kind === 'expand')
    return []
  const children: StructureChild<TableStructurePart>[] = []
  if (model.draggableColumns.includes(column.id))
    children.push({ key: 'drag', tag: 'span', part: 'column-drag-trigger' })
  children.push(label(column.label ?? column.id))
  if (column.sortable)
    children.push({ key: 'sort', tag: 'span', part: 'sort-trigger' })
  if (model.dataDriven && column.filterOptions?.length)
    children.push(filterMenu(model, column))
  if (column.resizable)
    children.push({ key: 'resize', tag: 'span', part: 'column-resize-trigger' })
  return children
}

/**
 * 表头里的一格。多级表头时写明所在的表头行（level），连接层据此认出叶子列在哪一层是起点、哪一层是占位；
 * 占位格不铺内容，只保住列宽、对读屏隐藏。
 */
function headerCell(model: TableStructureModel, cell: TableHeaderCell, levels: number): TableNode {
  const attrs: Record<string, string> = levels > 1 ? { value: cell.id, level: String(cell.level) } : { value: cell.id }
  const base = { key: `column-header:${cell.id}`, tag: 'div', part: 'column-header', attrs } as const
  if (cell.covered)
    return base
  if (!cell.leaf)
    return { ...base, children: [label(cell.label ?? cell.id)] }
  const column = model.columns.find(item => item.id === cell.id)
  return column ? { ...base, children: leafHeaderContent(model, column) } : base
}

/** 表体里的一格：前缀列放把手或序号，数据列放文字，作者给了 cell 插槽就交给作者。 */
function bodyCell(model: TableStructureModel, row: string, column: TableColumn, slotted: StructureSlotted): TableNode {
  const base = { key: `cell:${column.id}`, tag: 'div', part: 'cell', attrs: { value: column.id } } as const
  if (column.kind === 'select')
    return { ...base, children: [{ key: 'select', tag: 'span', part: 'row-select-trigger' }] }
  if (column.kind === 'index')
    return { ...base, text: model.rowNumber(row) }
  if (column.kind === 'expand')
    return base
  const text = model.cellText(row, column.id)
  const key = `${row}:${column.id}`
  if (!slotted('cell', key))
    return { ...base, text }
  const record = model.recordOf(row)
  const field = tableColumnField(column)
  const data: TableCellSlotData = field == null
    ? { row, column, record, text, field: null, value: undefined }
    : { row, column, record, text, field, value: record?.[field] }
  return { ...base, slot: { name: 'cell', key }, data }
}

function bodyRow(model: TableStructureModel, row: TableVisibleRow, slotted: StructureSlotted): TableNode {
  return {
    key: `row:${row.id}`,
    tag: 'div',
    part: 'row',
    attrs: { value: row.id },
    children: model.columns.map(column => bodyCell(model, row.id, column, slotted)),
  }
}

/**
 * 表格在 root 里的标准结构：表头（每层一行）、表体、在途占位、空态。表体只铺数据行，详情行跟着手写的展开业务走；
 * 开了虚拟化时表体里是 Virtualizer 的视口与窗口里那几行，滚的是表格根节点。
 */
export function tableStructure(model: TableStructureModel, options: TableStructureOptions = {}): StructureChild<TableStructurePart | VirtualStructurePart>[] {
  const slotted = options.slotted ?? NOTHING_SLOTTED
  const levels = model.headerRows.length
  const header: TableNode = {
    key: 'header',
    tag: 'div',
    part: 'header',
    children: model.headerRows.map((cells, index): TableNode => ({
      key: `header-row:${index + 1}`,
      tag: 'div',
      part: 'row',
      ...(levels > 1 ? { attrs: { level: String(index + 1) } } : {}),
      children: cells.map(cell => headerCell(model, cell, levels)),
    })),
  }
  const rows = model.visibleRows.filter(row => row.kind === 'data')
  const body: StructureNode<TableStructurePart | VirtualStructurePart> = {
    key: 'body',
    tag: 'div',
    part: 'body',
    children: options.virtualItems
      ? [virtualWindowStructure(options.virtualItems, (index) => {
          const row = rows[index]
          return row ? bodyRow(model, row, slotted) : null
        })]
      : rows.map(row => bodyRow(model, row, slotted)),
  }
  return [
    header,
    body,
    { key: 'loading', tag: 'div', part: 'loading', text: model.translations.loading },
    slotted('empty')
      ? { key: 'empty', tag: 'div', part: 'empty', slot: { name: 'empty' } }
      : { key: 'empty', tag: 'div', part: 'empty', text: model.translations.empty },
  ]
}

/**
 * root 之后的分页：数据驱动模式开了 pagination 时铺一组，按筛过的总条数算页数，翻页写回表格。
 * root 是 grid 系角色，分页只能是它的兄弟；没开时什么都不铺。
 */
export function tablePaginationStructure(model: Pick<TableApi, 'paginated' | 'recordCount' | 'page' | 'pageSize' | 'setPage'>): StructureInstanceNode[] {
  if (!model.paginated)
    return []
  return [structureInstance('pagination', 'pagination', {
    count: model.recordCount,
    page: model.page,
    pageSize: model.pageSize,
    onPageChange: ({ page }) => model.setPage(page),
  })]
}
