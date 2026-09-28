---
'@xihan-ui/styles': minor
---

Badge 新增两个组件槽 `--xh-badge-offset-inline` 与 `--xh-badge-offset-block`，微调角标离角多远（不设 prop）：正值朝行内末端、块末端挪，RTL 下行内末端在左；四个角各按贴哪条边换正负号，同一个值在哪个角都朝同一个方向挪。不写时落点不变。badge.css 的体积基线随四个落点的偏移写法上调。
