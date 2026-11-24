---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
'@xihan-ui/tokens': major
'@xihan-ui/styles': major
---

**破坏性** 八个图表的取数在途从 `pending` 改叫 `loading`，与 Select、Table、Tree 等 19 个组件同一个名字；`pending` 只留给 Dialog、Drawer、Popconfirm 的确认门（异步确认进行中）。行为不变：首次取数、手里还没有数据时空态转圈，之后重取保留上一帧并淡下去，根上 `aria-busy`。

| 旧名 | 新名 |
| --- | --- |
| CartesianChart、PieChart、FunnelChart、RadarChart、SankeyChart、GraphChart、HierarchyChart、Heatmap 的 `pending`（WC attribute `pending`） | `loading`（WC attribute `loading`） |
| 令牌 `--xh-chart-pending-alpha` | `--xh-chart-loading-alpha` |
