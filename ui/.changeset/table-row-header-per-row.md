---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

表格（Table）列定义的 `rowHeader` 除了布尔值，还可以给函数 `(row, rowIndex) => boolean`，按行决定这一格是不是行表头。

- 表体里这一列的格子逐行询问，`rowIndex` 是这一行在可见数据行里的序号（0 起算，与 `cellSpan` 的相同），返回 true 才报 `role="rowheader"`，否则照旧是 `gridcell`。
- 分组报表这类表格因此能只让组头行与小计行的分组格报行表头，明细行里空着的分组格不再是空的行表头。
- 表尾格子没有行定义，函数不调用，按行表头处理。写布尔值时行为不变。
