---
'@xihan-ui/viz': minor
---

`@xihan-ui/viz` 新增时间间隔与时间刻度。

- `localIntervals` / `utcIntervals`：毫秒、秒、分、时、日、周、月、年，各带 `floor`、`ceil`、`round`、`offset`、`range`、`count`、`every`，全部返回新的 `Date`、不修改入参。时、分、秒按绝对时长推进；日、周、月、年按日历推进，跨夏令时的一天是 23 或 25 小时，日刻度始终落在当地零点。
- `every(n)` 按上一级里的序号取余：每 15 分钟落在 0、15、30、45 分，每两日在月初重新起算。
- `createTimeIntervalSet(calendar)`：间隔算法只经由 `TimeCalendar`（墙上时间与时间点互换）读写日期字段，本地与 UTC 两份日历已内建（`localCalendar`、`utcCalendar`），任意时区传入按同一接口实现的日历即可得到同一套间隔。
- `timeTickInterval` / `timeTicks`：按目标间隔在 1、5、15、30 秒 / 分，1、3、6、12 时，1、2 日，1 周，1、3 月，1 年里取最近者；跨度超过一年按年数取刻度步长，不足一秒按毫秒取。周刻度缺省从星期一开始，`firstDayOfWeek` 可改。
- 年份 0–99 按字面年份处理，不映射到 1900 年代；无效日期立即抛 `XH_VIZ_INVALID_ARGUMENT`。
