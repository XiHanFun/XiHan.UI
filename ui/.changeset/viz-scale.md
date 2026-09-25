---
'@xihan-ui/viz': minor
---

`@xihan-ui/viz` 新增比例尺与定义域推断。全部比例尺冻结不可变，`nice()` 返回新的比例尺。

- 连续：`scaleLinear`（可分段，`[0, 50, 100] → [a, b, c]`）、`scalePow`、`scaleSqrt`（气泡半径用它，面积才与数值成正比）、`scaleLog`（定义域含 0 或跨越正负时抛 `XH_VIZ_LOG_DOMAIN`；跨度不足 3 个数量级时补 2、5 倍刻度）、`scaleSymlog`。都有 `map`、`invert`、`ticks`、`tickFormat(locale, count, spec)`、`nice`，`clamp` 与 `round` 可选。缺失值映射为 `undefined`。
- 时间：`scaleTime` / `scaleUtc`，刻度与取整按日历推进，标签多尺度；可传入其他时区的间隔与 `timeZone`。
- 色阶位置：`scaleSequential` / `scaleDiverging` 输出 t ∈ [0, 1]（发散以 0.5 为中点），始终钳制，颜色交给样式在令牌之间插值。
- 分档：`scaleQuantize`、`scaleQuantile`、`scaleThreshold` 输出档位序号，`invertExtent` 给出每档的取值区间。
- 类目：`scaleBand` 与 `scalePoint` 共用步长，point 落在同参数 band 的中线上，柱线组合时点正落在柱中间；`invert` 按格子反查类目。`scaleOrdinal` 的定义域必须显式给出，没见过的键返回 `undefined`，值域比定义域短时报错、不循环复用。重复的键抛 `XH_VIZ_DUPLICATE_KEY`。
- `inferDomain(values, options)`：数据为空时为 [0, 1]；`bars` 轴强制包含 0，被固定成不含 0 时抛 `XH_VIZ_BAR_BASELINE`；作者固定的一端不外扩、不取整。
