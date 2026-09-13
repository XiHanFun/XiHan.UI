/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 table 模块的公共接口。

export { tableAnatomy, tableRowQuery } from './table.anatomy'
export { orderColumnIds, PREFIX_COLUMN_ID, resolveTableColumns } from './table.columns'
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
export { TABLE_COLUMN_LARGE_STEP, TABLE_COLUMN_MIN_WIDTH, TABLE_COLUMN_STEP, tableMachine, tableSelectionMode } from './table.machine'
export { tableMeta } from './table.meta'
export {
  flattenTableRows,
  tableRowSelected,
  tableSelectableRowIds,
  tableSelectionIds,
  tableSelectionState,
  tableToggleRowSelection,
  tableToggleSelectAll,
} from './table.rows'
export {
  tableNormalizeSort,
  tableSortDirectionOf,
  tableSortIndexOf,
  tableToggleSort,
} from './table.sort'
export type { TableToggleSortOptions } from './table.sort'
export type { TableApi, TableCellProps, TableColumn, TableColumnDef, TableColumnKind, TableColumnPreference, TableColumnPreferenceChangeDetails, TableColumnProps, TableColumnSetting, TableDropTarget, TableExpandedValueChangeDetails, TableFocusModel, TableRowDef, TableRowMoveDetails, TableRowProps, TableRowReorderReason, TableSchema, TableSelection, TableSelectionChangeDetails, TableSelectionMode, TableSelectionState, TableSortChangeDetails, TableSortDescriptor, TableSortDirection, TableTranslations, TableVisibleRow } from './table.types'
