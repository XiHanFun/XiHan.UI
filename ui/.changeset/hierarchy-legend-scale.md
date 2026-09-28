---
'@xihan-ui/tokens': minor
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

HierarchyChart 新增色阶图例：`colorBy="value"` 时每个看得见的层一条色阶（名字、低端的值、渐变条、高端的值），颜色在同一层里各自归一所以一层一条；下钻后跟着换，其余着色方式收起。新部件 `legend`、`legend-scale`、`legend-scale-name`、`legend-scale-bar`、`legend-scale-value`，`api.legendScales` 与类型 `HierarchyLegendScale`，新文案 `translations.levelLabel`；Vue / React 新增 `XhHierarchyChartLegend` 并铺进缺省结构，Web Components 作者可写 `<div data-xh-part="legend">`。新增槽 `--xh-hierarchy-chart-legend-gap`、`--xh-hierarchy-chart-legend-scale-gap`、`--xh-hierarchy-chart-legend-scale-width`、`--xh-hierarchy-chart-legend-scale-bar-radius`。

新增语义令牌 `--xh-chart-legend-scale-width`（色阶渐变条的长度），CartesianChart 与 HierarchyChart 的同名组件槽都缺省指向它，数值不变。
