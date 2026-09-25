---
'@xihan-ui/viz': minor
---

`@xihan-ui/viz` 新增数字、时间与时长格式。

- `createNumberFormat(locale, spec)`：以 `Intl.NumberFormat` 为底，按参数缓存；支持百分比、货币、单位、紧凑记数（zh-CN 得到「1.2万」「3.4亿」，en 得到「12K」）、固定小数位与有效数字。参数不合法（缺货币代码、语言标签非法）抛 `XH_VIZ_INVALID_ARGUMENT`。
- `tickFormat(step, locale, spec)`：精度由刻度步长推导，同一根轴上的标签小数位一致（`0.0`、`0.5`、`1.0`）；百分比先乘 100 再推导；紧凑记数写到步长最低一位，`12500` 不会被写成「13K」。
- `roundToTotal(values, total, digits)`：最大余数法，取整后的合计恰为目标，三个三分之一得到 34、33、33。
- `createTimeFormat(locale, timeZone)`：刻度标签按日期落在的最粗一级边界显示（1 月 1 日显示年份、月初显示月份、零点显示日期）；`full` 给提示框与可及名用，带到指定粒度的全部字段。
- `createDurationFormat(locale, units)`：从最高的非零单位起连续取两个单位（可调），单位文字由调用方按语言提供。
