---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/react": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

新增 `funnel-chart` 漏斗图：看一个流程里各阶段的保留量与逐级转化率。

- 每行数据一个阶段（`nameField` / `valueField`），按先后排好；宽度与数值成正比。`shape` 取 `trapezoid`（上下两边接着相邻阶段）或 `bar`，`align` 取 `center` / `start`，`direction="up"` 画成金字塔。
- 颜色取有序色阶，第一阶段最深、逐级变浅，没有图例，阶段名直接标在阶段上；`palette` 换色相。标签缺省 `outside` 跟在各阶段右边，`inside` 写在阶段里（描一圈承载面色，放不下时写到外侧）。
- `conversion` 取 `previous` / `first` / `none`：转化率写在左侧、落在相邻阶段的交界处；递增的阶段写成大于 100%。隐藏的阶段不画，转化率跳过它重算。
- 每个阶段是带可及名的 `graphics-symbol`；摘要写首尾、总转化率与流失最多的一步，数据表四列。上下键跟着画面走，金字塔里对调。负值报 `chart.negative-share`。
