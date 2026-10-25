/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 table 模块的公共接口。

export { tableAnatomy, tableRowQuery } from './table.anatomy'
export { buildTableHeaderRows, orderColumnIds, PREFIX_COLUMN_ID, resolveTableColumns, tableColumnAncestors, tableLeafColumns } from './table.columns'
export { connectTable } from './table.connect'
export {
  canOwnChildren,
  columnDragRects,
  columnMoveCommand,
  columnMoveIntentFromKey,
  draggableColumnIds,
  isSelfOrDescendantRow,
  reorderTableRows,
  rowGroupRects,
  rowReorderReason,
  tableRowMoveCommand,
  tableRowMoveOf,
  toColumnPreferenceIndex,
  treeRowIntentFromKey,
} from './table.drag'
export type { MeasuredRow, TableRowMove } from './table.drag'
export { tableKeyboard } from './table.keyboard'
export { measureTableLayout, sameTableLayout, TABLE_EMPTY_LAYOUT, tableLayoutNeeds } from './table.layout'
export type { TableLayoutNeeds } from './table.layout'
export { TABLE_COLUMN_LARGE_STEP, TABLE_COLUMN_MIN_WIDTH, TABLE_COLUMN_STEP, tableCascades, tableMachine, tableSelectionMode } from './table.machine'
export { tableMeta } from './table.meta'
export { computeTableDataView, TABLE_DEFAULT_PAGE_SIZE, tableCellText, tableColumnField, tableColumnValue, tableCompareValues, tableDataViewOf, tableRowDefs, tableVisibleDataRowCount } from './table.pipeline'
export type { TableDataInput, TableDataView } from './table.pipeline'
export { flattenTableRows, tableCascadeRoots, tableCascadeSelectableLeaves, tableRowSelected, tableSelectableRowIds, tableSelectionIds, tableSelectionState, tableToggleRowSelection, tableToggleSelectAll } from './table.rows'
export {
  tableNormalizeSort,
  tableSortDirectionOf,
  tableSortIndexOf,
  tableToggleSort,
} from './table.sort'
export type { TableToggleSortOptions } from './table.sort'
export { tablePaginationStructure, tableStructure } from './table.structure'
export type { TableCellSlotData, TableStructureOptions } from './table.structure'
export type { TableActionDetails, TableApi, TableCellProps, TableCellSpan, TableCellSpanDetails, TableColumn, TableColumnBase, TableColumnDef, TableColumnKind, TableColumnPreference, TableColumnPreferenceChangeDetails, TableColumnProps, TableColumnSetting, TableDropTarget, TableExpandedValueChangeDetails, TableField, TableFieldValue, TableFilterOption, TableFilterValue, TableFilterValueChangeDetails, TableFocusModel, TableFooterCellSpanDetails, TableFooterRowProps, TableHeaderCell, TableHeaderRowProps, TableLayout, TableNavigation, TablePageChangeDetails, TablePressedKey, TableRecord, TableRecordOf, TableRowDef, TableRowMoveDetails, TableRowProps, TableRowReorderReason, TableSchema, TableScrollEdges, TableSelection, TableSelectionChangeDetails, TableSelectionMode, TableSelectionState, TableSortChangeDetails, TableSortDescriptor, TableSortDirection, TableTranslations, TableVisibleRow } from './table.types'
