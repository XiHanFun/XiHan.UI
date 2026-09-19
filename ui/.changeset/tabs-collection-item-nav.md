---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

Tabs 缺省 line 档的页签接入 Collection Item 家族的 `nav` 语境：`getTriggerProps` 在 `variant === 'line'` 时投影 `data-xh-collection-item` / `data-xh-collection-size` / `data-xh-collection-context='nav'`，并对所有变体的选中页签新增 `data-current`（`aria-selected` 与 activation 族 `data-state` 保留）。皮肤把 `--xh-tabs-trigger-*` 公开槽映射到家族桥接槽，悬停与按下由「只换前景」改为白底承载阶梯换面（hover `--xh-bg-subtle` + `--xh-fg-default` → pressed `--xh-bg-subtle-hover`，只换面不缩放），未选中页签字重由 label 500 改为 regular 400，当前页保持透明面 + `--xh-fg-brand-strong` + medium 并叠加 hover / pressed 面；card / segment 档不归族，面与字色规则收进各自形态作用域，取值不变。
