# Table <Badge type="info" text="表格" />

多行同构记录按列排开，支持排序、选择、展开与吸顶。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/table" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/table.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/table" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/table" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/table.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

columns 是列号与列宽的唯一事实源，rows 是行序与行号的唯一事实源，标记只管长相

<XhDemo src="table/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="table"`：**`root`** · `header` · **`body`** · `footer` · `row` · `column-header` · `cell` · `caption` · `toolbar` · `column-list` · `column-visibility-trigger` · `select-all-trigger` · `row-select-trigger` · `sort-trigger` · `column-resize-trigger` · `column-drag-trigger` · `row-drag-trigger` · `expand-trigger` · `expanded-row` · `empty` · `loading` · `load-more-trigger` · `live-region`

## 示例

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

### 拖拽换行位

整行都是拖动源，按住拖到别处松手；也可以 Tab 进表体后按 Alt + 上下键挪。库只报新行序，写回归使用者

<XhDemo src="table/21-row-drag" />

### 触屏拖动把手

整行起手只认鼠标与笔；触屏要按住行首那个把手才拖得动，代价是那一小块地方不再跟着表格滚。键盘那一路照旧：Tab 进表体后 Alt + 上下键

<XhDemo src="table/22-row-drag-handle" />

### 树形表拖拽

行声明了 parentId 就是树：拖到一行中段是放进这一行（换个父），拖到上下两端仍是插在它前后；键盘走 Alt + 上下键同层挪、Alt + 左右键改缩进。库报的是「搬到哪个父下面的第几位」外加重排好的整份行序，写回归宿主——按 ids 重排、再把那一行的 parentId 设成 parent，两件都做才对得上。许不许搬那一句归 allowRowDrop

<XhDemo src="table/23-tree-row-drag" />

### 列设置与工具条

工具条渲成表的兄弟排在表前（root 是 grid，工具条进不去它里面）；列设置区照 columnSettings 渲，藏起来的列也在其中，只剩最后一列显示着时那颗把手转禁用

<XhDemo src="table/24-column-settings" />

## 设计指引

### 何时使用

- 每条记录有多个字段需要按列对照。
- 需要排序、筛选、批量选择。

### 何时不用

- 每条只有标题和一句描述：用[列表](./list)，表格的列头是额外负担。
- 移动端窄屏：横滚的表格很难用，考虑换成卡片列表。

### 特性

- 排序、选择、展开三套状态各自可受控。
- 表头吸顶与列吸附、条纹、密度、边框都是开关。
- 支持多行表头与表头分组、跨列单元格、树形表格、单元格就地编辑、列过滤、拖拽调列宽。
- 行数很大时只渲窗口内的行。
- 工具条（`toolbar`）与列设置区（`column-list` + `column-visibility-trigger`）把排序、列宽与显隐三样接出来：设置区照 `columnSettings` 渲，藏起来的列也在其中。两块都摆在 `root` 之外——`root` 是 grid 系角色，子节点只能是行与行组。
- 三种非条目相位各有部件：空（`empty`）、在途（`loading`）、还有更多（`load-more-trigger`）。取下一页的按钮点了做什么归作者，取数在途时自动停用。

### 组合

- 单元格里放[就地编辑](./editable)、[徽标](./badge)、[头像](./avatar)；下面接[分页](./pagination)；空态用[空状态](./empty-state)。

### 最佳实践

- 列宽尽量固定，别让内容长度决定列宽——翻页时整张表会重排。
- 批量选择要显示已选条数，并在跨页时说明选中范围。

### 反模式

- 列多到必须横滚却不吸附首列：滚过去就不知道哪一行是哪一行。
- 用表格做页面布局。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-table>` |
| Vue 组件 | `XhTableBody` `XhTableCaption` `XhTableCell` `XhTableColumnDragTrigger` `XhTableColumnHeader` `XhTableColumnList` `XhTableColumnResizeTrigger` `XhTableColumnVisibilityTrigger` `XhTableEmpty` `XhTableExpandTrigger` `XhTableExpandedRow` `XhTableFooter` `XhTableHeader` `XhTableLoadMoreTrigger` `XhTableLoading` `XhTableRoot` `XhTableRow` `XhTableRowDragTrigger` `XhTableRowSelectTrigger` `XhTableSelectAllTrigger` `XhTableSortTrigger` `XhTableToolbar` |
| 组合式函数 | `useTable` |
| 状态机 | `tableMachine` |
| 皮肤 | `@xihan-ui/styles/table.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `columns` | `TableColumnDef[]` |  | 列定义，列号与列总数的唯一事实源。缺省为空表。 |
| `rows` | `TableRowDef[]` |  | 行定义，行序与行号的唯一事实源。缺省为空表。 |
| `sort` | `TableSortDescriptor[]` |  | 排序链。给定即受控：cell 直读 prop，写只发 onSortChange 不落内部值。 |
| `defaultSort` | `TableSortDescriptor[]` |  |  |
| `selection` | `TableSelection` |  | 选中集合。给定即受控，语义同上。 |
| `defaultSelection` | `TableSelection` |  |  |
| `expandedValue` | `string[]` |  | 展开集合。给定即受控，语义同上。 |
| `defaultExpandedValue` | `string[]` |  |  |
| `selectionMode` | `TableSelectionMode` |  | 默认 none：不声明则没有选择机制，行也不报 aria-selected。 |
| `prefixColumns` | `TableColumnKind[]` |  | 要哪几列前缀列，按给定顺序插在最前面，默认一列都不插。 它们由库插入并**占住列号**——不占的话右侧所有列的 aria-colindex 会整体串位， 而这正是使用者手工往 columns 里塞假列的原因。作者照 `api.columns` 渲染即可， 每一项都自报 `kind`。 |
| `columnPreference` | `TableColumnPreference` |  | 列偏好。给定即受控：内部不自改，写只发 onColumnPreferenceChange。 持久化归使用者——库只负责把它算进生效列。 |
| `defaultColumnPreference` | `TableColumnPreference` |  |  |
| `page` | `number` |  | 当前页码与每页条数，只用来算序号，不参与切片——切片归调用方 （或分页组件的 `api.slice`）。都不给时序号退回可见序。 |
| `pageSize` | `number` |  |  |
| `loading` | `boolean` |  | 数据在路上：root 报 aria-busy，表体为空时加载态节点显形。 |
| `empty` | `boolean` |  | 显式声明表体为空；缺省按 rows 是否为空推导。 |
| `stickyHeader` | `boolean` |  | 表头吸顶：只落 data-fixed（布尔），钉住的实现归皮肤。列冻结走 data-frozen，两者不同名。 |
| `striped` | `boolean` |  | 斑马纹：表体偶数行换一层浅底。 |
| `borderless` | `boolean` |  | 去掉外框，只留行间横线：root 上的 data-bordered 随之缺席。 |
| `ruled` | `boolean` |  | 列与列之间加竖分隔线，落成 root 上的 data-split。 |
| `footer` | `boolean` |  | 表格带脚注行。行号空间的最后一行留给它，aria-rowcount 也把它算进去。 |
| `loop` | `boolean` |  | 上下键走到首尾是否回绕，默认 false。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr；只对调左右方向键的「展开/收起」语义。 |
| `size` | `Size` |  | 密度：sm / md / lg。只换单元格的纵向内边距与字号，列宽算法不受影响。 |
| `translations` | `Partial<TableTranslations>` |  |  |
| `rowReorderable` | `boolean` |  | 行可以拖着换位。整行都是拖动源；另有一个不占 Tab 位的拖动把手， 触屏那一路只走它（见 getRowDragTriggerProps）。 |
| `onRowMove` | `(details: TableRowMoveDetails) => void` |  |  |
| `allowRowDrop` | `(move: TableRowMoveDetails) => boolean` |  | 这一次搬家许不许。收到的是折算好的落点。 不给即都许——「落进自己的后代」与「落在禁用行上」两条库自己会拦。 |
| `onColumnPreferenceChange` | `(details: TableColumnPreferenceChangeDetails) => void` |  |  |
| `onSortChange` | `(details: TableSortChangeDetails) => void` |  |  |
| `onSelectionChange` | `(details: TableSelectionChangeDetails) => void` |  |  |
| `onExpandedValueChange` | `(details: TableExpandedValueChangeDetails) => void` |  |  |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `sort-change` | `TableSortChangeDetails` | 排序链变化；detail 为 `{ value: { id, direction }[] }` |
| `column-preference-change` | `` | 列偏好变化；detail 为 `{ value: TableColumnPreference }` |
| `selection-change` | `TableSelectionChangeDetails` | 选中集合变化；detail 为 `{ value: string[] \| 'all' }` |
| `expanded-value-change` | `TableExpandedValueChangeDetails` | 展开集合变化；detail 为 `{ value: string[] }` |
| `row-move` | `TableRowMoveDetails` | 行换了位置；detail 为 `{ id, parent, index, ids }`，parent 为 null 即根层，index 是在那一层的落位（已算过先摘后插），ids 是重排好的整份行序 |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhTableRoot` | `default` | `TableRootSlotProps` |  |
| `XhTableRoot` | `toolbar` | `TableToolbarSlotProps` | 工具条槽：搜索、筛选、密度与列设置这些对整张表下手的控件写在这儿。 它渲成 root 的兄弟排在表前——root 是 grid 系角色，子节点只能是 row 与 rowgroup。 |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `column-visibility-trigger` | 'unchecked' \| 'checked' |
| `select-all-trigger` | tableSelectionState(selection, selectableIds) |
| `expanded-row` | 'open' \| 'closed' |

以下名称仅用于内部状态机。

**状态**：`idle` · `resizing` · `columnDragging` · `rowDragging`

**事件**：`SORT.SET` · `SORT.TOGGLE` · `COLUMN_PREF.SET` · `COLUMN_RESIZE.START` · `COLUMN_RESIZE.MOVE` · `COLUMN_RESIZE.END` · `COLUMN_RESIZE.CANCEL` · `COLUMN_RESIZE.STEP` · `COLUMN_DRAG.START` · `COLUMN_DRAG.MOVE` · `COLUMN_DRAG.END` · `COLUMN_DRAG.CANCEL` · `COLUMN.MOVE_BY` · `ROW_DRAG.START` · `ROW_DRAG.MOVE` · `ROW_DRAG.END` · `ROW_DRAG.CANCEL` · `ROW.MOVE_BY` · `ROW.REORDER_BLOCKED` · `COLUMN_PREF.PATCH` · `SELECTION.SET` · `ROW.SELECT` · `SELECTION.ALL_TOGGLE` · `EXPANDED.SET` · `ROW.EXPAND` · `ROW.COLLAPSE` · `ROW.EXPAND_TOGGLE` · `ROW.FOCUS` · `TABLE.BLUR`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `columns` | `readonly TableColumn[]` | 生效的列：前缀列在前、数据列在后，各自自报 kind。 列号、渲染顺序都以它为准；不要前缀列时它与作者给的那份一模一样。 |
| `draggableColumns` | `readonly string[]` | 可以拖着换位的那一段列 id。声明了 `reorderable`、不是冻结列、且彼此相连。 冻结列与不可拖的列是屏障，把可拖范围切成段；这里给的是最长的那一段。 拿它决定渲不渲把手，与库内部判「能不能落」的口径是同一份。 |
| `rowReorderDisabledReason` | `TableRowReorderReason \| null` | 行拖不动的原因，能拖时是 null。声明了 rowReorderable 才可能非空。 库不自己弹提示——要不要把原因显示给用户是使用者的事。 |
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
| `getToolbarProps` | `() => T['element']` | 工具条：搜索、筛选、密度与列设置这些**对整张表下手**的控件摆在这儿。 它是 root 的兄弟不是子节点——root 是 grid 系角色，子节点只能是 row 与 rowgroup。 不给 role：一条控件带要不要 role=toolbar（连同那套方向键 roving）归作者， 要就往里放一个 Toolbar 组件。 |
| `getColumnListProps` | `() => T['element']` | 列设置区：一列一行，行里放显隐把手、列名与作者自己的宽 / 冻结 / 排序控件。 渲什么照 `columnSettings` 走。 |
| `getColumnVisibilityTriggerProps` | `(props: TableColumnProps) => T['element']` | 一列的显隐把手（复选形态）。最后一列显示着时它转 aria-disabled。 |
| `getHeaderProps` | `() => T['element']` |  |
| `getBodyProps` | `() => T['element']` |  |
| `getFooterProps` | `() => T['element']` |  |
| `getHeaderRowProps` | `() => T['element']` | 表头那一行：恒占行号空间的第 1 行。 |
| `getFooterRowProps` | `() => T['element']` | 脚注那一行：占行号空间的最后一行。 |
| `rowNumber` | `(rowId: string) => string` | 这一行显示什么序号。平表是分页全局序号，树形是大纲编号。 不出序号列时仍可调用——它是纯计算，不看要不要那一列。 |
| `columnPreference` | `TableColumnPreference` | 当下的列偏好。原样交出去即可存盘。 |
| `columnSettings` | `readonly TableColumnSetting[]` | 列设置区照它渲：作者定义的那些列，按偏好排过序，**藏起来的也在其中**。 每条自带显隐、冻结、宽与排序，够渲一整行设置项而不必回去比对两份数组。 |
| `setColumnHidden` | `(columnId: string, hidden: boolean) => void` | 藏起 / 放出一列。 |
| `setColumnSticky` | `(columnId: string, sticky: boolean \| 'start' \| 'end') => void` | 改一列的冻结档。false 是不冻结，true 等于 'start'。 |
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
| `getRowDragTriggerProps` | `(props: TableRowProps) => T['element']` | 行拖动把手。触屏那一路唯一的入口，不占 Tab 位。 常挂即可：rowReorderable 关着或这张表拖不动时它自报 data-disabled、也不再让出滚动， 渲了不会错。按拖不拖得动来决定渲不渲，会让 DOM 结构随状态变。 |
| `getExpandTriggerProps` | `(props: TableRowProps) => T['element']` |  |
| `getExpandedRowProps` | `(props: TableRowProps) => T['element']` |  |
| `getEmptyProps` | `() => T['element']` |  |
| `getLoadingProps` | `() => T['element']` |  |
| `getLoadMoreTriggerProps` | `() => T['element']` | 取下一页的入口：还有没有下一页、点了做什么都归作者， 连接层只保证取数在途那一段点不动。 |
| `getLiveRegionProps` | `() => T['element']` | 拖动过程的读屏播报区。视觉隐藏，文本从 `announcement` 取。 它必须在拖动开始之前就在 DOM 上——读屏不播报后插入的节点。 |

## 无障碍

### 键盘

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
| `Enter` / `Space` | focus on column-visibility-trigger | 藏起 / 放出这一列；设置区不是 roving 集合，一列一个 Tab 位，Tab 一路走下去即可逐列开关。只剩最后一列显示着时它转 aria-disabled，按了不动 |
| `Ctrl+A` / `Cmd+A` | focus in table body, selectionMode=multiple | 与全选把手同义：当前可选行全选中就整段清空，否则整段选上（禁用行不算进基数）。单选与不可选的表格不吞这个键，交还浏览器的整页全选；按住不放的连发只算一次 |
| `ArrowLeft` / `ArrowRight` | focus in column-resize-trigger，该列 resizable | 把这一列按 8px 收窄 / 加宽；往行尾侧推是加宽，rtl 下左右两键对调，语义恒是「加宽 / 收窄」 |
| `Shift+ArrowLeft` / `Shift+ArrowRight` | focus in column-resize-trigger，该列 resizable | 按 40px 收窄 / 加宽，方向规则同上 |
| `ArrowLeft` / `ArrowRight` | focus in column-drag-trigger，该列在可拖的那一段里 | 把这一列往前 / 往后挪一位，按一下就是一次完整提交；往行首侧挪是往前，rtl 下左右两键对调，语义恒是「往前 / 往后」；已在段首 / 段末就不动，也不回绕 |
| `Home` / `End` | focus in column-drag-trigger，该列在可拖的那一段里 | 把这一列挪到可拖那一段的段首 / 段末；rtl 下两键对调，语义恒是「段首 / 段末」；已经在那儿就不动 |
| `Alt+ArrowUp` / `Alt+ArrowDown` | focus in table body，rowReorderable 且行拖拽没有被阻断的原因 | 把焦点行往前 / 往后挪一位，按一下就是一次完整提交，不进拖动态；纵轴与文字方向无关，rtl 下两键不对调；已在首行 / 末行就不动，也不回绕；焦点锚点跟着搬走的那一行，连按几下能一路挪到位。裸方向键仍是导航、Space 仍是选中、左右键仍是展开收起 |
| `Alt+ArrowLeft` / `Alt+ArrowRight` | focus in table body，rows 里有行声明了 parentId，rowReorderable 且行拖拽没有被阻断的原因 | 把焦点行改一层缩进：往里是认上一个兄弟当爹，往外是变成父行的下一个兄弟；按一下就是一次完整提交，不进拖动态；横轴跟着文字方向翻，rtl 下两键对调，语义恒是「往里 / 往外」；没有上一个兄弟就缩不进去、已在根层就退不出来，两种情形都不动。rows 里一行都不带 parentId 时这两个键不归表格管，放行给页面 |

### ARIA

以下属性由 `connect` 生成。

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
| `header-row` | `aria-rowindex` | 1 |
| `footer-row` | `aria-rowindex` | HEADER_ROW_COUNT + visibleRows.length + (hasFooter ? … \| undefined |
| `header-row` | `role` | 'row' |
| `footer-row` | `role` | 'row' |

## 样式参考

### 皮肤

`@xihan-ui/styles/table.css` 使用 `[data-scope="table"][data-part="root"]` 部件选择器，位于 `xihan.components` 与 `xihan.motion` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-bordered` | ''（条件成立时才出现） |
| `root` | `data-empty` | ''（条件成立时才出现） |
| `root` | `data-fixed` | ''（条件成立时才出现） |
| `root` | `data-loading` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-split` | ''（条件成立时才出现） |
| `root` | `data-striped` | ''（条件成立时才出现） |
| `header` | `data-fixed` | ''（条件成立时才出现） |
| `body` | `data-empty` | ''（条件成立时才出现） |
| `row` | `data-draggable` | ''（条件成立时才出现） |
| `row` | `data-dragging` | ''（条件成立时才出现） |
| `row` | `data-drop` | 'before' \| 'after' \| 'inside' |
| `row` | `data-section` | 'body' |
| `column-header` | `data-dragging` | ''（条件成立时才出现） |
| `column-header` | `data-drop` | 'before' \| 'after' |
| `column-header` | `data-sortable` | ''（条件成立时才出现） |
| `cell` | `data-disabled` | ''（条件成立时才出现） \| undefined |
| `cell` | `data-dragging` | ''（条件成立时才出现） |
| `cell` | `data-drop` | 'before' \| 'after' |
| `cell` | `data-selected` | ''（条件成立时才出现） \| undefined |
| `toolbar` | `data-size` | props.size |
| `column-list` | `data-size` | props.size |
| `column-visibility-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `column-visibility-trigger` | `data-state` | 'unchecked' \| 'checked' |
| `select-all-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `select-all-trigger` | `data-state` | tableSelectionState(selection, selectableIds) |
| `sort-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `column-resize-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `column-resize-trigger` | `data-resizing` | ''（条件成立时才出现） |
| `column-drag-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `column-drag-trigger` | `data-dragging` | ''（条件成立时才出现） |
| `row-drag-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `row-drag-trigger` | `data-dragging` | ''（条件成立时才出现） |
| `expanded-row` | `data-dragging` | ''（条件成立时才出现） |
| `expanded-row` | `data-state` | 'open' \| 'closed' |
| `load-more-trigger` | `data-loading` | ''（条件成立时才出现） |
| `header-row` | `data-section` | 'header' |
| `footer-row` | `data-section` | 'footer' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-table-bg` | `root` | `background` | `default` | `--xh-bg-surface` | table 的 root 部件 background 覆盖槽。 |
| `--xh-table-border` | `footer`<br>`header`<br>`root` | `border`<br>`border-block-end`<br>`border-block-start` | `bordered`<br>`default` | `--xh-border-default` | table 的 footer、header、root 部件 border、border-block-end、border-block-start 覆盖槽。 |
| `--xh-table-caption-fg` | `caption` | `color` | `default` | `--xh-fg-muted` | table 的 caption 部件 color 覆盖槽。 |
| `--xh-table-caption-font-size` | `caption` | `font-size` | `default` | `--xh-text-label-size` | table 的 caption 部件 font-size 覆盖槽。 |
| `--xh-table-caption-font-weight` | `caption` | `font-weight` | `default` | `--xh-text-label-weight` | table 的 caption 部件 font-weight 覆盖槽。 |
| `--xh-table-caption-px` | `caption` | `padding-inline` | `default` | `--xh-space-3` | table 的 caption 部件 padding-inline 覆盖槽。 |
| `--xh-table-caption-py` | `caption` | `padding-block` | `default` | `--xh-space-2` | table 的 caption 部件 padding-block 覆盖槽。 |
| `--xh-table-cell-gap` | `cell`<br>`column-header` | `gap` | `default` | `--xh-control-gap-md` | table 的 cell、column-header 部件 gap 覆盖槽。 |
| `--xh-table-cell-min-w` | `cell`<br>`column-header` | `min-inline-size` | `default` | `3rem` | table 的 cell、column-header 部件 min-inline-size 覆盖槽。 |
| `--xh-table-cell-px` | `cell`<br>`column-header` | `padding-inline` | `default` | `--xh-control-px-sm` | table 的 cell、column-header 部件 padding-inline 覆盖槽。 |
| `--xh-table-cell-py` | `cell`<br>`column-header` | `padding-block` | `default` | `--xh-_table-cell-py` | table 的 cell、column-header 部件 padding-block 覆盖槽。 |
| `--xh-table-column-fg` | `column-header` | `color` | `default` | `--xh-fg-muted` | table 的 column-header 部件 color 覆盖槽。 |
| `--xh-table-column-font-weight` | `column-header` | `font-weight` | `default` | `--xh-text-label-weight` | table 的 column-header 部件 font-weight 覆盖槽。 |
| `--xh-table-column-list-fg` | `column-list` | `color` | `default` | `--xh-fg-default` | table 的 column-list 部件 color 覆盖槽。 |
| `--xh-table-column-list-font-size` | `column-list` | `font-size` | `default` | `--xh-text-secondary-size` | table 的 column-list 部件 font-size 覆盖槽。 |
| `--xh-table-column-list-gap` | `column-list` | `gap` | `default` | `--xh-_table-column-list-gap` | table 的 column-list 部件 gap 覆盖槽。 |
| `--xh-table-detail-bg` | `expanded-row` | `background` | `default` | `--xh-bg-subtle` | table 的 expanded-row 部件 background 覆盖槽。 |
| `--xh-table-detail-px` | `cell`<br>`expanded-row` | `padding-inline` | `default` | `--xh-space-4` | table 的 cell、expanded-row 部件 padding-inline 覆盖槽。 |
| `--xh-table-detail-py` | `cell`<br>`expanded-row` | `padding-block` | `default` | `--xh-space-3` | table 的 cell、expanded-row 部件 padding-block 覆盖槽。 |
| `--xh-table-drag-fg` | `column-drag-trigger` | `color` | `default` | `--xh-fg-subtle` | table 的 column-drag-trigger 部件 color 覆盖槽。 |
| `--xh-table-drag-fg-active` | `column-drag-trigger` | `color` | `disabled`<br>`dragging`<br>`hover`<br>`not([data-disabled])` | `--xh-fg-default` | table 的 column-drag-trigger 部件 color 覆盖槽。 |
| `--xh-table-drag-fg-disabled` | `column-drag-trigger` | `color` | `disabled` | `--xh-fg-disabled` | table 的 column-drag-trigger 部件 color 覆盖槽。 |
| `--xh-table-drag-grip-h` | `column-drag-trigger` | `block-size` | `empty` | `--xh-space-2` | table 的 column-drag-trigger 部件 block-size 覆盖槽。 |
| `--xh-table-drag-grip-w` | `column-drag-trigger` | `inline-size` | `empty` | `--xh-space-1` | table 的 column-drag-trigger 部件 inline-size 覆盖槽。 |
| `--xh-table-drag-size` | `column-drag-trigger` | `block-size`<br>`inline-size` | `default` | `--xh-control-indicator-size` | table 的 column-drag-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-table-dragging-opacity` | `cell`<br>`column-header`<br>`expanded-row`<br>`row` | `opacity` | `dragging` | `--xh-state-dragging-opacity` | table 的 cell、column-header、expanded-row、row 部件 opacity 覆盖槽。 |
| `--xh-table-drop-fg` | `cell`<br>`column-header`<br>`row` | `background`<br>`box-shadow` | `drop`<br>`drop=after`<br>`drop=before`<br>`drop=inside`<br>`frozen`<br>`is([data-drop='before'], [data-drop='after'])`<br>`not([data-frozen])` | `--xh-bg-brand` | table 的 cell、column-header、row 部件 background、box-shadow 覆盖槽。 |
| `--xh-table-drop-inside-bg` | `body`<br>`root`<br>`row` | `background` | `disabled`<br>`drop=inside`<br>`not([data-disabled])` | `--xh-bg-brand-subtle` | table 的 body、root、row 部件 background 覆盖槽。 |
| `--xh-table-drop-line` | `cell`<br>`column-header`<br>`row` | `block-size`<br>`box-shadow`<br>`inline-size` | `drop`<br>`drop=after`<br>`drop=before`<br>`drop=inside`<br>`frozen`<br>`is([data-drop='before'], [data-drop='after'])`<br>`not([data-frozen])` | `--xh-stroke-thick` | table 的 cell、column-header、row 部件 block-size、box-shadow、inline-size 覆盖槽。 |
| `--xh-table-expand-fg` | `expand-trigger` | `color` | `default` | `--xh-fg-subtle` | table 的 expand-trigger 部件 color 覆盖槽。 |
| `--xh-table-fg` | `root` | `color` | `default` | `--xh-fg-default` | table 的 root 部件 color 覆盖槽。 |
| `--xh-table-font-size` | `root` | `font-size` | `default` | `--xh-_table-font-size` | table 的 root 部件 font-size 覆盖槽。 |
| `--xh-table-footer-bg` | `footer` | `background` | `default` | `--xh-bg-subtle` | table 的 footer 部件 background 覆盖槽。 |
| `--xh-table-footer-font-weight` | `footer` | `font-weight` | `default` | `--xh-font-weight-medium` | table 的 footer 部件 font-weight 覆盖槽。 |
| `--xh-table-header-bg` | `column-header`<br>`header` | `background` | `default`<br>`frozen` | `--xh-bg-subtle` | table 的 column-header、header 部件 background 覆盖槽。 |
| `--xh-table-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-glyph-size-text` | table 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-table-load-more-trigger-bg-hover` | `load-more-trigger` | `background-color` | `hover` | `--xh-bg-subtle` | table 的 load-more-trigger 部件 background-color 覆盖槽。 |
| `--xh-table-load-more-trigger-fg` | `load-more-trigger` | `color` | `default` | `--xh-fg-brand-strong` | table 的 load-more-trigger 部件 color 覆盖槽。 |
| `--xh-table-load-more-trigger-font-size` | `load-more-trigger` | `font-size` | `default` | `--xh-_table-font-size` | table 的 load-more-trigger 部件 font-size 覆盖槽。 |
| `--xh-table-load-more-trigger-gap` | `load-more-trigger` | `gap` | `default` | `--xh-space-2` | table 的 load-more-trigger 部件 gap 覆盖槽。 |
| `--xh-table-load-more-trigger-px` | `load-more-trigger` | `padding-inline` | `default` | `--xh-space-4` | table 的 load-more-trigger 部件 padding-inline 覆盖槽。 |
| `--xh-table-load-more-trigger-py` | `load-more-trigger` | `padding-block` | `default` | `--xh-space-3` | table 的 load-more-trigger 部件 padding-block 覆盖槽。 |
| `--xh-table-load-more-trigger-radius` | `load-more-trigger` | `border-radius` | `default` | `--xh-shape-control` | table 的 load-more-trigger 部件 border-radius 覆盖槽。 |
| `--xh-table-loading-duration` | `loading` | `animation` | `default` | `--xh-shimmer-duration` | table 的 loading 部件 animation 覆盖槽。 |
| `--xh-table-max-h` | `root` | `max-block-size` | `default` | `--xh-viewport-h-lg` | table 的 root 部件 max-block-size 覆盖槽。 |
| `--xh-table-radius` | `root` | `border-radius` | `bordered` | `--xh-shape-surface` | table 的 root 部件 border-radius 覆盖槽。 |
| `--xh-table-resize-fg` | `column-resize-trigger` | `background` | `default` | `--xh-border-default` | table 的 column-resize-trigger 部件 background 覆盖槽。 |
| `--xh-table-resize-fg-active` | `column-resize-trigger` | `background` | `hover`<br>`resizing` | `--xh-bg-brand` | table 的 column-resize-trigger 部件 background 覆盖槽。 |
| `--xh-table-resize-line` | `column-resize-trigger` | `inline-size` | `default` | `--xh-stroke-thin` | table 的 column-resize-trigger 部件 inline-size 覆盖槽。 |
| `--xh-table-resize-line-length` | `column-resize-trigger` | `block-size` | `default` | `60%` | table 的 column-resize-trigger 部件 block-size 覆盖槽。 |
| `--xh-table-resize-radius` | `column-resize-trigger` | `border-radius` | `default` | `--xh-shape-pill` | table 的 column-resize-trigger 部件 border-radius 覆盖槽。 |
| `--xh-table-resize-width` | `column-resize-trigger` | `inline-size` | `default` | `--xh-space-2` | table 的 column-resize-trigger 部件 inline-size 覆盖槽。 |
| `--xh-table-row-bg` | `row` | `background` | `default` | `--xh-bg-surface` | table 的 row 部件 background 覆盖槽。 |
| `--xh-table-row-bg-hover` | `body`<br>`row` | `background` | `disabled`<br>`highlighted`<br>`is(:hover, [data-highlighted])`<br>`not([data-disabled])` | `--xh-bg-subtle` | table 的 body、row 部件 background 覆盖槽。 |
| `--xh-table-row-bg-selected` | `row` | `background` | `selected` | `--xh-bg-subtle-active` | table 的 row 部件 background 覆盖槽。 |
| `--xh-table-row-bg-striped` | `body`<br>`root`<br>`row` | `background` | `striped`<br>`where(:nth-of-type(even)`<br>`where([data-scope='table'][data-part='root'][data-striped] [data-scope='table'][data-part='body'])` | `--xh-bg-subtle` | table 的 body、root、row 部件 background 覆盖槽。 |
| `--xh-table-row-border` | `body`<br>`cell`<br>`column-header`<br>`expanded-row`<br>`footer`<br>`header`<br>`root`<br>`row` | `border-block-start`<br>`border-inline-end` | `is([data-part='header'], [data-part='body'], [data-part='footer'])`<br>`is([data-part='row'], [data-part='expanded-row'])`<br>`not(:last-child)`<br>`not([hidden])`<br>`split` | `--xh-border-subtle` | table 的 body、cell、column-header、expanded-row、footer、header、root、row 部件 border-block-start、border-inline-end 覆盖槽。 |
| `--xh-table-row-drag-fg` | `row-drag-trigger` | `color` | `default` | `--xh-fg-subtle` | table 的 row-drag-trigger 部件 color 覆盖槽。 |
| `--xh-table-row-drag-fg-active` | `row-drag-trigger` | `color` | `disabled`<br>`dragging`<br>`hover`<br>`not([data-disabled])` | `--xh-fg-default` | table 的 row-drag-trigger 部件 color 覆盖槽。 |
| `--xh-table-row-drag-fg-disabled` | `row-drag-trigger` | `color` | `disabled` | `--xh-fg-disabled` | table 的 row-drag-trigger 部件 color 覆盖槽。 |
| `--xh-table-row-drag-grip-long` | `row-drag-trigger` | `inline-size` | `empty` | `--xh-space-2` | table 的 row-drag-trigger 部件 inline-size 覆盖槽。 |
| `--xh-table-row-drag-grip-short` | `row-drag-trigger` | `block-size` | `empty` | `--xh-space-1` | table 的 row-drag-trigger 部件 block-size 覆盖槽。 |
| `--xh-table-row-drag-size` | `row-drag-trigger` | `block-size`<br>`inline-size` | `default` | `--xh-control-indicator-size` | table 的 row-drag-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-table-sort-fg` | `sort-trigger` | `color` | `default` | `--xh-fg-subtle` | table 的 sort-trigger 部件 color 覆盖槽。 |
| `--xh-table-sort-fg-active` | `sort-trigger` | `color` | `sort-index`<br>`sort=asc`<br>`sort=desc` | `--xh-fg-default` | table 的 sort-trigger 部件 color 覆盖槽。 |
| `--xh-table-sort-gap` | `sort-trigger` | `gap` | `default` | `--xh-space-1` | table 的 sort-trigger 部件 gap 覆盖槽。 |
| `--xh-table-state-fg` | `empty`<br>`loading` | `color` | `default` | `--xh-fg-muted` | table 的 empty、loading 部件 color 覆盖槽。 |
| `--xh-table-state-gap` | `empty`<br>`loading` | `gap` | `default` | `--xh-space-2` | table 的 empty、loading 部件 gap 覆盖槽。 |
| `--xh-table-state-min-h` | `empty`<br>`loading` | `min-block-size` | `default` | `8rem` | table 的 empty、loading 部件 min-block-size 覆盖槽。 |
| `--xh-table-state-px` | `empty`<br>`loading` | `padding-inline` | `default` | `--xh-space-4` | table 的 empty、loading 部件 padding-inline 覆盖槽。 |
| `--xh-table-state-py` | `empty`<br>`loading` | `padding-block` | `default` | `--xh-space-6` | table 的 empty、loading 部件 padding-block 覆盖槽。 |
| `--xh-table-sticky-column-layer` | `cell`<br>`column-header`<br>`row` | `z-index` | `drop=after`<br>`drop=before`<br>`drop=inside`<br>`frozen`<br>`is([data-drop='before'], [data-drop='after'])` | `1` | table 的 cell、column-header、row 部件 z-index 覆盖槽。 |
| `--xh-table-sticky-header-layer` | `header` | `z-index` | `fixed` | `--xh-layer-sticky` | table 的 header 部件 z-index 覆盖槽。 |
| `--xh-table-sticky-inset` | `cell`<br>`column-header` | `inset-inline-end`<br>`inset-inline-start` | `frozen=end`<br>`frozen=start` | `0` | table 的 cell、column-header 部件 inset-inline-end、inset-inline-start 覆盖槽。 |
| `--xh-table-toolbar-fg` | `toolbar` | `color` | `default` | `--xh-fg-default` | table 的 toolbar 部件 color 覆盖槽。 |
| `--xh-table-toolbar-gap` | `toolbar` | `gap` | `default` | `--xh-_table-toolbar-gap` | table 的 toolbar 部件 gap 覆盖槽。 |
| `--xh-table-toolbar-py` | `toolbar` | `padding-block` | `default` | `--xh-space-2` | table 的 toolbar 部件 padding-block 覆盖槽。 |
| `--xh-table-trigger-bg-checked` | `column-visibility-trigger`<br>`row-select-trigger`<br>`select-all-trigger` | `background`<br>`border-color` | `is([data-state='checked'], [data-state='indeterminate'])`<br>`selected`<br>`state=checked`<br>`state=indeterminate` | `--xh-bg-brand` | table 的 column-visibility-trigger、row-select-trigger、select-all-trigger 部件 background、border-color 覆盖槽。 |
| `--xh-table-trigger-border` | `column-visibility-trigger`<br>`row-select-trigger`<br>`select-all-trigger` | `border` | `default` | `--xh-border-control` | table 的 column-visibility-trigger、row-select-trigger、select-all-trigger 部件 border 覆盖槽。 |
| `--xh-table-trigger-border-checked` | `column-visibility-trigger`<br>`row-select-trigger`<br>`select-all-trigger` | `border-color` | `is([data-state='checked'], [data-state='indeterminate'])`<br>`selected`<br>`state=checked`<br>`state=indeterminate` | `--xh-table-trigger-bg-checked` | table 的 column-visibility-trigger、row-select-trigger、select-all-trigger 部件 border-color 覆盖槽。 |
| `--xh-table-trigger-fg` | `column-visibility-trigger`<br>`row-select-trigger`<br>`select-all-trigger` | `--xh-_ring-color`<br>`background-color`<br>`color` | `default`<br>`disabled`<br>`focus-visible`<br>`not([data-disabled])`<br>`state=indeterminate` | `--xh-fg-on-brand` | table 的 column-visibility-trigger、row-select-trigger、select-all-trigger 部件 --xh-_ring-color、background-color、color 覆盖槽。 |
| `--xh-table-trigger-radius` | `column-drag-trigger`<br>`column-visibility-trigger`<br>`expand-trigger`<br>`row-drag-trigger`<br>`row-select-trigger`<br>`select-all-trigger`<br>`sort-trigger` | `border-radius` | `default` | `--xh-shape-control` | table 的 column-drag-trigger、column-visibility-trigger、expand-trigger、row-drag-trigger、row-select-trigger、select-all-trigger、sort-trigger 部件 border-radius 覆盖槽。 |
| `--xh-table-trigger-size` | `column-visibility-trigger`<br>`expand-trigger`<br>`row-select-trigger`<br>`select-all-trigger` | `block-size`<br>`inline-size` | `default` | `--xh-control-indicator-size` | table 的 column-visibility-trigger、expand-trigger、row-select-trigger、select-all-trigger 部件 block-size、inline-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

关键帧 `xh-table-loading-pulse` 随皮肤自带，不引用别处文件里的名字；`background-color` · `rotate` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。
