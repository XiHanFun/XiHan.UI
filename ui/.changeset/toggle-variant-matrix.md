---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

**Toggle 接入 Action Control 形态矩阵，按下态前景改淡底前景。** 连接层的 root 新增稳定属性
`data-xh-action-variant`，由 `variant` × 开关态派生：`solid` 未按下投 `ghost`（透明底，白底承载 hover
100 → pressed 200）、按下才投 `solid`（品牌实心）；其余三档原样投影；`data-variant` 不传时显式落
`subtle`（缺省中性淡底，真源 §7.2 第 2 条）。皮肤删除缺省与四档形态自写的未按下面、深色 solid 覆盖，
颜色由家族矩阵给出，公开槽 `--xh-toggle-bg / -bg-hover / -bg-active / -fg / -border / -bg-disabled /
-fg-disabled / -border-disabled` 改为桥接到矩阵之前；按下（on）面按 §7.3 无滑块开关：品牌淡底 12 →
悬停 20 → 按压 28，前景由 `--xh-fg-brand` 改为 `--xh-fg-on-brand-subtle`（视觉默认变化），outline 按下
后描边仍是 `--xh-border-control`；只有 `solid` 按下后的实心面才灌 currentColor 环。family-backlog 删
selection 段 `toggle:root`，快照重录、CEILING selection 1 → 0；check-family-parity 的按钮形触发器族改比
基础规则里的 `--xh-action-bg-hover / -pressed` 桥接声明。
