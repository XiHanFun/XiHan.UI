---
"@xihan-ui/core": minor
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/react": minor
"@xihan-ui/web-components": minor
---

直角坐标图接受列式数据，百万点的折线、K 线、柱与散点照样跟手。

- `data` 可以是 `createColumnStore({ fields, columns })` 建的列式数据仓（headless 与三个适配器都转发这个函数及其类型），每个字段一列 `Float64Array`，缺失写 `NaN`，日期写时间戳；系列照常用字段名取列。
- 列式数据走独立的大数据管线、总是画在画布上：折线与面积按像素列 M4 降采样（尖峰不丢），K 线与柱窄于 3px 时按 2 的幂根一组合并（组按序号对齐），散点按 2px 格稀疏；拾取在有序的自变量列上二分、散点走像素网格；提示框、可及名、键盘与数据表用原始数据。
- 数据表超过 500 行时按自变量区间聚合成不超过 100 行，表题按新文案 `translations.aggregatedCaption` 注明聚合了多少行；摘要由分块极值直接算。
- 不支持的写法报 `chart.columns-option`，共用的自变量列乱序报 `chart.columns-unsorted`，整张图不画。
- 新写法：`xAxis.ordinal`（列式数据按数据点等距排列、跳过休市）、`yAxis.fit: 'window'`（数值轴只按缩放窗口里露出的数据取，两种数据都支持）、柱的 `trend: [from, to]`（按两个字段的涨跌取色，两种数据都支持）。等距排列写在对象数组上、`trend` 与瀑布同写报 `chart.option-conflict`。
- core 新增诊断码 `chart.columns-option`、`chart.columns-unsorted`、`chart.option-conflict`。
