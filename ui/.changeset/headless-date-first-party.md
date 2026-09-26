---
'@xihan-ui/headless': major
---

日期族改用 `@xihan-ui/core/date`，不再依赖 `@internationalized/date`（连带去掉它引入的 `@swc/helpers`）。至此全部库包没有运行时第三方依赖。

- 周首日按内置的 CLDR 48 周数据确定，同一个 locale 在各浏览器里排出同一张月历。此前 Chrome 取 `Intl.Locale#getWeekInfo`，其余浏览器取依赖自带的旧表，少数地区的首列因浏览器而异。
- 日历的标题、表头、格子与周期标签只按日期字段格式化，与时区无关；`buildWeekDays`、`buildPeriodGrid`、`calendarPeriodOf`、`calendarPeriodValue` 的 `timeZone` 选项随之删除。组件的 `timeZone` prop 不变，仍决定「今天」是哪一天与日期字段的 `valueAsDate`。
- 撤掉只在内核里使用的导出：`parseCalendarDate`、`calendarHeadingPieces`、`calendarPeriodStart`、`calendarWeekListedIn`、`isoWeekNumber`、`isoWeekYear`、`isoWeekStart`、`isoWeekOf`、`isoWeeksInYear`、`blocksToDate`、`parseTimeValue`、`draftFromTime`、`timeFromDraft` 与类型 `CalendarHeadingPieces`。

迁移：

- `isoWeekNumber(v)` / `isoWeekYear(v)` 改用 `PlainDate.from(v).weekOfYear` / `.yearOfWeek`，`isoWeekStart(year, week)` 改用 `fromIsoWeek(year, week)`，`isoWeeksInYear(year)` 改用 `@xihan-ui/core/date` 的同名函数。
- `parseCalendarDate(v)` 改用 `PlainDate.from(v)`；它遇到不合法的串抛 `RangeError`，需要空值兜底时自行捕获。
- 调用上述网格函数时去掉 `timeZone`。
