---
'@xihan-ui/headless': minor
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

图表（CartesianChart、PieChart、FunnelChart、RadarChart、GraphChart、HierarchyChart、SankeyChart）在根末尾追加的视觉隐藏数据表不再撑出祖先的滚动条。此前 1px 的隐藏样式直接写在 `<table>` 上，而表格的 `block-size` 只当最小高度、`overflow` 对表格不生效，表格照样有几十行那么高，绝对定位的盒子算进祖先的可滚动溢出，图表放进 `overflow: auto` 的容器（卡片、面板、对话框正文）就多出一截空滚动。新增部件 `table-region`（`getTableRegionProps()`）：块级、1px、裁掉，视觉隐藏落在它上面，表格放在里面照常排版，读屏读到的数据表不变；`table` 部件不再带隐藏样式。三个适配器同步改为「摘要 + 区域（内含表格）」。
