---
'@xihan-ui/core': minor
---

`@xihan-ui/core/date` 新增混合日期值的墙上时间与分桶键，报表、图表与列表按同一规则处理 ISO 字符串、毫秒数与 Date：

- `wallClockParts(value, { timeZone? })`：读成某个时区里的年月日时分秒毫秒；字符串可以只写到年或月，没写到的部分为 null。
- `wallClock(value, 'date' | 'datetime', { timeZone? })`：写成可按字符串比较的墙上时间，没写到的部分取最小值。
- `bucketKey(value, unit, { timeZone? })`：按 `DATE_BUCKET_UNITS`（year、quarter、month、week、day、hour）取分桶键，如 `2026-Q4`、`2026-W42`（ISO 周），键按字符串排序即按时间排序。

不带偏移的字符串按写下的墙上时间取；带 `Z` 或偏移的字符串、毫秒数与 Date 换算到 `timeZone`，不给时取运行环境所在的时区。缺失值得 null，不合法的值抛 `RangeError` 或 `TypeError`。
