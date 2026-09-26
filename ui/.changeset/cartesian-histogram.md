---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/react": minor
"@xihan-ui/web-components": minor
---

`cartesian-chart` 的柱系列新增分箱区间，画直方图。

- 柱的 `x` 可写成二元组 `[起, 止]`：自变量轴推断为数值轴（或时间轴），定义域盖到最后一箱的止点；柱按区间的真实宽度画，相邻两箱之间留一道表面间隙，宽度不等的箱如实画出。
- 键的中心与锚点落在箱的正中；提示框、可及名、数据表与摘要把键写成「起 – 止」。
- 止点不在起点之后时报 `chart.invalid-range`，整张图按规格不合法处理。分箱本身用 `@xihan-ui/viz` 的 `bin()` 或后端算好再给。
