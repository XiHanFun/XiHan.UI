---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/react": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

`cartesian-chart` 的柱系列新增瀑布 `waterfall`。

- 每一步接在上一步的累计值上浮着，柱上写 `data-trend="rise|fall"`，涨取 `--xh-chart-rise`、跌取 `--xh-chart-fall`；`waterfall.total` 指定小计字段，为真的行从 0 画到当前累计值、保持系列色，它的 `y` 被忽略。
- 新部件 `connector`：相邻两步之间的细线，与上一步的终点同高，只给眼睛看；缺失的一步不画、不改累计，连接线跨过它。
- 数据标签与可及名写这一步的增减，小计写累计值；瀑布不参与堆叠。纹理模式、强制色下由纹理与柱的走向区分涨跌。
