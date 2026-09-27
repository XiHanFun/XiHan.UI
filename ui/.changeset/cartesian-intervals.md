---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/react": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

`cartesian-chart` 新增区间、棒棒糖与流图。

- 柱与折线的 `y` 可写成二元组 `[下, 上]`：柱从下端画到上端浮着（数值轴不再强制含 0），折线只铺一条区间带、不画线，锚点落在带的正中。提示框、可及名与数据表写成「下 – 上」，系列 `id` 缺省取上端字段；区间不参与堆叠，下端高于上端时报 `chart.invalid-range`。
- 柱的 `shape: 'lollipop'`：新部件 `stem`（细杆）顶一个可聚焦的 `point`；区间时两头各一个点（哑铃），只有上端的点可聚焦。图例与提示框的色标画成圆。
- 折线堆叠的 `stackOffset` 新增 `silhouette`（以 0 为中线上下对称）与 `wiggle`（流图，层按峰值出现的先后由内向外排）。
