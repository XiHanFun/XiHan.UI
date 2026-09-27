---
"@xihan-ui/core": minor
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/react": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

`cartesian-chart` 新增箱线系列 `mark: 'boxplot'`，另有小提琴画法。

- `y` 写字段名时同一个 x 上的全部行是一组原始值，按 R-7 求四分位，须线到 1.5 倍四分距以内最远的点，其外为离群点（`outliers: false` 时须线直达两端）；`y` 写成 `{ min, q1, median, q3, max }` 时直接用算好的五数，五个数须依次不减，否则报 `chart.invalid-range`。
- 新部件 `box`（箱，可聚焦）、`whisker`、`median`、`outlier`：箱铺系列色的淡洗并描出轮廓，中位线加粗，离群点是空心小圆；`box` 上写 `data-style="box|violin"`。
- `style: 'violin'` 用核密度画出每组分布的对称轮廓，宽度按整个系列里最大的密度归一；要原始值，否则报新诊断码 `chart.violin-raw`。
- 可及名与提示框按新文案 `boxLabel` 写出五数，数据表五数与离群点各一列（列名 `boxColumns`），锚点落在中位数。
