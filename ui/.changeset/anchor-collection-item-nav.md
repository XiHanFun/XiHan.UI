---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

Anchor 链接接入 Collection Item 家族的 `nav` 语境：`getLinkProps` 投影 `data-xh-collection-item` / `data-xh-collection-size` / `data-xh-collection-context='nav'`，`getLinkTextProps` 投影 `data-xh-collection-slot='text'`。皮肤删掉手写的 `:hover`、按下与 `[data-current]` 规则及 forced-colors 按下块，改在链接基础规则里把 `--xh-anchor-*` 公开槽映射到家族桥接槽；取值不变：静息 `--xh-fg-muted` + regular，hover `--xh-bg-subtle`（100）+ `--xh-fg-default` → pressed `--xh-bg-subtle-hover`（200）只换面，当前节 `--xh-fg-brand-strong` + medium 并叠加 hover / pressed 面，2px 指示条仍是 list 上的滑动 indicator 部件。
