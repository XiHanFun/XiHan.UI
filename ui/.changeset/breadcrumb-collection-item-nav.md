---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

Breadcrumb 链接接入 Collection Item 家族的 `nav` 语境：`getLinkProps` 投影 `data-xh-collection-item` / `data-xh-collection-size` / `data-xh-collection-context='nav'`，当前页额外投影布尔属性 `data-xh-collection-terminal`（它同时带 `aria-disabled='true'`，不显式标会被家族禁用面吃掉；`aria-current='page'`、`aria-disabled`、`tabindex=-1` 与拦点击不变）。皮肤删掉手写的悬停、按下、`[data-current]` 规则与 forced-colors 按下块，改在链接基础规则里把 `--xh-breadcrumb-*` 公开槽映射到家族桥接槽；取值不变：静息 `--xh-fg-muted` + regular，hover `--xh-bg-subtle`（100）+ 随语气字色 → pressed `--xh-bg-subtle-hover`（200）只换面，当前页透明面 + `--xh-fg-default` + medium + cursor default，不响应 hover / pressed。
