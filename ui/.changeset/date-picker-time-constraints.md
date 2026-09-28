---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

DatePicker 的 showTime 接上与时间选择器同一份时间约束。

- 新增 `hourCycle`（`12 | 24`，缺省 24，不随 locale 推断）：12 时时间列末位多出上下午列、输入行的时刻段后面多出上下午段，值仍是 24 小时制的 ISO 串；上下午列的名字走新文案键 `translations.dayPeriod`（缺省 `AM/PM`），格上的字按 locale 现译。Web Components 的 attribute 是 `hour-cycle`。
- 新增 `timeStep: { hour?, minute?, second? }`：时间列按单位取样。Web Components 的 attribute 是 `time-step`（JSON 对象）。
- 新增 `isTimeUnavailable(value, unit, context)`：时列按 24 小时制给值，`context` 带已选的时、分与这份时间所属的日期（还没有值时是聚焦日）。
- `min` / `max` 可以带时间段（`'2026-09-28T09:30'`）：日历按日期段收，与它同一天时界外的时刻留在列里、标为不可选（`aria-disabled` + `data-disabled`，家族禁用面），按下不写值、方向键跳过；列长不随所选的日子变。
- api 新增 `hourCycle`、`timeStep`、`getTimeItemText`、`isTimeItemDisabled`；`DatePickerTimeUnit` 放宽到含 `dayPeriod`；新增 `datePickerTimeModel`、`datePickerNormalizeTime`、`datePickerCalendarBound`。Vue / React 的 `TimePanel` 按 `getTimeItemText` 填字，Web Components 新增只读属性 `timeColumns`，时间格内容为空时由元素填字。
- 皮肤：不可选的时间格选中标记跟着降级，强制色下换 GrayText。
