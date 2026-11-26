---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

**新增** 表格数据驱动模式补上服务端取数、每页条数、列筛选形态与单元格省略。

- `remote`（自定义元素写 `remote`）：`data` 就是服务端排好、筛好、切好的这一页，表格原样铺出，不再自己排序、筛选与切页；排序钮、筛选菜单与分页照常可点，只改写状态并发出 `onSortChange` / `onFilterValueChange` / `onPageChange` / `onPageSizeChange`。`recordCount`（`record-count`）是服务端报的总条数，开了 `pagination` 时页数按它算，缺省取 `data` 的条数。连接层 API 新增 `remote`。
- 每页条数：`pageSizeOptions` 交给表后分页作档位，`pageSize` 改为可受控、配 `defaultPageSize`（`default-page-size`）与 `onPageSizeChange`（事件 `page-size-change`，Vue 另有 `update:pageSize`）；换档时页码按改档前的第一条换算。连接层 API 新增 `pageSizeOptions` 与 `setPageSize`。
- 列的 `filterMode`：缺省 `multiple` 照旧是勾选型菜单；`single` 换成单选型菜单，选完即收起，再选一次已选的那一项撤掉这一列的筛选；`custom` 把列头上筛选那一格交给作者——Vue 的 `filter` 插槽、React 的 `renderFilter`、自定义元素宿主直接子节点上的 `slot="filter:<列 id>"`，参数是 `TableFilterSlotData`（`column`、`value`、`setValue`、`label`）；`<xh-table>` 新增 `setFilter(列 id, 值)` 方法。
- 列的 `truncate`：格子单行省略并写 `data-truncate`，指针移进被裁掉的格子时把全文交给原生提示（`title`），移出即撤。
