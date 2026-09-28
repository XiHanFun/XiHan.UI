---
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

CartesianChart、PieChart、RadarChart、FunnelChart、SankeyChart、GraphChart、HierarchyChart 交出数据表模型：Vue 根的作用域插槽与 React 函数式 children 多一个 `table`，Web Components 元素多一个只读的 `table`。它与根里视觉隐藏的那张表同一份，要可见的表格视图时交给表格组件，不必在图下另写一遍数据。
