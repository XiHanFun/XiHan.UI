---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

Pagination 新增整组 `disabled`：翻页钮、页码与省略位都是原生 disabled（不可聚焦、不接指针与键盘、不进按压面），跳页输入框与每页条数下拉一并禁用，已摊开的省略位收起；当前页照常带 `aria-current`，皮肤把它退成淡底加禁用色，位置仍标得出。命令式 `setPage` 不受约束，`previousPage` / `nextPage` 照常报出。根上投影 `data-disabled`，connect 新增 `disabled`。

新增 `first-trigger` / `last-trigger` 部件（Vue / React `XhPaginationFirstTrigger` / `XhPaginationLastTrigger`），按需放在上一页之前、下一页之后，一步跳到首页 / 末页，到头那一侧原生 disabled；可及名取 `translations.firstTrigger` / `translations.lastTrigger`（缺省 First page / Last page），不写内容时皮肤画双箭头，rtl 下对调。

皮肤 pagination.css 涨在首页 / 末页钮并入格子骨架、双箭头兜底字形与禁用当前页的淡底上，体积基线随之重落。
