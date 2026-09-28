---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

Table 新增单元格合并、表头分组，冻结列不再要求数字宽度：

- `cellSpan`（与 antd 的 `spanMethod` 同一种写法）：逐格询问合并区的大小。起点格报 `aria-rowspan` / `aria-colspan`，横向合并的宽度按跨过的列相加；同一行被跨过的格子写 `hidden` 不渲染，下面行里被纵向跨过的在合并区最左那一列留占位（`data-covered`，对读屏隐藏、保住列宽）。纵向合并的起点格投影 `data-row-span`，挂载后按实测行位铺满合并的几行（高度写进私有槽，负外边距让回自己那一行）。合并遇到展开的详情行截断。新增 `cellSpanOf`。
- 列定义新增 `children`：分组列只在表头占格、横跨它的叶子列（`data-group`），不进列号空间。新增 `headerRows` / `headerRowCount`，表头行按 `level` 逐层渲染（`getHeaderRowProps({ level })`、`getColumnHeaderProps({ value, level })`，Vue / React 的 `XhTableRow` 与 `XhTableColumnHeader` 新增 `level`，WC 在表头行上写 `level` 属性）；较浅的叶子列纵向跨到最后一行，数据行的行号与 `aria-rowcount` 把各层表头都算进去。示例「多级表头与表头分组」改为这种写法，不再手写行号与跨列数。
- 冻结列的吸附偏移：数字宽度直接累加，其余取挂载后实测的列头宽度，不再从第一列没写数字宽度的列起一律贴边。
- 机器新增挂载后的版面实测（只在有非数字宽度的冻结列、合并或分组时观察），适配器把 root 节点交给它；新增导出 `tableLeafColumns`、`tableColumnAncestors`、`buildTableHeaderRows`、`tableLayoutNeeds`、`measureTableLayout`、`sameTableLayout`、`TABLE_EMPTY_LAYOUT` 与相应类型。

皮肤涨在纵向合并格、占位格与分组表头三组规则上。
