---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

表格（Table）新增 `footerCellSpan`：表尾的单元格合并，与 `cellSpan` 同一种写法，逐格询问第几行表尾（`level`）的哪一格，返回 `rowSpan` / `colSpan`。

- 起点格报 `aria-colspan` / `aria-rowspan`，宽度按跨过的列相加，纵跨时铺满几行表尾。与起点同一行、被横向跨过的格子不渲染；下面的表尾行里被纵向跨过的，留一格对读屏隐藏的占位。纵向只在表尾行之间，不跨进表体。
- 交叉表、分组报表的总计标题格因此能横跨各层行表头列，不再留下空的行表头。
- headless 的 `getCellProps` 新增 `footer`（表尾格子所在的第几行表尾），新增类型 `TableFooterCellSpanDetails`。Vue / React 的 `XhTableCell` 与 Web Components 的表尾 cell 按所在表尾行的 `level` 自动带上，作者照常逐格渲染。
- Web Components 的 `footerCellSpan` 只作为 property 设置。
