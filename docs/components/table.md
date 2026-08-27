# 表格 <Badge type="info" text="table" />

多行同构记录按列排开，支持排序、选择、展开与吸顶。

## 何时使用

- 每条记录有多个字段需要按列对照。
- 需要排序、筛选、批量选择。

## 何时不用

- 每条只有标题和一句描述：用[列表](./list)，表格的列头是额外负担。
- 移动端窄屏：横滚的表格很难用，考虑换成卡片列表。

## 特性

- 排序、选择、展开三套状态各自可受控。
- 表头吸顶与列吸附、条纹、密度、边框都是开关。
- 支持多行表头与表头分组、跨列单元格、树形表格、单元格就地编辑、列过滤、拖拽调列宽。
- 行数很大时只渲窗口内的行。

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

### 密度

size 只落成 root 的 data-size，换的是单元格纵向内边距与字号；三档并排，差别在行高上

<XhDemo src="table/05-size" />

### 空态与加载态

两个状态节点常挂着只靠 hidden 显隐：表体为空且在取数时露加载态，取数完了没有行才露空态

<XhDemo src="table/06-empty-loading" />

### 脚注合计

footer 把行号空间的最后一行留给脚注；脚注单元格不属于任何数据行，也就没有选中与禁用可言

<XhDemo src="table/07-footer" />

### 表头吸顶与列吸附

root 自己就是那个滚动容器：stickyHeader 钉住表头，列上标 sticky 的钉住那一列

<XhDemo src="table/08-sticky" />

### 单选

selectionMode 给 single：选中集合最多一个元素，点已选中的那行再点一次就清空，焦点行按空格同理

<XhDemo src="table/09-single-selection" />

### 跨列单元格

colspan 从它自己那一列往后算，报成 aria-colspan；1 与省略同义，所以只在真跨了列时写

<XhDemo src="table/10-colspan" />

### 单元格就地编辑

表体的方向键与 Home/End 是挂在 body 上的冒泡监听，可编辑控件上掐断冒泡这些键就回归输入框自己

<XhDemo src="table/11-editable-cell" />

### 多行表头与表头分组

表头写几行就是几行；分组格的跨列数与两行表头的行号由标记自报，columns 仍只登记叶子列

<XhDemo src="table/12-group-header" />

### 列过滤

过滤把手是列标题里的一段内容，过滤结果就是宿主算好后传进来的那份 rows；表头是表体的兄弟，把手上的按键不会被表体收走

<XhDemo src="table/13-column-filter" />

### 树形表格

rows 按契约就是一条已摊平的可见行序列：层级三件套逐行自报，缩进落在首格的内边距上

<XhDemo src="table/14-tree-rows" />

### 拖拽调列宽

列上标了 resizable 才认改宽把手；拖出表头仍跟手，方向键一次 8px、按住 Shift 一次 40px

<XhDemo src="table/15-column-resize" />

### 只渲窗口内的行

全量 rows 照常交给 root（那只是行序与行号的元信息，不产生 DOM），标记里只渲可见那一段，首尾用两块空白撑出真实滚动高度

<XhDemo src="table/16-virtual-rows" />

### 放进滚动区

表格交给滚动区的视口滚，两条自绘滚动条与吸顶表头、吸附列一起工作；表格自己不再定高

<XhDemo src="table/17-scroll-area" />

### 前缀列与分页序号

prefix-columns 让库把序号/多选列插在最前面并占住列号；序号是分页全局序号，翻到第二页不会又从 1 开始

<XhDemo src="table/18-prefix-columns" />

### 范围选

按住 Shift 点勾选框选中一段；焦点落在表体里按 Ctrl/Cmd + A 全选。禁用行占着顺序位置但不被选进去

<XhDemo src="table/19-range-selection" />

### 拖拽换列位

列上标了 reorderable 才认拖拽把手；也可以 Tab 到它用方向键挪，Home / End 到两头

<XhDemo src="table/20-column-drag" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-table>` |
| Vue 组件 | `XhTableBody` `XhTableCaption` `XhTableCell` `XhTableColumnDragTrigger` `XhTableColumnHeader` `XhTableColumnResizeTrigger` `XhTableEmpty` `XhTableExpandTrigger` `XhTableExpandedRow` `XhTableFooter` `XhTableHeader` `XhTableLoadingState` `XhTableRoot` `XhTableRow` `XhTableRowSelectTrigger` `XhTableSelectAllTrigger` `XhTableSortTrigger` |
| 组合式函数 | `useTable` |
| 状态机 | `tableMachine` |
| 皮肤 | `@xihan-ui/styles/table.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="table"`：**`root`** · `header` · **`body`** · `footer` · `row` · `column-header` · `cell` · `caption` · `select-all-trigger` · `row-select-trigger` · `sort-trigger` · `column-resize-trigger` · `column-drag-trigger` · `expand-trigger` · `expanded-row` · `empty` · `loading-state` · `live-region`

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
| `prefixColumns` | `TableColumnKind[]` |  | 要哪几列前缀列，按给定顺序插在最前面，默认一列都不插。 它们由库插入并**占住列号**——不占的话右侧所有列的 aria-colindex 会整体串位， 而这正是使用者手工往 columns 里塞假列的原因。作者照 `api.columns` 渲染即可， 每一项都自报 `kind`。 |
| `columnPreference` | `TableColumnPreference` |  | 列偏好。给定即受控：内部不自改，写只发 onColumnPreferenceChange。 持久化归使用者——库只负责把它算进生效列。 |
| `defaultColumnPreference` | `TableColumnPreference` |  |  |
| `page` | `number` |  | 当前页码与每页条数，只用来算序号，不参与切片——切片归调用方 （或分页组件的 `api.slice`）。都不给时序号退回可见序。 |
| `pageSize` | `number` |  |  |
| `loading` | `boolean` |  | 数据在路上：root 报 aria-busy，表体为空时加载态节点显形。 |
| `empty` | `boolean` |  | 显式声明表体为空；缺省按 rows 是否为空推导。 |
| `stickyHeader` | `boolean` |  | 表头吸顶：只落 data-sticky（布尔），钉住的实现归皮肤。列冻结走 data-frozen，两者不同名。 |
| `striped` | `boolean` |  | 斑马纹：表体偶数行换一层浅底。 |
| `borderless` | `boolean` |  | 去掉外框，只留行间横线。 |
| `ruled` | `boolean` |  | 列与列之间加竖分隔线。 |
| `footer` | `boolean` |  | 表格带脚注行。行号空间的最后一行留给它，aria-rowcount 也把它算进去。 |
| `loop` | `boolean` |  | 上下键走到首尾是否回绕，默认 false。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr；只对调左右方向键的「展开/收起」语义。 |
| `size` | `Size` |  | 密度：sm / md / lg。只换单元格的纵向内边距与字号，列宽算法不受影响。 |
| `translations` | `Partial<TableTranslations>` |  |  |
| `onColumnPreferenceChange` | `(details: TableColumnPreferenceChangeDetails) => void` |  |  |
| `onSortChange` | `(details: TableSortChangeDetails) => void` |  |  |
| `onSelectionChange` | `(details: TableSelectionChangeDetails) => void` |  |  |
| `onExpandedChange` | `(details: TableExpandedChangeDetails) => void` |  |  |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `sort-change` | `TableSortChangeDetails` | 排序链变化；detail 为 `{ value: { id, direction }[] }` |
| `column-preference-change` | `` | 列偏好变化；detail 为 `{ value: TableColumnPreference }` |
| `selection-change` | `TableSelectionChangeDetails` | 选中集合变化；detail 为 `{ value: string[] \| 'all' }` |
| `expanded-change` | `TableExpandedChangeDetails` | 展开集合变化；detail 为 `{ value: string[] }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhTableRoot` | `default` | `TableRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `select-all-trigger` | tableSelectionState(selection, selectableIds) |
| `expanded-row` | 'open' \| 'closed' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle` · `resizing` · `columnDragging`

**事件**：`SORT.SET` · `SORT.TOGGLE` · `COLUMN_PREF.SET` · `COLUMN_RESIZE.START` · `COLUMN_RESIZE.MOVE` · `COLUMN_RESIZE.END` · `COLUMN_RESIZE.CANCEL` · `COLUMN_RESIZE.STEP` · `COLUMN_DRAG.START` · `COLUMN_DRAG.MOVE` · `COLUMN_DRAG.END` · `COLUMN_DRAG.CANCEL` · `COLUMN.MOVE_BY` · `COLUMN_PREF.PATCH` · `SELECTION.SET` · `ROW.SELECT` · `SELECTION.ALL_TOGGLE` · `EXPANDED.SET` · `ROW.EXPAND` · `ROW.COLLAPSE` · `ROW.EXPAND_TOGGLE` · `ROW.FOCUS` · `TABLE.BLUR`

## connect API

`useTable` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `columns` | `readonly TableColumn[]` | 生效的列：前缀列在前、数据列在后，各自自报 kind。 列号、渲染顺序都以它为准；不要前缀列时它与作者给的那份一模一样。 |
| `draggableColumns` | `readonly string[]` | 可以拖着换位的那一段列 id。声明了 `reorderable`、不是冻结列、且彼此相连。 冻结列与不可拖的列是屏障，把可拖范围切成段；这里给的是最长的那一段。 拿它决定渲不渲把手，与库内部判「能不能落」的口径是同一份。 |
| `dropTarget` | `TableDropTarget \| null` | 此刻的落点；松手就落在这儿。没有合法落点时是 null，指示线跟着消失。 |
| `announcement` | `string` | 读屏播报文本。渲进 live-region，不进视觉版面。 |
| `rows` | `readonly TableRowDef[]` | 作者给的行定义。 |
| `visibleRows` | `readonly TableVisibleRow[]` | 展开摊平后的可见行序列（详情行插在它所属数据行之后）。 |
| `sort` | `TableSortDescriptor[]` |  |
| `selection` | `TableSelection` |  |
| `selectionState` | `TableSelectionState` | 全选把手的三态，只按**可选行**（未禁用）算。 |
| `selectionMode` | `TableSelectionMode` |  |
| `expandedValue` | `string[]` |  |
| `focusedRow` | `string \| null` | 焦点锚点；焦点不在表体里时为 null。 |
| `loading` | `boolean` |  |
| `empty` | `boolean` | 表体为空（显式声明或 rows 为空）。 |
| `rowCount` | `number` | aria-rowcount：表头行 + 可见行 + 脚注行。 |
| `columnCount` | `number` | aria-colcount：列定义的条数。 |
| `isSelected` | `(value: string) => boolean` |  |
| `isExpanded` | `(value: string) => boolean` |  |
| `sortDirection` | `(value: string) => TableSortDirection \| null` | 该列当前的排序方向；不参与排序时为 null。 |
| `sortPriority` | `(value: string) => number` | 该列在排序链里的优先级，1 起算；不参与排序时为 0。 |
| `setSort` | `(next: TableSortDescriptor[]) => void` |  |
| `toggleSort` | `(value: string, options?: { append?: boolean }) => void` |  |
| `setSelection` | `(next: TableSelection) => void` |  |
| `selectRow` | `(value: string, options?: { extend?: boolean }) => void` | 选中某一行。extend 为真时选中锚点到这一行那一段（仅复选）。 |
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
| `rowNumber` | `(rowId: string) => string` | 这一行显示什么序号。平表是分页全局序号，树形是大纲编号。 不出序号列时仍可调用——它是纯计算，不看要不要那一列。 |
| `columnPreference` | `TableColumnPreference` | 当下的列偏好。原样交出去即可存盘。 |
| `setColumnHidden` | `(columnId: string, hidden: boolean) => void` | 藏起 / 放出一列。 |
| `moveColumn` | `(columnId: string, toIndex: number) => void` | 把一列挪到第几位（只在作者定义的那些列之间算，0 起算）。 |
| `setColumnWidth` | `(columnId: string, width: number \| string) => void` | 改一列的宽。 |
| `setColumnPreference` | `(next?: TableColumnPreference) => void` | 整份偏好换掉；不给即清空，回到作者定义的原样。 |
| `getRowProps` | `(props: TableRowProps) => T['element']` |  |
| `getColumnHeaderProps` | `(props: TableColumnProps) => T['element']` |  |
| `getCellProps` | `(props: TableCellProps) => T['element']` |  |
| `getSelectAllTriggerProps` | `() => T['element']` |  |
| `getRowSelectTriggerProps` | `(props: TableRowProps) => T['element']` |  |
| `getSortTriggerProps` | `(props: TableColumnProps) => T['element']` |  |
| `getColumnResizeTriggerProps` | `(props: TableColumnProps) => T['element']` | 列宽把手。只有 resizable 的列才渲它。 |
| `getColumnDragTriggerProps` | `(props: TableColumnProps) => T['element']` | 列拖拽把手。只有 reorderable 的列才渲它。 |
| `getExpandTriggerProps` | `(props: TableRowProps) => T['element']` |  |
| `getExpandedRowProps` | `(props: TableRowProps) => T['element']` |  |
| `getEmptyProps` | `() => T['element']` |  |
| `getLoadingStateProps` | `() => T['element']` |  |
| `getLiveRegionProps` | `() => T['element']` | 拖动过程的读屏播报区。视觉隐藏，文本从 `announcement` 取。 它必须在拖动开始之前就在 DOM 上——读屏不播报后插入的节点。 |

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
| `Ctrl+A` / `Cmd+A` | focus in table body, selectionMode=multiple | 与全选把手同义：当前可选行全选中就整段清空，否则整段选上（禁用行不算进基数）。单选与不可选的表格不吞这个键，交还浏览器的整页全选；按住不放的连发只算一次 |
| `ArrowLeft` / `ArrowRight` | focus in column-resize-trigger，该列 resizable | 把这一列按 8px 收窄 / 加宽；往行尾侧推是加宽，rtl 下左右两键对调，语义恒是「加宽 / 收窄」 |
| `Shift+ArrowLeft` / `Shift+ArrowRight` | focus in column-resize-trigger，该列 resizable | 按 40px 收窄 / 加宽，方向规则同上 |
| `ArrowLeft` / `ArrowRight` | focus in column-drag-trigger，该列在可拖的那一段里 | 把这一列往前 / 往后挪一位，按一下就是一次完整提交；往行首侧挪是往前，rtl 下左右两键对调，语义恒是「往前 / 往后」；已在段首 / 段末就不动，也不回绕 |
| `Home` / `End` | focus in column-drag-trigger，该列在可拖的那一段里 | 把这一列挪到可拖那一段的段首 / 段末；rtl 下两键对调，语义恒是「段首 / 段末」；已经在那儿就不动 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-busy` | 'true' \| undefined |
| `root` | `aria-colcount` | columns.length \|\| undefined |
| `root` | `aria-labelledby` | `caption` 部件的 id |
| `root` | `aria-multiselectable` | 'true' \| 'false' |
| `root` | `aria-rowcount` | HEADER_ROW_COUNT + visibleRows.length + (hasFooter ? … |
| `root` | `role` | 'treegrid' \| 'grid' |
| `header` | `role` | 'rowgroup' |
| `body` | `role` | 'rowgroup' |
| `footer` | `role` | 'rowgroup' |
| `row` | `aria-controls` | `detail` 部件的 id \| undefined |
| `row` | `aria-disabled` | 'true' \| 'false' |
| `row` | `aria-expanded` | 'true' \| 'false' \| undefined |
| `row` | `aria-level` | metaIndex.get(row.value)?.level \| undefined |
| `row` | `aria-posinset` | metaIndex.get(row.value)?.posInSet \| undefined |
| `row` | `aria-rowindex` | dataRowIndex.get(row.value) |
| `row` | `aria-selected` | 'true' \| 'false' \| undefined |
| `row` | `aria-setsize` | metaIndex.get(row.value)?.setSize \| undefined |
| `row` | `role` | 'row' |
| `column-header` | `aria-colindex` | columnIndex.get(column.value) |
| `column-header` | `aria-sort` | 'ascending' \| 'descending' \| 'none' \| undefined |
| `column-header` | `role` | 'columnheader' |
| `cell` | `aria-colindex` | columnIndex.get(cell.value) |
| `cell` | `aria-colspan` | cell.colSpan \| undefined |
| `cell` | `role` | 'gridcell' |
| `select-all-trigger` | `aria-checked` | 'true' \| 'mixed' \| 'false' |
| `select-all-trigger` | `aria-disabled` | 'false' \| 'true' |
| `select-all-trigger` | `role` | 'checkbox' |
| `row-select-trigger` | `aria-hidden` | 'true' |
| `sort-trigger` | `aria-disabled` | 'false' \| 'true' |
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
| `column-drag-trigger` | `aria-roledescription` | 'draggable column' |
| `column-drag-trigger` | `role` | 'button' |
| `expand-trigger` | `aria-hidden` | 'true' |
| `expanded-row` | `aria-level` | (metaIndex.get(row.value)?.level ?? 1) + 1 \| undefined |
| `expanded-row` | `aria-posinset` | 1 \| undefined |
| `expanded-row` | `aria-rowindex` | detailRowIndex.get(row.value) |
| `expanded-row` | `aria-setsize` | 1 \| undefined |
| `expanded-row` | `role` | 'row' |
| `live-region` | `aria-atomic` | 'true' |
| `live-region` | `aria-live` | 'polite' |
| `live-region` | `role` | 'status' |
| `header-row` | `aria-rowindex` | 1 |
| `footer-row` | `aria-rowindex` | HEADER_ROW_COUNT + visibleRows.length + (hasFooter ? … \| undefined |
| `header-row` | `role` | 'row' |
| `footer-row` | `role` | 'row' |

## 样式

默认皮肤 `@xihan-ui/styles/table.css` 按部件选择：`[data-scope="table"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-borderless` | ''（条件成立时才出现） |
| `root` | `data-empty` | ''（条件成立时才出现） |
| `root` | `data-loading` | ''（条件成立时才出现） |
| `root` | `data-ruled` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-sticky` | ''（条件成立时才出现） |
| `root` | `data-striped` | ''（条件成立时才出现） |
| `header` | `data-sticky` | ''（条件成立时才出现） |
| `body` | `data-empty` | ''（条件成立时才出现） |
| `row` | `data-section` | 'body' |
| `column-header` | `data-dragging` | ''（条件成立时才出现） |
| `column-header` | `data-drop` | 'before' \| 'after' |
| `column-header` | `data-sortable` | ''（条件成立时才出现） |
| `cell` | `data-disabled` | ''（条件成立时才出现） \| undefined |
| `cell` | `data-dragging` | ''（条件成立时才出现） |
| `cell` | `data-drop` | 'before' \| 'after' |
| `cell` | `data-selected` | ''（条件成立时才出现） \| undefined |
| `select-all-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `select-all-trigger` | `data-state` | tableSelectionState(selection, selectableIds) |
| `sort-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `column-resize-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `column-resize-trigger` | `data-resizing` | ''（条件成立时才出现） |
| `column-drag-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `column-drag-trigger` | `data-dragging` | ''（条件成立时才出现） |
| `expanded-row` | `data-state` | 'open' \| 'closed' |
| `header-row` | `data-section` | 'header' |
| `footer-row` | `data-section` | 'footer' |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-table-bg` · `--xh-table-border` · `--xh-table-caption-fg` · `--xh-table-caption-font-size` · `--xh-table-caption-font-weight` · `--xh-table-caption-px` · `--xh-table-caption-py` · `--xh-table-cell-gap` · `--xh-table-cell-min-w` · `--xh-table-cell-px` · `--xh-table-cell-py` · `--xh-table-cell-py-lg` · `--xh-table-cell-py-md` · `--xh-table-cell-py-sm` · `--xh-table-column-fg` · `--xh-table-column-font-weight` · `--xh-table-detail-bg` · `--xh-table-detail-px` · `--xh-table-detail-py` · `--xh-table-drag-fg` · `--xh-table-drag-fg-active` · `--xh-table-drag-fg-disabled` · `--xh-table-drag-grip-h` · `--xh-table-drag-grip-w` · `--xh-table-drag-size` · `--xh-table-dragging-opacity` · `--xh-table-drop-fg` · `--xh-table-drop-line` · `--xh-table-expand-fg` · `--xh-table-fg` · `--xh-table-font-size` · `--xh-table-footer-bg` · `--xh-table-footer-font-weight` · `--xh-table-header-bg` · `--xh-table-icon-size` · `--xh-table-max-h` · `--xh-table-radius` · `--xh-table-resize-fg` · `--xh-table-resize-fg-active` · `--xh-table-resize-line` · `--xh-table-resize-line-length` · `--xh-table-resize-radius` · `--xh-table-resize-width` · `--xh-table-row-bg` · `--xh-table-row-bg-hover` · `--xh-table-row-bg-selected` · `--xh-table-row-bg-striped` · `--xh-table-row-border` · `--xh-table-sort-fg` · `--xh-table-sort-fg-active` · `--xh-table-sort-gap` · `--xh-table-state-fg` · `--xh-table-state-gap` · `--xh-table-state-min-h` · `--xh-table-state-px` · `--xh-table-state-py` · `--xh-table-sticky-column-layer` · `--xh-table-sticky-header-layer` · `--xh-table-sticky-inset` · `--xh-table-trigger-bg-checked` · `--xh-table-trigger-border` · `--xh-table-trigger-border-checked` · `--xh-table-trigger-fg` · `--xh-table-trigger-radius` · `--xh-table-trigger-size`

## 动效

关键帧 `xh-table-loading-pulse` 随皮肤自带，不引用别处文件里的名字；状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。

## 组合

- 单元格里放[就地编辑](./editable)、[徽标](./badge)、[头像](./avatar)；下面接[分页](./pagination)；空态用[空状态](./empty-state)。

## 最佳实践

- 列宽尽量固定，别让内容长度决定列宽——翻页时整张表会重排。
- 批量选择要显示已选条数，并在跨页时说明选中范围。

## 反模式

- 列多到必须横滚却不吸附首列：滚过去就不知道哪一行是哪一行。
- 用表格做页面布局。
