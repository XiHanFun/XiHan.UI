---
'@xihan-ui/core': minor
'@xihan-ui/headless': minor
---

CartesianChart 的坐标轴新增比例尺与时区：

- `scale` 新增 `sqrt`、`pow`（指数写 `exponent`，缺省 1）与 `symlog`（对称对数，常数写 `constant`，缺省 1）：数值轴与连续的自变量轴都可以用，跨越正负、含 0 的长尾数据交给 `symlog`。新增类型 `CartesianContinuousScaleKind`。
- 时间轴的 `timeZone`（IANA 名）：刻度按那个时区的墙上时间排，刻度标签、提示框、可及名与数据表里的日期都按它写。
- 参数无效（幂指数不是正的有限数、对称对数常数不是正数、时区名无效）时报新增的诊断码 `chart.scale-param`，与其余规格问题一样整张图不画。
