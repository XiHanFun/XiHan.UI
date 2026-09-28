---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

Heatmap 新增发散色阶、连续色阶与按下事件：

- 负数不再落进第 0 档：不写 `scale` 时数据里出现负数即按发散色阶，以 `midpoint`（缺省 0）为界，低于中点兑向负向色、高于中点兑向正向色，中点那一格取中性中点色。显式写 `scale="sequential"` 保留原来的口径。发散色阶取数据色的发散三色，组件槽 `--xh-heatmap-diverging-negative` / `-center` / `-positive` 可单独改写，`tone` 与 `palette` 在这一档不生效；打印时负向一侧的环改用点线。
- 格子、详情与统计新增 `polarity`（`negative` / `positive` / null）与 `percent`，三张网格新增 `scale`；root 投影 `data-scale="diverging"`，格子与对照条投影 `data-polarity`。对照条从负向满档经中点排到正向满档：api 与插槽作用域新增 `legendItems`、`scaleMode`，WC 元素新增同名只读属性，legend-item 部件读取作者写的 `polarity` 属性；两端文字缺省改为两侧最远的数。新增导出 `heatmapLegendEntries`、`heatmapPlaceOf`。
- `continuous`：着色按数值的确切比例，不按档位取整；档位、打印纹理与可访问名称照旧按档。
- `onCellPress`（事件名 `cell-press`）：点击一格或焦点在格上按 Enter 时报告那一格，载荷与详情同源，与图表家族的 `onDatumPress` 同一口径；Space 不接，照常滚动页面。Vue 的 `useHeatmap` 追加第三个回调参数。
