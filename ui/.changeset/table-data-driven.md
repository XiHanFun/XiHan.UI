---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

**新增** 表格的数据驱动模式：给 `columns` 与 `data`，不写结构（Vue 不写默认插槽、React 不给 children、Web Components 只写 `root`）就是一张会排序、会筛选、会分页的表，三端出自同一个结构函数 `tableStructure`。列 id 即字段名，行 id 缺省取 `id`（`rowKey` 可换）；排序按字段值比（数字与日期按大小，字符串按数值序，空值恒排最后），列的 `compare` 可接管；列给了 `filterOptions` 时列头铺一颗筛选钮，点开是一张勾选型菜单，勾选值存在 `filterValue` 里（可受控，事件 `filter-value-change`），列的 `filter` 可换掉缺省的比法，筛选一变回到第 1 页；`pagination` 打开切页，按 `page` / `pageSize`（缺省 10）切出当前页，表后铺一组分页，翻页发 `page-change`。格子文字取列的 `format` 或字段值，要放标签这类内容时用 `cell` 插槽（React 是 `renderCell`，Web Components 写 `slot="cell:<行 id>:<列 id>"`），空态用 `empty` 插槽（React 是 `renderEmpty`）。没写宽度的数据列以 8rem、序号列以 4rem 为伸缩基准，列头多了排序钮与筛选钮也与格子对得齐。筛选菜单与分页开了才加载，手写结构的表格不为它们付体积。

**新增** 表格标准结构的虚拟化开关 `virtual`（与 `estimateSize`，Web Components 为 `estimate-size`）：表体只铺滚到的那一屏行，滚的是表格根节点，吸顶表头、冻结列与行在同一个滚动面里；行号、`aria-rowcount` 与方向键仍按完整行序。Virtualizer 那一块开了才加载。

headless 新增 `TableRecord`、`TableFilterOption`、`TableFilterValue` 等类型，`TableApi` 加上 `records`、`recordCount`、`recordOf`、`cellText`、`filterValue` / `setFilter`、`page` / `pageSize` / `pageCount` / `setPage` 与 `translations`；数据管线 `computeTableDataView` 与 `tableRowDefs` 可单独使用。表格文案新增 `filter`、`empty`、`loading` 三条，十种内建语言包都已补齐；列头在这一列正在筛时报 `data-filtered`。

**修复** Web Components 的 `<xh-table>` 自己挂的播报区打上生成标记，不再被当成作者写的部件。
