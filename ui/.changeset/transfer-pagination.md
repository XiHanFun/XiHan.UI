---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

Transfer 新增分页 `pageSize`。

- `pageSize`（Web Components 属性 `page-size`）：给了即分页，两侧各翻各的，只渲染当前这一页，其余条目带 `hidden`，方向键与 roving tabindex 只在这一页里走。全选、三态、`panel-count` 的 `data-count` / `data-checked-count` 与搬运仍按整侧（分侧 + 搜索之后）算。搜索串一变该侧回到第 1 页；条目搬走、全集或每页条数变了之后页数变少时页码夹回最后一页。
- 面板插槽（Vue 作用域插槽 / React 函数式 children）新增 `total`、`page`、`pageCount` 与 `setPage(page)`，翻页器用分页组件拼进面板；元素新增方法 `filteredItems(side)`、`currentPage(side)`、`pageCount(side)` 与 `setPage(side, page)`。
- headless：API 新增 `filteredItems`、`pageSize`、`page`、`pageCount`、`setPage`，`visibleItems` 改为分侧 + 搜索 + 分页之后（不分页时与原来相同）；导出 `transferPageSize`、`transferPageCount`、`transferClampPage`、`transferPageItems` 与 `transferPageKey`；机器 context 新增 `sourcePage` / `targetPage`，事件新增 `PAGE.SET`。
