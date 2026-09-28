---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

CalendarPicker 与 CalendarRangePicker 新增 `firstDayOfWeek`（0 = 星期日 … 6 = 星期六，与 Heatmap 同一套写法；非整数向下取整后按 7 取模），单独改周首日：表头、每一行的行首与 Home / End 跟着它走，月份名与星期名仍按 `locale`；不给时照旧按 `locale`。Web Components 的 attribute 是 `first-day-of-week`。`week` 粒度仍按 ISO 周成段。

`buildMonthGrid` 与 `buildWeekDays` 的选项新增 `firstDayOfWeek`；`calendarNavTarget` 的第三个参数放宽为 `WeekStart`（locale 或 ISO 星期序）。
