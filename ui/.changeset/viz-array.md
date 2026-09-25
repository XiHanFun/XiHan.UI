---
'@xihan-ui/viz': minor
---

`@xihan-ui/viz` 新增数组统计与刻度。

- 统计：`extent`、`sum`（Neumaier 补偿，`0.1` 加十次得 `1`）、`mean`、`median`、`quantile`（R-7，与 Excel `QUANTILE.INC`、NumPy 缺省一致）、`variance` / `deviation`（Welford 单遍，样本方差）、`cumsum`、`range`。`null`、`undefined`、`NaN` 视为缺失，一律跳过，不按 0 处理。
- 查找与分组：`bisector` 的 `left` / `right` / `center`；`group`、`rollup`、`index`，值相等的 `Date` 键归入同一组，`index` 遇到重复键抛 `XH_VIZ_DUPLICATE_KEY`。
- 刻度：`ticks`、`tickIncrement`、`tickStep`、`nice`。步长取 1、2、5 × 10 的幂，刻度值由整数下标算出，不出现 `0.30000000000000004`；`nice` 的结果总包含原区间，只要一个刻度又跨过 0 这类不收敛的输入退回第一轮取整，区间不会被越推越大。
- 分箱：`bin` 支持箱数、显式边界与 Sturges / Scott / Freedman–Diaconis 规则，箱左闭右开，最后一个箱包含右端点。
