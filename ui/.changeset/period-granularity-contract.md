---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
'@xihan-ui/styles': minor
---

重构 Calendar 与 DatePicker 的周期选择契约。

- `view` 更名为 `granularity`，支持 `day / week / month / quarter / year`。
- 删除 `weekSelection`；周成为一级粒度，可独立搭配 single、multiple 或 range。
- 日期格与粗粒度格统一为 `CalendarPeriod`，包含 `key / start / end / label / outside`。
- `CalendarDay.value` 改为 `start`，`inMonth` 改为 `outside`；面板与根插槽新增统一的 `periods`。
- 新增 `calendarPeriodValue`，把单选或区间锚点转换成 `{ granularity, start, end, keys }`。
- 切换粒度会清空旧选择；切换选择模式会按新模式收口现值。
- 周面板改为一列一个整周周期格；区间选择仍默认单栏，多面板只由 `visibleCount` 显式开启。
- 周字段与周面板统一使用 ISO 周历，固定周一到周日，不再随 `locale` 改变周边界。
- `showTime` 明确只在 `granularity=day + selectionMode=single` 下生效。

迁移：把 `view="day" + weekSelection` 改为 `granularity="week"`；其他 `view` 用法直接改名为 `granularity`。渲染日期矩阵时使用 `day.start` 作为格子值，以 `day.outside` 判断相邻月份。
