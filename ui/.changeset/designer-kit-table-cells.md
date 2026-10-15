---
'@xihan-ui/designer-kit': minor
---

`@xihan-ui/designer-kit` 新增合并单元格表格的几何运算。表单的表格布局、打印的表格元素、报表的网格共用这一组函数。函数只给计算结果，编辑操作由各设计器自己生成。

- `TableCell` 是 `{ id, row, column, rowSpan, columnSpan }`，行列从 0 起，跨度至少为 1。
- `checkTableCells(size, cells)`：返回全部问题，有五类：
  - `invalid-size`：表格尺寸不合法。
  - `invalid-cell`：单元格本身不合法。
  - `out-of-bounds`：单元格越界。
  - `overlap`：与其他单元格重叠，报在后出现的那个单元格上。
  - `gap`：位置没有被任何单元格覆盖，按行优先依次报出。
- `planCellMerge(cells, ids)`：
  - 成功时给出左上角的 `anchor`、合并后的跨度，以及按输入顺序列出的被并入单元格 `absorbed`。
  - 失败时给出原因：`unknown-cell`（单元格不存在）、`too-few-cells`（选中不足两个）或 `not-rectangle`（拼不成矩形）。
- `planCellSplit(cell)`：给出拆分后要补新单元格的位置。
- `planTableLineInsert` / `planTableLineRemove(size, cells, axis, at)`：返回 `{ size, updates, added, removed }`，分别是增删一行（列）后的新尺寸、位置或跨度变了的单元格、要新建的单元格、要删除的单元格。`at` 越界，或表格只剩一行（列）时仍要删除，都抛 `RangeError`。
