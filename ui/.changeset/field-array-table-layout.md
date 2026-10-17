---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

字段数组（FieldArray）新增表格排布：`layout="table"` 时由新部件 `table`（role=table）装下表头与各行，表头与各行共用一套列宽，新增把手仍是 `root` 的最后一个子节点、排在表格之后。`root` 在两种排布下都不带角色；列表排布（缺省）不写 `table`，也不报缺失。

- headless：新增 `layout`（`'list' | 'table'`）与 `columns`（`FieldArrayColumn[]`：`id`、`label?`、`width?`，数字按 px、字符串原样、不写按 1fr）两个 prop；新部件 `table`、`header`（role=row，第 1 行）、`column-header`（role=columnheader）、`item-cell`（role=cell），表格排布下 `item` 是 row（`aria-rowindex` 从 2 起）、`item-label` 是 rowheader、`item-action` 是 cell，`table` 带 `aria-rowcount`（行数加表头）。不带键盘模型，Tab 依次经过各格里的控件与把手。新增 `getTableProps`、`getHeaderProps`、`getColumnHeaderProps`、`getItemCellProps` 与类型 `FieldArrayLayout`、`FieldArrayColumn`、`FieldArrayColumnProps`、`FieldArrayItemCellProps`。
- vue / react：新增 `XhFieldArrayTable`、`XhFieldArrayHeader`、`XhFieldArrayColumnHeader`（`value` 写列 id，没写内容时显示这一列的 `label`）、`XhFieldArrayItemCell`（`value` 写列 id）；根组件收 `layout` 与 `columns`。放进字段（Field）时字段的标签与说明接到 `table` 上，列表排布下不接。
- web-components：`<xh-field-array>` 收 `layout` 特性与 `columns` 属性，认 `table`、`header`、`column-header`、`item-cell` 四个部件，留空的 `column-header` 由元素填入列的 `label`；表格排布下放进 `<xh-field>` 时字段的标签与说明接到 `table` 上，不在字段里时宿主上的 `aria-label` 转给 `table`。元素基类新增受保护的 `acceptsFieldWiring()`，子类据此按状态决定声明的接线目标此刻接不接线。
- styles：表格排布的皮肤，表头淡底、行间内部分隔线、格内衬与表格单元格同一档；新增组件槽 `--xh-field-array-header-bg`、`--xh-field-array-column-header-fg`、`--xh-field-array-column-header-font-weight`、`--xh-field-array-row-divider`、`--xh-field-array-cell-py`、`--xh-field-array-cell-px`、`--xh-field-array-table-border`、`--xh-field-array-table-radius`。皮肤 field-array.css（去注释压空白后）由 7752 字节涨到 10967 字节，涨的是表格排布这一整套规则。
