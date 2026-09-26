---
'@xihan-ui/viz': minor
---

`@xihan-ui/viz` 新增缩放窗口的数学、种子随机与统计布局。

- 窗口：`AxisWindow` 用定义域的比例 `[0, 1]` 表达一段窗口。`zoomAt` 以锚点为中心缩放，锚点对着的定义域值不动，跨度夹在 `minSpan` / `maxSpan` 内；`pan` 按跨度的倍数平移，到头停住；`clampWindow` 把窗口推回 `[0, 1]`。`windowToDomain` / `domainToWindow` 在连续轴上换算（linear、time、log、symlog）；`windowToIndexRange` / `indexRangeToWindow` 在类目轴上取整到类目边界；`pixelsToWindow` 把一段像素换成窗口，纵轴自下而上也得到 `start ≤ end`。
- 随机：`createRandom`（mulberry32）同一个种子给出同一串数；`hashSeed`（FNV-1a）把字符串散成种子；`jitter(identity, amount)` 以数据身份为种子给出抖动偏移，重渲染、换序都落在同一处。
- 统计布局：`waterfall` 逐步累计，小计从 0 画到累计值；`boxplotStats` 按 R-7 求四分位，须线到 1.5 倍四分距以内最远的点，其外为离群点；`kde` 核密度估计（高斯或 Epanechnikov，带宽缺省 `silvermanBandwidth`）；`linearRegression` 最小二乘与决定系数；`movingAverage` 尾随窗口平均。缺失值一律跳过，不按 0 处理。
