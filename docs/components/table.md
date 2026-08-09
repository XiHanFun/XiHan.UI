# 表格 <Badge type="info" text="table" />

数据展示组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

columns 是列号与列宽的唯一事实源，rows 是行序与行号的唯一事实源，标记只管长相

<XhDemo src="table/01-basic" />

### 排序

列上标了 sortable 才认排序把手；按住 Shift 点是追加到排序链，裸点是整条链换成这一列

<XhDemo src="table/02-sort" />

### 多选

selectionMode 默认 none，声明 multiple 才有选择机制；选择列也要在 columns 里占一条，否则右侧列号串位

<XhDemo src="table/03-selection" />

### 行展开

行上标了 expandable 才认展开把手与左右方向键；详情行占一个真实行号，收起只加 hidden 不卸载内部节点

<XhDemo src="table/04-expand" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-table>` |
| Vue 组件 | `XhTableBody` `XhTableCaption` `XhTableCell` `XhTableColumnHeader` `XhTableEmptyState` `XhTableExpandTrigger` `XhTableExpandedRow` `XhTableFooter` `XhTableHeader` `XhTableLoadingState` `XhTableRoot` `XhTableRow` `XhTableRowSelectTrigger` `XhTableSelectAllTrigger` `XhTableSortTrigger` |
| 组合式函数 | `useTable` |
| 状态机 | `tableMachine` |
| 皮肤 | `@xihan-ui/styled/table.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="table"`：**`root`** · `header` · **`body`** · `footer` · `row` · `column-header` · `cell` · `caption` · `select-all-trigger` · `row-select-trigger` · `sort-trigger` · `expand-trigger` · `expanded-row` · `empty-state` · `loading-state`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `columns` | `TableColumnDef[]` |  | 列定义，列号与列总数的唯一事实源。缺省为空表。 |
| `rows` | `TableRowDef[]` |  | 行定义，行序与行号的唯一事实源。缺省为空表。 |
| `sort` | `TableSortDescriptor[]` |  | 排序链。给定即受控：cell 直读 prop，写只发 onSortChange 不落内部值。 |
| `defaultSort` | `TableSortDescriptor[]` |  |  |
| `selection` | `TableSelection` |  | 选中集合。给定即受控，语义同上。 |
| `defaultSelection` | `TableSelection` |  |  |
| `expanded` | `string[]` |  | 展开集合。给定即受控，语义同上。 |
| `defaultExpanded` | `string[]` |  |  |
| `selectionMode` | `TableSelectionMode` |  | 默认 none：不声明则没有选择机制，行也不报 aria-selected。 |
| `loading` | `boolean` |  | 数据在路上：root 报 aria-busy，表体为空时加载态节点显形。 |
| `empty` | `boolean` |  | 显式声明表体为空；缺省按 rows 是否为空推导。 |
| `stickyHeader` | `boolean` |  | 表头吸顶：只落 data-sticky，钉住的实现归皮肤。 |
| `footer` | `boolean` |  | 表格带脚注行。行号空间的最后一行留给它，aria-rowcount 也把它算进去。 |
| `loop` | `boolean` |  | 上下键走到首尾是否回绕，默认 false。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr；只对调左右方向键的「展开/收起」语义。 |
| `size` | `string` |  | 密度：sm / md / lg。只换单元格的纵向内边距与字号，列宽算法不受影响。 |
| `onSortChange` | `(details: TableSortChangeDetails) => void` |  |  |
| `onSelectionChange` | `(details: TableSelectionChangeDetails) => void` |  |  |
| `onExpandedChange` | `(details: TableExpandedChangeDetails) => void` |  |  |

## 状态机

**状态**：`idle`

**事件**：`SORT.SET` · `SORT.TOGGLE` · `SELECTION.SET` · `ROW.SELECT` · `SELECTION.ALL_TOGGLE` · `EXPANDED.SET` · `ROW.EXPAND` · `ROW.COLLAPSE` · `ROW.EXPAND_TOGGLE` · `ROW.FOCUS` · `TABLE.BLUR`

## connect API

`useTable` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `columns` | `readonly TableColumnDef[]` | 作者给的列定义。 |
| `rows` | `readonly TableRowDef[]` | 作者给的行定义。 |
| `visibleRows` | `readonly TableVisibleRow[]` | 展开摊平后的可见行序列（详情行插在它所属数据行之后）。 |
| `sort` | `TableSortDescriptor[]` |  |
| `selection` | `TableSelection` |  |
| `selectionState` | `TableSelectionState` | 全选把手的三态，只按**可选行**（未禁用）算。 |
| `selectionMode` | `TableSelectionMode` |  |
| `expandedValue` | `string[]` |  |
| `focusedRow` | `string | null` | 焦点锚点；焦点不在表体里时为 null。 |
| `loading` | `boolean` |  |
| `empty` | `boolean` | 表体为空（显式声明或 rows 为空）。 |
| `rowCount` | `number` | aria-rowcount：表头行 + 可见行 + 脚注行。 |
| `columnCount` | `number` | aria-colcount：列定义的条数。 |
| `isSelected` | `(value: string) => boolean` |  |
| `isExpanded` | `(value: string) => boolean` |  |
| `sortDirection` | `(value: string) => TableSortDirection | null` | 该列当前的排序方向；不参与排序时为 null。 |
| `sortPriority` | `(value: string) => number` | 该列在排序链里的优先级，1 起算；不参与排序时为 0。 |
| `setSort` | `(next: TableSortDescriptor[]) => void` |  |
| `toggleSort` | `(value: string, options?: { append?: boolean }) => void` |  |
| `setSelection` | `(next: TableSelection) => void` |  |
| `selectRow` | `(value: string) => void` |  |
| `toggleSelectAll` | `() => void` |  |
| `setExpandedValue` | `(next: string[]) => void` |  |
| `expandRow` | `(value: string) => void` |  |
| `collapseRow` | `(value: string) => void` |  |
| `toggleExpandRow` | `(value: string) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getCaptionProps` | `() => T['element']` |  |
| `getHeaderProps` | `() => T['element']` |  |
| `getBodyProps` | `() => T['element']` |  |
| `getFooterProps` | `() => T['element']` |  |
| `getHeaderRowProps` | `() => T['element']` | 表头那一行：恒占行号空间的第 1 行。 |
| `getFooterRowProps` | `() => T['element']` | 脚注那一行：占行号空间的最后一行。 |
| `getRowProps` | `(props: TableRowProps) => T['element']` |  |
| `getColumnHeaderProps` | `(props: TableColumnProps) => T['element']` |  |
| `getCellProps` | `(props: TableCellProps) => T['element']` |  |
| `getSelectAllTriggerProps` | `() => T['element']` |  |
| `getRowSelectTriggerProps` | `(props: TableRowProps) => T['element']` |  |
| `getSortTriggerProps` | `(props: TableColumnProps) => T['element']` |  |
| `getExpandTriggerProps` | `(props: TableRowProps) => T['element']` |  |
| `getExpandedRowProps` | `(props: TableRowProps) => T['element']` |  |
| `getEmptyStateProps` | `() => T['element']` |  |
| `getLoadingStateProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/grid/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | focus outside the table body | 表体只占一个 Tab 位：焦点进入锚点行，无锚点时先落 body 再由它转投；再按一次 Tab 整体离开表体 |
| `ArrowDown` | focus in table body | 焦点移到下一个可见数据行（禁用行跳过；详情行不是落点；loop 默认关，末行不回绕） |
| `ArrowUp` | focus in table body | 焦点移到上一个可见数据行（禁用行跳过；loop 默认关，首行不回绕） |
| `Home` | focus in table body | 焦点移到首个可见数据行 |
| `End` | focus in table body | 焦点移到末个可见数据行 |
| `Space` | focus on row, selectionMode 非 none 且该行未禁用 | 切换焦点行的选中（单选替换、复选增删）；选不动时不吞这个键，页面照常滚动 |
| `ArrowRight` | focus on 可展开且收起的行（dir=rtl 时改由 ArrowLeft 承担） | 就地展开当前行，焦点不动；不可展开、已展开或禁用的行上什么都不做且不吞键 |
| `ArrowLeft` | focus on 可展开且已展开的行（dir=rtl 时改由 ArrowRight 承担） | 就地收起当前行，焦点不动；其余情形什么都不做且不吞键 |
| `Enter` / `Space` | focus on sort-trigger, 该列 sortable | 排序方向按 升序 → 降序 → 不排序 循环；按住 Shift 是追加到排序链而不是替换整条链 |
| `Enter` / `Space` | focus on select-all-trigger, selectionMode=multiple | 当前可选行全选中就整段清空，否则整段选上；三态由 aria-checked 报出（半选为 mixed） |
