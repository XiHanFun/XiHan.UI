# Table

Data display component. This page is the API reference, generated from the source code. Usage guidance and live examples are on the [Chinese page](/components/table).

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/table" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/table.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/table" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/table" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/table.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## Anatomy

Parts in bold are required.

`data-scope="table"`: **`root`** · `header` · **`body`** · `footer` · `row` · `column-header` · `column-label` · `cell` · `caption` · `toolbar` · `column-list` · `column-visibility-trigger` · `select-all-trigger` · `row-select-trigger` · `sort-trigger` · `column-resize-trigger` · `column-drag-trigger` · `row-drag-trigger` · `expand-trigger` · `expanded-row` · `empty` · `loading` · `load-more-trigger` · `live-region`

## API reference

Descriptions of individual props, events and slots are written in Chinese and appear on the Chinese page.

### Artifacts

| Layer | Value |
| --- | --- |
| Custom element | `<xh-table>` |
| Vue components | `XhTableBody` `XhTableCaption` `XhTableCell` `XhTableColumnDragTrigger` `XhTableColumnHeader` `XhTableColumnLabel` `XhTableColumnList` `XhTableColumnResizeTrigger` `XhTableColumnVisibilityTrigger` `XhTableEmpty` `XhTableExpandTrigger` `XhTableExpandedRow` `XhTableFooter` `XhTableHeader` `XhTableLoadMoreTrigger` `XhTableLoading` `XhTableRoot` `XhTableRow` `XhTableRowDragTrigger` `XhTableRowSelectTrigger` `XhTableSelectAllTrigger` `XhTableSortTrigger` `XhTableToolbar` |
| Composable | `useTable` |
| State machine | `tableMachine` |
| Skin | `@xihan-ui/styles/table.css` |

### Props

| Prop | Type | Required |
| --- | --- | --- |
| `captioned` | `boolean` |  |
| `columns` | `TableColumnDef<TRow>[]` |  |
| `rows` | `TableRowDef[]` |  |
| `data` | `readonly TRow[]` |  |
| `rowKey` | `TableField<TRow> \| ((record: TableRecordOf<TRow>) => string)` |  |
| `filterValue` | `TableFilterValue` |  |
| `defaultFilterValue` | `TableFilterValue` |  |
| `pagination` | `boolean` |  |
| `defaultPage` | `number` |  |
| `sort` | `TableSortDescriptor[]` |  |
| `defaultSort` | `TableSortDescriptor[]` |  |
| `selection` | `TableSelection` |  |
| `defaultSelection` | `TableSelection` |  |
| `expandedValue` | `string[]` |  |
| `defaultExpandedValue` | `string[]` |  |
| `selectionMode` | `TableSelectionMode` |  |
| `virtualizer` | `CollectionVirtualizer` |  |
| `cellSpan` | `(details: TableCellSpanDetails) => TableCellSpan \| null \| undefined` |  |
| `footerCellSpan` | `(details: TableFooterCellSpanDetails) => TableCellSpan \| null \| undefined` |  |
| `cascade` | `boolean` |  |
| `tree` | `boolean` |  |
| `checkedStrategy` | `CascadeStrategy` |  |
| `prefixColumns` | `TableColumnKind[]` |  |
| `columnPreference` | `TableColumnPreference` |  |
| `defaultColumnPreference` | `TableColumnPreference` |  |
| `page` | `number` |  |
| `pageSize` | `number` |  |
| `loading` | `boolean` |  |
| `empty` | `boolean` |  |
| `stickyHeader` | `boolean` |  |
| `striped` | `boolean` |  |
| `variant` | `ControlVariant` |  |
| `ruled` | `boolean` |  |
| `footerRows` | `number` |  |
| `stickyFooter` | `boolean` |  |
| `loop` | `boolean` |  |
| `navigation` | `TableNavigation` |  |
| `dir` | `Direction` |  |
| `size` | `Size` |  |
| `translations` | `Partial<TableTranslations>` |  |
| `rowReorderable` | `boolean` |  |
| `onRowMove` | `(details: TableRowMoveDetails) => void` |  |
| `allowRowDrop` | `(move: TableRowMoveDetails) => boolean` |  |
| `onColumnPreferenceChange` | `(details: TableColumnPreferenceChangeDetails) => void` |  |
| `onSortChange` | `(details: TableSortChangeDetails) => void` |  |
| `onFilterValueChange` | `(details: TableFilterValueChangeDetails) => void` |  |
| `onPageChange` | `(details: TablePageChangeDetails) => void` |  |
| `onSelectionChange` | `(details: TableSelectionChangeDetails) => void` |  |
| `onExpandedValueChange` | `(details: TableExpandedValueChangeDetails) => void` |  |
| `onAction` | `(details: TableActionDetails) => void` |  |

### TableColumnDef

Elements of `columns`.

| Field | Type | Required |
| --- | --- | --- |
| `id` | `string` | Yes |
| `field` | `TableField<TRow> \| null` |  |
| `label` | `string` |  |
| `sortable` | `boolean` |  |
| `sticky` | `boolean \| 'start' \| 'end'` |  |
| `width` | `string \| number` |  |
| `minWidth` | `number` |  |
| `maxWidth` | `number` |  |
| `resizable` | `boolean` |  |
| `children` | `TableColumnDef<TRow>[]` |  |
| `reorderable` | `boolean` |  |
| `align` | `'start' \| 'center' \| 'end'` |  |
| `rowHeader` | `boolean \| ((row: TableRowDef, rowIndex: number) => boolean)` |  |
| `compare` | `(a: TableRecordOf<TRow>, b: TableRecordOf<TRow>) => number` |  |
| `filterOptions` | `TableFilterOption[]` |  |
| `filter` | `(record: TableRecordOf<TRow>, values: readonly string[]) => boolean` |  |
| `format` | `(value: TValue, record: TableRecordOf<TRow>) => string` |  |

### TableRowDef

Elements of `rows`.

| Field | Type | Required |
| --- | --- | --- |
| `id` | `string` | Yes |
| `disabled` | `boolean` |  |
| `expandable` | `boolean` |  |
| `parentId` | `string` |  |

### TableSortDescriptor

Elements of `sort`.

| Field | Type | Required |
| --- | --- | --- |
| `id` | `string` | Yes |
| `direction` | `TableSortDirection` | Yes |

### Events

Custom elements put the payload in `detail`; Vue emits an event of the same name.

| Event | Payload |
| --- | --- |
| `sort-change` | `TableSortChangeDetails` |
| `filter-value-change` | `TableFilterValueChangeDetails` |
| `page-change` | `TablePageChangeDetails` |
| `column-preference-change` | `TableFooterCellSpanDetails` |
| `selection-change` | `TableSelectionChangeDetails` |
| `expanded-value-change` | `TableExpandedValueChangeDetails` |
| `action` | `TableActionDetails` |
| `row-move` | `TableRowMoveDetails` |

### Slots

Only slots with a payload are listed.

| Vue component | Slot | Payload |
| --- | --- | --- |
| `XhTableRoot` | `default` | `TableRootSlotProps` |
| `XhTableRoot` | `toolbar` | `TableToolbarSlotProps` |
| `XhTableRoot` | `cell` | `TableCellSlotData` |
| `XhTableRoot` | `empty` | — |

### React adapter props

Only the props each component declares itself: DOM attributes inherited from `ComponentPropsWithRef` are left out, and root props already listed in the Props table are not repeated. The Vue counterpart is the slot table above.

| React component | Prop | Type | Required |
| --- | --- | --- | --- |
| `XhTableCell` | `value` | `string` | Yes |
| `XhTableCell` | `colspan` | `number \| string` |  |
| `XhTableColumnHeader` | `value` | `string` | Yes |
| `XhTableColumnHeader` | `level` | `number \| string` |  |
| `XhTableColumnVisibilityTrigger` | `value` | `string` |  |
| `XhTableExpandedRow` | `value` | `string` | Yes |
| `XhTableRoot` | `virtual` | `boolean` |  |
| `XhTableRoot` | `estimateSize` | `number` |  |
| `XhTableRoot` | `renderCell` | `(cell: TableCellSlotData<TRow>) => ReactNode` |  |
| `XhTableRoot` | `renderEmpty` | `() => ReactNode` |  |
| `XhTableRoot` | `toolbar` | `SlotChildren<TableToolbarSlotProps>` |  |
| `XhTableRoot` | `children` | `SlotChildren<TableRootSlotProps>` |  |
| `XhTableRow` | `value` | `string` |  |
| `XhTableRow` | `level` | `number \| string` |  |

### State

Public state is written to `data-state`.

| Part | Values |
| --- | --- |
| `row` | 'open' \| 'closed' \| undefined |
| `column-visibility-trigger` | 'unchecked' \| 'checked' |
| `select-all-trigger` | tableSelectionState([...cascaded.checked], tableCasca… \| tableSelectionState(selection, selectableIds) |
| `row-select-trigger` | 'open' \| 'closed' \| undefined |
| `expand-trigger` | 'open' \| 'closed' \| undefined |
| `expanded-row` | 'open' \| 'closed' |

The following names are internal to the state machine.

**States**: `idle` · `resizing` · `columnDragging` · `rowDragging`

**Events**: `SORT.SET` · `SORT.TOGGLE` · `FILTER.SET` · `PAGE.SET` · `COLUMN_PREF.SET` · `COLUMN_RESIZE.START` · `COLUMN_RESIZE.MOVE` · `COLUMN_RESIZE.END` · `COLUMN_RESIZE.CANCEL` · `COLUMN_RESIZE.STEP` · `COLUMN_DRAG.START` · `COLUMN_DRAG.MOVE` · `COLUMN_DRAG.END` · `COLUMN_DRAG.CANCEL` · `COLUMN.MOVE_BY` · `ROW_DRAG.START` · `ROW_DRAG.MOVE` · `ROW_DRAG.END` · `ROW_DRAG.CANCEL` · `ROW.MOVE_BY` · `ROW.REORDER_BLOCKED` · `COLUMN_PREF.PATCH` · `SELECTION.SET` · `ROW.SELECT` · `SELECTION.ALL_TOGGLE` · `EXPANDED.SET` · `ROW.EXPAND` · `ROW.COLLAPSE` · `ROW.EXPAND_TOGGLE` · `ROW.FOCUS` · `CELL.FOCUS` · `TABLE.BLUR` · `PRESS.START` · `PRESS.END`

**Guards**: `canPress`

### connect API

`getXxxProps()` returns the host attributes of the matching part.

| Member | Type |
| --- | --- |
| `columns` | `readonly TableColumn[]` |
| `draggableColumns` | `readonly string[]` |
| `rowReorderDisabledReason` | `TableRowReorderReason \| null` |
| `dropTarget` | `TableDropTarget \| null` |
| `announcement` | `string` |
| `rows` | `readonly TableRowDef[]` |
| `visibleRows` | `readonly TableVisibleRow[]` |
| `sort` | `TableSortDescriptor[]` |
| `dataDriven` | `boolean` |
| `records` | `readonly TableRecord[]` |
| `recordCount` | `number` |
| `recordOf` | `(rowId: string) => TableRecord \| undefined` |
| `cellText` | `(rowId: string, columnId: string) => string` |
| `filterValue` | `TableFilterValue` |
| `setFilter` | `(columnId: string, values: string[]) => void` |
| `paginated` | `boolean` |
| `page` | `number` |
| `pageSize` | `number` |
| `pageCount` | `number` |
| `setPage` | `(page: number) => void` |
| `translations` | `TableTranslations` |
| `selection` | `TableSelection` |
| `selectionState` | `TableSelectionState` |
| `selectionMode` | `TableSelectionMode` |
| `expandedValue` | `string[]` |
| `focusedRow` | `string \| null` |
| `focusedColumn` | `string \| null` |
| `navigation` | `TableNavigation` |
| `loading` | `boolean` |
| `empty` | `boolean` |
| `rowCount` | `number` |
| `footerRowCount` | `number` |
| `columnCount` | `number` |
| `headerRows` | `readonly (readonly TableHeaderCell[])[]` |
| `headerRowCount` | `number` |
| `cellSpanOf` | `(rowId: string, columnId: string) => { rowSpan: number, colSpan: number, covered: boolean }` |
| `isSelected` | `(value: string) => boolean` |
| `isExpanded` | `(value: string) => boolean` |
| `sortDirection` | `(value: string) => TableSortDirection \| null` |
| `sortPriority` | `(value: string) => number` |
| `setSort` | `(next: TableSortDescriptor[]) => void` |
| `toggleSort` | `(value: string, options?: { append?: boolean }) => void` |
| `setSelection` | `(next: TableSelection) => void` |
| `selectRow` | `(value: string, options?: { extend?: boolean }) => void` |
| `toggleSelectAll` | `() => void` |
| `setExpandedValue` | `(next: string[]) => void` |
| `expandRow` | `(value: string) => void` |
| `collapseRow` | `(value: string) => void` |
| `toggleExpandRow` | `(value: string) => void` |
| `getRootProps` | `() => T['element']` |
| `getCaptionProps` | `() => T['element']` |
| `getToolbarProps` | `() => T['element']` |
| `getColumnListProps` | `() => T['element']` |
| `getColumnVisibilityTriggerProps` | `(props: TableColumnProps) => T['element']` |
| `getHeaderProps` | `() => T['element']` |
| `getBodyProps` | `() => T['element']` |
| `getFooterProps` | `() => T['element']` |
| `getHeaderRowProps` | `(props?: TableHeaderRowProps) => T['element']` |
| `getFooterRowProps` | `(props?: TableFooterRowProps) => T['element']` |
| `rowNumber` | `(rowId: string) => string` |
| `columnPreference` | `TableColumnPreference` |
| `columnSettings` | `readonly TableColumnSetting[]` |
| `setColumnHidden` | `(columnId: string, hidden: boolean) => void` |
| `setColumnSticky` | `(columnId: string, sticky: boolean \| 'start' \| 'end') => void` |
| `moveColumn` | `(columnId: string, toIndex: number) => void` |
| `setColumnWidth` | `(columnId: string, width: number \| string) => void` |
| `setColumnPreference` | `(next?: TableColumnPreference) => void` |
| `getRowProps` | `(props: TableRowProps) => T['element']` |
| `getColumnHeaderProps` | `(props: TableColumnProps) => T['element']` |
| `getColumnLabelProps` | `() => T['element']` |
| `getCellProps` | `(props: TableCellProps) => T['element']` |
| `getSelectAllTriggerProps` | `() => T['element']` |
| `getRowSelectTriggerProps` | `(props: TableRowProps) => T['element']` |
| `getSortTriggerProps` | `(props: TableColumnProps) => T['element']` |
| `getColumnResizeTriggerProps` | `(props: TableColumnProps) => T['element']` |
| `getColumnDragTriggerProps` | `(props: TableColumnProps) => T['element']` |
| `getRowDragTriggerProps` | `(props: TableRowProps) => T['element']` |
| `getExpandTriggerProps` | `(props: TableRowProps) => T['element']` |
| `getExpandedRowProps` | `(props: TableRowProps) => T['element']` |
| `getEmptyProps` | `() => T['element']` |
| `getLoadingProps` | `() => T['element']` |
| `getLoadMoreTriggerProps` | `() => T['element']` |
| `getLiveRegionProps` | `() => T['element']` |

## Accessibility

### Keyboard

Specification: [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/grid/#keyboardinteraction). Each row is a stable behavior id that the conformance tests cover; the conditions and effects are described on the Chinese page.

| Keys | Behavior |
| --- | --- |
| `Enter` / `Space` | `table.kbd.press` |
| `Tab` / `Shift+Tab` | `table.kbd.tab` |
| `ArrowDown` | `table.kbd.next` |
| `ArrowUp` | `table.kbd.prev` |
| `Home` | `table.kbd.first` |
| `End` | `table.kbd.last` |
| `Enter` | `table.kbd.action` |
| `Space` | `table.kbd.select` |
| `ArrowRight` | `table.kbd.expand` |
| `ArrowLeft` | `table.kbd.collapse` |
| `Enter` / `Space` | `table.kbd.sort` |
| `Enter` / `Space` | `table.kbd.select-all` |
| `Enter` / `Space` | `table.kbd.column-visibility` |
| `Ctrl+A` / `Cmd+A` | `table.kbd.select-all-body` |
| `ArrowLeft` / `ArrowRight` | `table.kbd.column-resize` |
| `Shift+ArrowLeft` / `Shift+ArrowRight` | `table.kbd.column-resize-large` |
| `ArrowLeft` / `ArrowRight` | `table.kbd.column-move` |
| `Home` / `End` | `table.kbd.column-move-edge` |
| `ArrowRight` | `table.kbd.cell-enter` |
| `ArrowLeft` | `table.kbd.cell-parent` |
| `ArrowRight` / `ArrowLeft` | `table.kbd.cell-move` |
| `ArrowDown` / `ArrowUp` | `table.kbd.cell-column` |
| `Home` / `End` | `table.kbd.cell-row-edge` |
| `Ctrl+Home` / `Ctrl+End` | `table.kbd.cell-column-edge` |
| `Enter` / `F2` | `table.kbd.cell-edit` |
| `Tab` / `Shift+Tab` | `table.kbd.cell-edit-tab` |
| `Escape` / `F2` | `table.kbd.cell-edit-exit` |
| `Alt+ArrowUp` / `Alt+ArrowDown` | `table.kbd.row-move` |
| `Alt+ArrowLeft` / `Alt+ArrowRight` | `table.kbd.row-indent` |

### ARIA

These attributes are produced by `connect`.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `aria-busy` | 'true' \| undefined |
| `root` | `aria-colcount` | columns.length \|\| undefined |
| `root` | `aria-labelledby` | id of the `caption` part \| undefined |
| `root` | `aria-multiselectable` | 'true' \| 'false' |
| `root` | `aria-rowcount` | headerRowCount + visibleRows.length + footerRowCount |
| `root` | `role` | 'treegrid' \| 'grid' |
| `header` | `role` | 'rowgroup' |
| `body` | `role` | 'rowgroup' |
| `footer` | `role` | 'rowgroup' |
| `row` | `aria-controls` | id of the `detail` part \| undefined |
| `row` | `aria-disabled` | 'true' \| 'false' |
| `row` | `aria-expanded` | 'true' \| 'false' \| undefined |
| `row` | `aria-level` | metaIndex.get(row.value)?.level \| undefined |
| `row` | `aria-posinset` | metaIndex.get(row.value)?.posInSet \| undefined |
| `row` | `aria-rowindex` | dataRowIndex.get(row.value) |
| `row` | `aria-selected` | 'true' \| 'false' \| undefined |
| `row` | `aria-setsize` | metaIndex.get(row.value)?.setSize \| undefined |
| `row` | `role` | 'row' |
| `column-header` | `aria-colindex` | cell.colIndex |
| `column-header` | `aria-colspan` | cell.colSpan \| undefined |
| `column-header` | `aria-hidden` | 'true' |
| `column-header` | `aria-rowspan` | cell.rowSpan \| undefined |
| `column-header` | `aria-sort` | 'ascending' \| 'descending' \| 'none' \| undefined |
| `column-header` | `role` | 'columnheader' |
| `cell` | `aria-colindex` | columnIndex.get(cell.value) |
| `cell` | `aria-colspan` | Math.max(cell.colSpan ?? 1, origin?.colSpan ?? 1) \| undefined |
| `cell` | `aria-hidden` | 'true' |
| `cell` | `aria-rowspan` | origin.rowSpan \| undefined |
| `cell` | `role` | 'rowheader' \| 'gridcell' |
| `toolbar` | `aria-label` | label.toolbar |
| `column-list` | `aria-label` | label.columnList |
| `column-list` | `role` | 'group' |
| `column-visibility-trigger` | `aria-checked` | 'false' \| 'true' |
| `column-visibility-trigger` | `aria-disabled` | 'false' \| 'true' |
| `column-visibility-trigger` | `aria-label` | label.columnVisibility(def?.label ?? column.value) |
| `column-visibility-trigger` | `role` | 'checkbox' |
| `select-all-trigger` | `aria-checked` | 'true' \| 'mixed' \| 'false' |
| `select-all-trigger` | `aria-disabled` | 'false' \| 'true' |
| `select-all-trigger` | `aria-label` | label.selectAll |
| `select-all-trigger` | `role` | 'checkbox' |
| `row-select-trigger` | `aria-hidden` | 'true' |
| `sort-trigger` | `aria-disabled` | 'false' \| 'true' |
| `sort-trigger` | `aria-label` | label.sort(def?.label ?? column.value) |
| `sort-trigger` | `role` | 'button' |
| `column-resize-trigger` | `aria-disabled` | 'false' \| 'true' |
| `column-resize-trigger` | `aria-label` | label.columnResize(def?.label ?? column.value) |
| `column-resize-trigger` | `aria-orientation` | 'vertical' |
| `column-resize-trigger` | `aria-valuemax` | def?.maxWidth \| undefined |
| `column-resize-trigger` | `aria-valuemin` | def?.minWidth \| undefined |
| `column-resize-trigger` | `aria-valuenow` | columnNumericWidth(context.get('columnPreference').wi… |
| `column-resize-trigger` | `role` | 'separator' |
| `column-drag-trigger` | `aria-disabled` | 'false' \| 'true' |
| `column-drag-trigger` | `aria-label` | label.columnDrag(def?.label ?? column.value) |
| `column-drag-trigger` | `aria-roledescription` | label.columnDragRoleDescription |
| `column-drag-trigger` | `role` | 'button' |
| `row-drag-trigger` | `aria-hidden` | 'true' |
| `expand-trigger` | `aria-hidden` | 'true' |
| `expanded-row` | `aria-level` | (metaIndex.get(row.value)?.level ?? 1) + 1 \| undefined |
| `expanded-row` | `aria-posinset` | 1 \| undefined |
| `expanded-row` | `aria-rowindex` | detailRowIndex.get(row.value) |
| `expanded-row` | `aria-setsize` | 1 \| undefined |
| `expanded-row` | `role` | 'row' |
| `live-region` | `aria-atomic` | 'true' |
| `live-region` | `aria-live` | 'polite' |
| `live-region` | `role` | 'status' |
| `header-row` | `aria-rowindex` | Math.max(1, Math.min(Math.trunc(header?.level ?? 1) \|… |
| `footer-row` | `aria-rowindex` | headerRowCount + visibleRows.length + level \| undefined |
| `header-row` | `role` | 'row' |
| `footer-row` | `role` | 'row' |

## Style reference

### Skin

`@xihan-ui/styles/table.css` is written against `[data-scope="table"][data-part="root"]` part selectors; the published build uses the mount class `.xh-scope-table` in place of data-scope (same specificity) and sits in the `xihan.components` layer. Put overrides in `xihan.overrides`; the part selectors work as usual.

### Data attributes

Produced by `connect`; valueless attributes are omitted while their condition does not hold.

| Part | Attribute | Value |
| --- | --- | --- |
| `root` | `data-at-max-horizontal` | '' (present only while the condition holds) |
| `root` | `data-at-min-horizontal` | '' (present only while the condition holds) |
| `root` | `data-empty` | '' (present only while the condition holds) |
| `root` | `data-fixed` | '' (present only while the condition holds) |
| `root` | `data-loading` | '' (present only while the condition holds) |
| `root` | `data-size` | props.size |
| `root` | `data-split` | '' (present only while the condition holds) |
| `root` | `data-striped` | '' (present only while the condition holds) |
| `root` | `data-variant` | props.variant |
| `header` | `data-fixed` | '' (present only while the condition holds) |
| `body` | `data-empty` | '' (present only while the condition holds) |
| `footer` | `data-fixed` | '' (present only while the condition holds) |
| `row` | `data-disabled` | '' (present only while the condition holds) |
| `row` | `data-draggable` | '' (present only while the condition holds) |
| `row` | `data-dragging` | '' (present only while the condition holds) |
| `row` | `data-drop` | 'before' \| 'after' \| 'inside' |
| `row` | `data-highlighted` | '' (present only while the condition holds) |
| `row` | `data-pressed` | '' (present only while the condition holds) |
| `row` | `data-section` | 'body' |
| `row` | `data-selected` | '' (present only while the condition holds) |
| `row` | `data-state` | 'open' \| 'closed' \| undefined |
| `row` | `data-xh-collection-context` | 'page' |
| `row` | `data-xh-collection-item` | '' |
| `row` | `data-xh-collection-size` | props.size |
| `column-header` | `data-align` | def?.align |
| `column-header` | `data-covered` | '' (present only while the condition holds) |
| `column-header` | `data-dragging` | '' (present only while the condition holds) |
| `column-header` | `data-drop` | 'before' \| 'after' |
| `column-header` | `data-filtered` | '' (present only while the condition holds) |
| `column-header` | `data-frozen` | undefined |
| `column-header` | `data-frozen-edge` | '' (present only while the condition holds) |
| `column-header` | `data-group` | '' (present only while the condition holds) |
| `column-header` | `data-row-span` | '' (present only while the condition holds) |
| `column-header` | `data-sort` | 'asc' \| 'desc' |
| `column-header` | `data-sort-index` | tableSortIndexOf(sort, value) \| undefined |
| `column-header` | `data-sortable` | '' (present only while the condition holds) |
| `cell` | `data-align` | def?.align |
| `cell` | `data-covered` | '' (present only while the condition holds) |
| `cell` | `data-disabled` | '' (present only while the condition holds) \| undefined |
| `cell` | `data-dragging` | '' (present only while the condition holds) |
| `cell` | `data-drop` | 'before' \| 'after' |
| `cell` | `data-frozen` | undefined |
| `cell` | `data-frozen-edge` | '' (present only while the condition holds) |
| `cell` | `data-row-span` | '' (present only while the condition holds) |
| `cell` | `data-selected` | '' (present only while the condition holds) \| undefined |
| `toolbar` | `data-size` | props.size |
| `column-list` | `data-size` | props.size |
| `column-visibility-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `column-visibility-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `column-visibility-trigger` | `data-state` | 'unchecked' \| 'checked' |
| `column-visibility-trigger` | `data-xh-action-control` | '' |
| `column-visibility-trigger` | `data-xh-action-display` | 'always' |
| `column-visibility-trigger` | `data-xh-action-profile` | 'icon' |
| `column-visibility-trigger` | `data-xh-action-size` | props.size |
| `column-visibility-trigger` | `data-xh-action-variant` | 'outline' |
| `column-visibility-trigger` | `data-xh-check-mark` | 'unchecked' \| 'checked' |
| `column-visibility-trigger` | `data-xh-check-mark-profile` | 'box' |
| `select-all-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `select-all-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `select-all-trigger` | `data-state` | tableSelectionState([...cascaded.checked], tableCasca… \| tableSelectionState(selection, selectableIds) |
| `select-all-trigger` | `data-xh-action-control` | '' |
| `select-all-trigger` | `data-xh-action-display` | 'always' |
| `select-all-trigger` | `data-xh-action-profile` | 'icon' |
| `select-all-trigger` | `data-xh-action-size` | props.size |
| `select-all-trigger` | `data-xh-action-variant` | 'outline' |
| `select-all-trigger` | `data-xh-check-mark` | tableSelectionState([...cascaded.checked], tableCasca… \| tableSelectionState(selection, selectableIds) |
| `select-all-trigger` | `data-xh-check-mark-profile` | 'box' |
| `row-select-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `row-select-trigger` | `data-highlighted` | '' (present only while the condition holds) |
| `row-select-trigger` | `data-indeterminate` | '' (present only while the condition holds) |
| `row-select-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `row-select-trigger` | `data-selected` | '' (present only while the condition holds) |
| `row-select-trigger` | `data-state` | 'open' \| 'closed' \| undefined |
| `row-select-trigger` | `data-xh-action-control` | '' |
| `row-select-trigger` | `data-xh-action-display` | 'always' |
| `row-select-trigger` | `data-xh-action-profile` | 'icon' |
| `row-select-trigger` | `data-xh-action-size` | props.size |
| `row-select-trigger` | `data-xh-action-variant` | 'outline' |
| `row-select-trigger` | `data-xh-check-mark` | 'checked' \| 'indeterminate' \| 'unchecked' |
| `row-select-trigger` | `data-xh-check-mark-profile` | 'box' |
| `sort-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `sort-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `sort-trigger` | `data-sort` | 'asc' \| 'desc' |
| `sort-trigger` | `data-sort-index` | tableSortIndexOf(sort, value) \| undefined |
| `sort-trigger` | `data-xh-action-control` | '' |
| `sort-trigger` | `data-xh-action-display` | 'always' |
| `sort-trigger` | `data-xh-action-profile` | 'icon' |
| `sort-trigger` | `data-xh-action-size` | props.size |
| `sort-trigger` | `data-xh-action-variant` | 'ghost' |
| `column-resize-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `column-resize-trigger` | `data-resizing` | '' (present only while the condition holds) |
| `column-drag-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `column-drag-trigger` | `data-dragging` | '' (present only while the condition holds) |
| `row-drag-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `row-drag-trigger` | `data-dragging` | '' (present only while the condition holds) |
| `expand-trigger` | `data-disabled` | '' (present only while the condition holds) |
| `expand-trigger` | `data-highlighted` | '' (present only while the condition holds) |
| `expand-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `expand-trigger` | `data-selected` | '' (present only while the condition holds) |
| `expand-trigger` | `data-state` | 'open' \| 'closed' \| undefined |
| `expand-trigger` | `data-xh-action-control` | '' |
| `expand-trigger` | `data-xh-action-display` | 'always' |
| `expand-trigger` | `data-xh-action-profile` | 'icon' |
| `expand-trigger` | `data-xh-action-size` | props.size |
| `expand-trigger` | `data-xh-action-variant` | 'ghost' |
| `expanded-row` | `data-dragging` | '' (present only while the condition holds) |
| `expanded-row` | `data-state` | 'open' \| 'closed' |
| `loading` | `data-loading` | '' (present only while the condition holds) |
| `loading` | `data-xh-loading-ring` | '' |
| `load-more-trigger` | `data-loading` | '' (present only while the condition holds) |
| `load-more-trigger` | `data-pressed` | '' (present only while the condition holds) |
| `load-more-trigger` | `data-xh-action-control` | '' |
| `load-more-trigger` | `data-xh-action-display` | 'always' |
| `load-more-trigger` | `data-xh-action-profile` | 'row' |
| `load-more-trigger` | `data-xh-action-size` | props.size |
| `load-more-trigger` | `data-xh-action-variant` | 'ghost' |
| `header-row` | `data-section` | 'header' |
| `footer-row` | `data-section` | 'footer' |

### CSS variables

The public override slots, generated from what the standalone skin actually consumes.

| Variable | Part | CSS property | State | Default from |
| --- | --- | --- | --- | --- |
| `--xh-table-bg` | `root` | `background` | `default`<br>`variant=outline`<br>`variant=subtle` | `--xh-bg-subtle`<br>`--xh-bg-surface` |
| `--xh-table-border` | `root` | `border` | `variant=outline` | `--xh-border-default` |
| `--xh-table-caption-fg` | `caption` | `color` | `default` | `--xh-fg-muted` |
| `--xh-table-caption-font-size` | `caption` | `font-size` | `default` | `--xh-text-label-size` |
| `--xh-table-caption-font-weight` | `caption` | `font-weight` | `default` | `--xh-text-label-weight` |
| `--xh-table-caption-px` | `caption` | `padding-inline` | `default` | `--xh-space-3` |
| `--xh-table-caption-py` | `caption` | `padding-block` | `default` | `--xh-space-2` |
| `--xh-table-cell-gap` | `cell`<br>`column-header` | `gap` | `default` | `--xh-control-gap-md` |
| `--xh-table-cell-min-w` | `cell`<br>`column-header` | `min-inline-size` | `default` | `3rem` |
| `--xh-table-cell-px` | `cell`<br>`column-header`<br>`root` | `padding-inline`<br>`padding-inline-end` | `default`<br>`not(:last-child)`<br>`split` | `--xh-_table-cell-px` |
| `--xh-table-cell-py` | `cell`<br>`column-header` | `padding-block` | `default` | `--xh-_table-cell-py` |
| `--xh-table-column-fg` | `column-header` | `color` | `default` | `--xh-fg-default` |
| `--xh-table-column-font-weight` | `column-header` | `font-weight` | `default` | `--xh-font-weight-medium` |
| `--xh-table-column-list-fg` | `column-list` | `color` | `default` | `--xh-fg-default` |
| `--xh-table-column-list-font-size` | `column-list` | `font-size` | `default` | `--xh-text-secondary-size` |
| `--xh-table-column-list-gap` | `column-list` | `gap` | `default` | `--xh-_table-column-list-gap` |
| `--xh-table-detail-bg` | `expanded-row` | `background` | `default` | `--xh-bg-subtle` |
| `--xh-table-detail-px` | `cell`<br>`expanded-row` | `padding-inline` | `default` | `--xh-_table-cell-px` |
| `--xh-table-detail-py` | `cell`<br>`expanded-row` | `padding-block` | `default` | `--xh-space-3` |
| `--xh-table-drag-fg` | `column-drag-trigger` | `color` | `default` | `--xh-fg-subtle` |
| `--xh-table-drag-fg-active` | `column-drag-trigger` | `color` | `disabled`<br>`dragging`<br>`hover`<br>`not([data-disabled])` | `--xh-fg-default` |
| `--xh-table-drag-fg-disabled` | `column-drag-trigger` | `color` | `disabled` | `--xh-fg-disabled` |
| `--xh-table-drag-grip-h` | `column-drag-trigger` | `block-size` | `empty` | `--xh-space-2` |
| `--xh-table-drag-grip-w` | `column-drag-trigger` | `inline-size` | `empty` | `--xh-space-1` |
| `--xh-table-drag-size` | `column-drag-trigger` | `block-size`<br>`inline-size` | `default` | `--xh-control-indicator-size` |
| `--xh-table-dragging-opacity` | `cell`<br>`column-header`<br>`expanded-row`<br>`row` | `opacity` | `dragging` | `--xh-state-dragging-opacity` |
| `--xh-table-drop-fg` | `cell`<br>`column-header`<br>`row` | `background`<br>`box-shadow` | `drop`<br>`drop=after`<br>`drop=before`<br>`drop=inside`<br>`frozen`<br>`is([data-drop='before'], [data-drop='after'])`<br>`not([data-frozen])` | `--xh-bg-brand` |
| `--xh-table-drop-inside-bg` | `body`<br>`root`<br>`row` | `background` | `disabled`<br>`drop=inside`<br>`not([data-disabled])` | `--xh-bg-subtle-hover-opaque` |
| `--xh-table-drop-line` | `cell`<br>`column-header`<br>`row` | `block-size`<br>`box-shadow`<br>`inline-size` | `drop`<br>`drop=after`<br>`drop=before`<br>`drop=inside`<br>`frozen`<br>`is([data-drop='before'], [data-drop='after'])`<br>`not([data-frozen])` | `--xh-stroke-thick` |
| `--xh-table-expand-fg` | `expand-trigger` | `color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-subtle` |
| `--xh-table-fg` | `root` | `color` | `default` | `--xh-fg-default` |
| `--xh-table-filter-fg` | `column-header`<br>`trigger` | `color` | `default` | `--xh-fg-subtle` |
| `--xh-table-filter-fg-active` | `column-header`<br>`trigger` | `color` | `filtered` | `--xh-fg-brand` |
| `--xh-table-filter-size` | `column-header`<br>`trigger` | `--xh-icon-size` | `default` | `--xh-_table-trigger-size` |
| `--xh-table-font-size` | `root`<br>`row` | `font-size` | `default` | `--xh-_table-font-size` |
| `--xh-table-footer-bg` | `cell`<br>`footer`<br>`row` | `background` | `default`<br>`fixed`<br>`frozen` | `--xh-bg-subtle`<br>`--xh-bg-subtle-opaque` |
| `--xh-table-footer-border` | `footer` | `border-block-start` | `default` | `--xh-border-subtle` |
| `--xh-table-footer-font-weight` | `footer` | `font-weight` | `default` | `--xh-font-weight-medium` |
| `--xh-table-frozen-edge` | `cell`<br>`column-header` | `background` | `frozen-edge`<br>`is([data-part='column-header'], [data-part='cell'])` | `--xh-border-default` |
| `--xh-table-header-bg` | `column-header`<br>`header` | `background` | `default`<br>`frozen` | `--xh-_table-header-bg` |
| `--xh-table-header-border` | `header` | `border-block-end` | `default` | `--xh-border-subtle` |
| `--xh-table-icon-size` | `root` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=sm` | `--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` |
| `--xh-table-load-more-trigger-bg-hover` | `load-more-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` |
| `--xh-table-load-more-trigger-fg` | `load-more-trigger` | `color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-brand-strong` |
| `--xh-table-load-more-trigger-font-size` | `load-more-trigger` | `font-size` | `default` | `--xh-_table-font-size` |
| `--xh-table-load-more-trigger-gap` | `load-more-trigger` | `gap` | `default` | `--xh-space-2` |
| `--xh-table-load-more-trigger-px` | `load-more-trigger` | `padding-inline` | `default` | `--xh-space-4` |
| `--xh-table-load-more-trigger-py` | `load-more-trigger` | `padding-block` | `xh-action-profile=row` | `--xh-space-3` |
| `--xh-table-load-more-trigger-radius` | `load-more-trigger` | `border-radius` | `default` | `--xh-shape-control` |
| `--xh-table-loading-duration` | `loading` | `animation-duration` | `default` | `--xh-motion-loop-spin` |
| `--xh-table-max-h` | `root` | `max-block-size` | `default` | `--xh-viewport-h-lg` |
| `--xh-table-pagination-gap` | `root` | `margin-block-start` | `default` | `--xh-space-3` |
| `--xh-table-radius` | `root` | `border-radius` | `variant=outline`<br>`variant=subtle` | `--xh-shape-surface` |
| `--xh-table-resize-fg` | `column-resize-trigger` | `background` | `default` | `--xh-border-default` |
| `--xh-table-resize-fg-active` | `column-resize-trigger` | `background` | `hover`<br>`resizing` | `--xh-bg-brand` |
| `--xh-table-resize-line` | `column-resize-trigger` | `inline-size` | `default` | `--xh-stroke-thin` |
| `--xh-table-resize-line-length` | `column-resize-trigger` | `block-size` | `default` | `60%` |
| `--xh-table-resize-radius` | `column-resize-trigger` | `border-radius` | `default` | `--xh-shape-pill` |
| `--xh-table-resize-width` | `column-resize-trigger` | `inline-size` | `default` | `--xh-space-2` |
| `--xh-table-row-bg` | `row` | `background-color` | `default` | `--xh-bg-surface` |
| `--xh-table-row-bg-hover` | `row` | `background-color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:focus-visible, [data-highlighted])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])` | `--xh-bg-subtle-opaque` |
| `--xh-table-row-bg-pressed` | `row` | `background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed` | `--xh-bg-subtle-hover-opaque` |
| `--xh-table-row-bg-selected` | `row` | `background-color` | `disabled`<br>`error`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`selected`<br>`xh-collection-context=page` | `--xh-bg-brand-subtle` |
| `--xh-table-row-bg-striped` | `body`<br>`root`<br>`row` | `background-color` | `striped`<br>`where(:nth-of-type(even)`<br>`where([data-scope='table'][data-part='root'][data-striped] [data-scope='table'][data-part='body'])` | `--xh-bg-subtle-opaque` |
| `--xh-table-row-border` | `body`<br>`cell`<br>`column-header`<br>`expanded-row`<br>`footer`<br>`header`<br>`item`<br>`root`<br>`row` | `border-block-start`<br>`border-inline-end` | `index=0`<br>`is([data-part='header'], [data-part='body'], [data-part='footer'])`<br>`is([data-part='row'], [data-part='expanded-row'])`<br>`not(:last-child)`<br>`not([data-index='0'])`<br>`not([hidden])`<br>`split` | `--xh-border-subtle` |
| `--xh-table-row-cursor` | `row` | `cursor` | `default`<br>`disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=page` | `default` |
| `--xh-table-row-drag-fg` | `row-drag-trigger` | `color` | `default` | `--xh-fg-subtle` |
| `--xh-table-row-drag-fg-active` | `row-drag-trigger` | `color` | `disabled`<br>`dragging`<br>`hover`<br>`not([data-disabled])` | `--xh-fg-default` |
| `--xh-table-row-drag-fg-disabled` | `row-drag-trigger` | `color` | `disabled` | `--xh-fg-disabled` |
| `--xh-table-row-drag-grip-long` | `row-drag-trigger` | `inline-size` | `empty` | `--xh-space-2` |
| `--xh-table-row-drag-grip-short` | `row-drag-trigger` | `block-size` | `empty` | `--xh-space-1` |
| `--xh-table-row-drag-size` | `row-drag-trigger` | `block-size`<br>`inline-size` | `default` | `--xh-control-indicator-size` |
| `--xh-table-row-fg-selected` | `row` | `color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=page` | `--xh-fg-on-brand-subtle` |
| `--xh-table-sort-bg-hover` | `column-header`<br>`sort-trigger`<br>`trigger` | `background`<br>`background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover`<br>`--xh-bg-subtle-hover` |
| `--xh-table-sort-bg-pressed` | `sort-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` |
| `--xh-table-sort-fg` | `sort-trigger` | `color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-subtle` |
| `--xh-table-sort-fg-active` | `sort-trigger` | `color` | `disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`sort`<br>`sort-index` | `--xh-fg-default` |
| `--xh-table-sort-size` | `sort-trigger` | `--xh-icon-size` | `default` | `--xh-_table-trigger-size` |
| `--xh-table-span-layer` | `cell`<br>`column-header` | `z-index` | `is([data-part='cell'], [data-part='column-header'])`<br>`row-span` | `1` |
| `--xh-table-state-fg` | `empty`<br>`loading` | `color` | `default` | `--xh-fg-muted` |
| `--xh-table-state-gap` | `empty`<br>`loading` | `gap` | `default` | `--xh-control-gap-md` |
| `--xh-table-state-min-h` | `empty`<br>`loading` | `min-block-size` | `default` | `0` |
| `--xh-table-state-px` | `empty`<br>`loading` | `padding-inline` | `default` | `--xh-control-px-sm` |
| `--xh-table-state-py` | `empty`<br>`loading` | `padding-block` | `default` | `--xh-space-3` |
| `--xh-table-sticky-column-layer` | `cell`<br>`column-header`<br>`row` | `z-index` | `drop=after`<br>`drop=before`<br>`drop=inside`<br>`frozen`<br>`is([data-drop='before'], [data-drop='after'])` | `1` |
| `--xh-table-sticky-footer-layer` | `footer` | `z-index` | `fixed` | `--xh-layer-sticky` |
| `--xh-table-sticky-header-layer` | `header` | `z-index` | `fixed` | `--xh-layer-sticky` |
| `--xh-table-sticky-inset` | `cell`<br>`column-header` | `inset-inline-end`<br>`inset-inline-start` | `frozen=end`<br>`frozen=start` | `0` |
| `--xh-table-toolbar-fg` | `toolbar` | `color` | `default` | `--xh-fg-default` |
| `--xh-table-toolbar-gap` | `toolbar` | `gap` | `default` | `--xh-_table-toolbar-gap` |
| `--xh-table-toolbar-py` | `toolbar` | `padding-block` | `default` | `--xh-space-2` |
| `--xh-table-trigger-bg-checked` | `column-visibility-trigger`<br>`expand-trigger`<br>`row-select-trigger`<br>`select-all-trigger`<br>`sort-trigger` | `--xh-ink-surface`<br>`background-color`<br>`border`<br>`border-color` | `disabled`<br>`focus-visible`<br>`hover`<br>`indeterminate`<br>`is(:active, [data-pressed])`<br>`is([data-selected], [data-indeterminate])`<br>`is([data-state='checked'], [data-state='indeterminate'])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`selected`<br>`state=checked`<br>`state=indeterminate`<br>`xh-ink-surface` | `--xh-bg-brand` |
| `--xh-table-trigger-bg-checked-pressed` | `column-visibility-trigger`<br>`expand-trigger`<br>`row-select-trigger`<br>`select-all-trigger`<br>`sort-trigger` | `background-color` | `disabled`<br>`indeterminate`<br>`is(:active, [data-pressed])`<br>`is([data-selected], [data-indeterminate])`<br>`is([data-state='checked'], [data-state='indeterminate'])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`selected`<br>`state=checked`<br>`state=indeterminate` | `--xh-bg-brand-active` |
| `--xh-table-trigger-bg-pressed` | `column-visibility-trigger`<br>`expand-trigger`<br>`row-select-trigger`<br>`select-all-trigger`<br>`sort-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-bg-subtle-hover` |
| `--xh-table-trigger-border` | `column-visibility-trigger`<br>`expand-trigger`<br>`row-select-trigger`<br>`select-all-trigger`<br>`sort-trigger` | `border`<br>`border-color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-border-strong` |
| `--xh-table-trigger-border-checked` | `column-visibility-trigger`<br>`expand-trigger`<br>`row-select-trigger`<br>`select-all-trigger`<br>`sort-trigger` | `border`<br>`border-color` | `disabled`<br>`focus-visible`<br>`hover`<br>`indeterminate`<br>`is(:active, [data-pressed])`<br>`is([data-selected], [data-indeterminate])`<br>`is([data-state='checked'], [data-state='indeterminate'])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`selected`<br>`state=checked`<br>`state=indeterminate` | `--xh-table-trigger-bg-checked` |
| `--xh-table-trigger-fg` | `column-visibility-trigger`<br>`row-select-trigger`<br>`select-all-trigger` | `color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-on-brand` |
| `--xh-table-trigger-radius` | `column-drag-trigger`<br>`column-header`<br>`column-visibility-trigger`<br>`expand-trigger`<br>`row-drag-trigger`<br>`row-select-trigger`<br>`select-all-trigger`<br>`sort-trigger`<br>`trigger` | `border-radius` | `default` | `--xh-shape-control`<br>`--xh-shape-inset` |
| `--xh-table-trigger-size` | `column-header`<br>`column-visibility-trigger`<br>`expand-trigger`<br>`row-select-trigger`<br>`select-all-trigger`<br>`sort-trigger`<br>`trigger` | `--xh-icon-size`<br>`block-size`<br>`inline-size`<br>`min-block-size`<br>`min-inline-size` | `default`<br>`xh-action-profile=icon`<br>`xh-action-profile=row` | `--xh-control-indicator-size` |
