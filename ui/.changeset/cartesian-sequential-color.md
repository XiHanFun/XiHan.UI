---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/react": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

`cartesian-chart` 的散点新增按值着色 `color` 与根上的色板 `palette`。

- `color` 把一个字段映射到顺序色阶，全部按值着色的系列共用一把尺；这样的系列不再取分类色（形状照旧随色槽），字段缺失的点取色阶中点。点只用色阶上从 30% 起的一段，最浅的一段压在承载面上看不清。
- 图例末尾生成色阶：新部件 `legend-scale`、`legend-scale-name`、`legend-scale-bar`、`legend-scale-value`（`data-edge="min|max"`），渐变按点用的同一段画；没有按值着色时整块收起。只有一个系列而有色阶时图例不再收起。
- `palette`（与热力图同名的十三个色板）把顺序色阶换到基础色板里同名的色相上，起点贴近承载面、终点贴近正文色，亮暗主题下都是值越大越显眼。Web Components 写 `palette` 属性。
- 连接层在点与提示框的色标上写 `data-seg="low|high"` 与内联 `--xh-_chart-p`，皮肤用一层 `color-mix` 插值；系列分组、图例项与提示框的行带 `data-xh-chart-scale="sequential"`。
- 新增文案 `colorLabel`；数据表多一列，缺省可及名与提示框在数值后补上颜色对应的值。
- Chart 家族配方新增顺序色阶的三个锚点私有槽与十三个色板规则，提示框的色标按段插值。
