---
'@xihan-ui/core': minor
---

新增子入口 `@xihan-ui/core/date`：不带时区的日期值 `PlainDate` / `PlainTime` / `PlainDateTime`，公历加减、差值与取整；时区换算（`today` / `now` / `toDate` / `fromDate`，夏令时跳过与重复的时间按 `disambiguation` 取舍）；按地区划分的周（周首日与周末取自 Unicode CLDR 48，各浏览器一致）；月、季度、年的边界与 ISO 周反查；以及结果与时区无关的格式化器 `createDateFormatter`。命名、取值范围与越界规则沿用 Temporal，用法见文档「日期与时间」。
