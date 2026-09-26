---
"@xihan-ui/headless": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

**变更** Heatmap 并入图表家族，公开部件与键盘表不变：

- 分档交给图表引擎的分档比例尺：档数给定时有数据的几档等宽分开（结果与原先相同），给了 `thresholds` 时按分界落档；`thresholds` 里有重复或不是有限数的值时剔除并报 `chart.invalid-range`（原先重复的分界会多出一档永远用不上的空档）。新导出 `normalizeHeatmapThresholds`。
- `palette` 扩到基础色板的十二个色相加 `gray`：red / orange / amber / yellow / lime / green / teal / cyan / blue / indigo / purple / pink。满档取同名色相的 600 档，不再借用语气色——**视觉变化**：`green` / `blue` / `orange` / `red` 原先取 success / info / warning / danger 的 600 档，现在取 green / blue / orange / red 的 600 档；要回到语气色写 `tone`。
- 详情条与对照条走 Chart 家族配方：详情条由反白改为与其余图表提示框同一副 frosted 材质、overlay 圆角与正文字号（**视觉变化**）；`--xh-heatmap-tooltip-bg` / `-fg` / `-border` 仍可覆盖颜色，`-py` / `-px` / `-radius` / `-shadow` 的缺省值随配方换成 frosted 那一套。
- 文档分类从「数据展示」迁到「图表」，页面地址不变。
