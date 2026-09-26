---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

新增 Chart 图表家族配方 `@xihan-ui/styles/chart.css`：标题、视口与绘图区、在途、图例、提示框、色标、焦点环、引导线、空态与加载态，以及它们的强制色与打印分支，由 `recipes/chart.recipe.json` 生成这一份真源，直角坐标图与饼图共用。

- 两个图表在这些部件上投影 `data-xh-chart-part`（取值与部件名相同），皮肤只留各自的色槽、数据标记与标注。
- 组件覆盖槽不变：`--xh-cartesian-chart-*` 与 `--xh-pie-chart-*` 写在对应部件上接进配方的私有槽，作者在部件或它的祖先上覆盖都照常生效；三端的计算样式与改动前逐项一致。
- 两份图表皮肤各自 `@import '../family/chart.css'`，单独引入仍成立；全量入口把配方与其它家族一起在组件皮肤之前内联一次。
