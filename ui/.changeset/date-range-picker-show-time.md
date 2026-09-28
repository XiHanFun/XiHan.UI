---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

DateRangePicker 新增一体化时间 `showTime`（只在 `granularity=day` 下生效）。

- 两端都升格为不带时区的 `YYYY-MM-DDTHH:mm[:ss]`：两组段位带上时刻段，浮层里起止各多出一组时间列，选完日期不收起，由新部件 `confirm-trigger` 收口。`timeZone` 仍只决定「今天」。
- 新增部件 `column-group`、`column-group-label`、`time-column`、`time-item`、`confirm-trigger`，列与格与 DatePicker 的时间部件同名，一端的外壳与小标题与 TimeRangePicker 同名，按 `index`（0 起点、1 终点）归属。Vue / React 新增 `XhDateRangePickerTimePanel`（起止两组整组自动铺）与 `XhDateRangePickerConfirmTrigger`；Web Components 由作者写两组 `data-xh-part="column-group"`（`index` 属性区分），新增只读属性 `timeColumnGroups`，时间格内容为空时由元素填字。
- 新增 `timeGranularity`（`'minute' | 'second'`，缺省 minute；不扩展 `CalendarGranularity`）、`hourCycle`（`12 | 24`，缺省 24）、`timeStep`、`isTimeUnavailable`（`context.index` 是哪一端、`context.date` 是这一端的日期），与时间选择器共用一份约束；`min` / `max` 可以带时间段，同一天界外的时刻标为不可选。起止落在同一天时终点列早于起点时刻的格自动不可选；两端按日期时间比先后，终点早于起点即整份标为不合法。
- 新增 `defaultTime: [string, string]`：只点日期时给还没有时刻的那一端补上对应时刻；快捷选项同样是「日期拼上这一端此刻的时刻」。
- 新增 `activeIndex`（`0 | 1`，可受控，配 `onActiveIndexChange` / Vue `update:activeIndex` / Web Components `active-index-change`）：从终点那组段位展开（点它或在它上面按 Alt+ArrowDown）为 1，其余为 0；为 1 且已有起点时日历只改终点。Web Components 的 attribute 是 `show-time`、`time-granularity`、`hour-cycle`、`time-step`、`active-index`，`defaultTime` 与 `isTimeUnavailable` 只能走 property。
- 文案新增 `startTime`、`endTime`、`hour`、`minute`、`second`、`dayPeriod`；`DateRangePickerValueSource` 放宽到含 `'time'`。
- 导出 `compareDateRangeEnds`、`dateRangePickerShowTime`、`dateRangePickerTimeGranularity`、`dateRangePickerDefaultTime`、`dateRangePickerJoinTimes` 与相应类型。
- 皮肤：`date-range-picker.css` 新增两组时间列（外壳、小标题、列、格与选中对号、禁用面）与确认钮的样式，连同强制色与手机档的补丁，去注释压空白后由 18033 字节涨到 29203 字节。
