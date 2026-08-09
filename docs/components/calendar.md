# 日历 <Badge type="info" text="calendar" />

数据录入组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-calendar>` |
| Vue 组件 | `XhCalendarCell` `XhCalendarCellTrigger` `XhCalendarGrid` `XhCalendarGridBody` `XhCalendarGridHead` `XhCalendarHeader` `XhCalendarHeading` `XhCalendarNextTrigger` `XhCalendarPrevTrigger` `XhCalendarRoot` `XhCalendarWeekDay` `XhCalendarWeekRow` |
| 组合式函数 | `useCalendar` |
| 状态机 | `calendarMachine` |
| 皮肤 | `@xihan-ui/styled/calendar.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="calendar"`：`root` · `header` · `prev-trigger` · `next-trigger` · `heading` · **`grid`** · `grid-head` · `week-day` · `grid-body` · `week-row` · **`cell`** · **`cell-trigger`**

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string | string[]` |  | 选中值，ISO 串。给定即受控：cell 直读 prop，写只发 onValueChange 不落内部值。 单选写成裸串是简写，内部一律归一成数组。 |
| `defaultValue` | `string | string[]` |  |  |
| `selectionMode` | `CalendarSelectionMode` |  |  |
| `focusedValue` | `string` |  | 当前聚焦的那天，ISO 串；它同时决定展示哪个月。给定即受控。 缺省时退回首个选中值，再退回今天。 |
| `defaultFocusedValue` | `string` |  |  |
| `min` | `string` |  | 可选范围下界（含当天），ISO 串。界外的日子转 aria-disabled，但仍可聚焦。 |
| `max` | `string` |  | 可选范围上界（含当天），ISO 串。 |
| `isDateUnavailable` | `(value: string) => boolean` |  | 作者给的不可用判定，收 ISO 串。返回真的日子与界外日子同等对待。 |
| `locale` | `string` |  | 决定周首日与月份/星期几的文案，默认 zh-CN。 |
| `timeZone` | `string` |  | 判定「今天」与格式化文案用的时区，默认取宿主本地时区。 |
| `disabled` | `boolean` |  | 整张日历禁用：翻月按钮转原生 disabled，格子全转 aria-disabled，键盘与点击都不改值。 |
| `readOnly` | `boolean` |  | 只读：翻月与移动焦点照常，只是选不动值。 |
| `weekdayFormat` | `CalendarWeekdayFormat` |  | 表头缩写粒度，默认 short。 |
| `fixedWeeks` | `boolean` |  | 恒渲染六行，默认按当月实际周数。开着能让翻月时网格高度不跳。 |
| `onValueChange` | `(details: CalendarValueChangeDetails) => void` |  | value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |
| `onFocusedValueChange` | `(details: CalendarFocusChangeDetails) => void` |  | 聚焦日变化（方向键、翻页、点了邻月的日子都会发）；受控时是唯一出口。 |

## 状态机

**状态**：`idle`

**事件**：`VALUE.SET` · `CELL.SELECT` · `FOCUS.SET` · `HOVER.SET` · `HOVER.CLEAR`

## connect API

`useCalendar` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string[]` | 选中集合，ISO 串；形状不随模式变。 |
| `selectionMode` | `CalendarSelectionMode` |  |
| `focusedValue` | `string` | 生效的聚焦日（三路收口后的结果），恒非空。 |
| `visibleMonth` | `{ year: number, month: number, startValue: string }` | 展示月：年、月（1-12）、月首日 ISO。 |
| `weeks` | `CalendarDay[][]` | 日期矩阵，作者照它渲染 week-row / cell / cell-trigger。 |
| `weekDays` | `CalendarWeekDay[]` | 七列表头，作者照它渲染 week-day。 |
| `headingLabel` | `string` | 展示月的标题文案（如 2024年2月），作者写进 heading 部件。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `isSelected` | `(value: string) => boolean` |  |
| `isUnavailable` | `(value: string) => boolean` | 界外或作者判定不可用。禁用的日历下恒为真。 |
| `canGoPrev` | `boolean` | 上一月是否还有可看的日子（整张禁用或整月都在 min 之前即为假）。 |
| `canGoNext` | `boolean` |  |
| `setValue` | `(next: string[]) => void` |  |
| `select` | `(value: string) => void` |  |
| `focus` | `(value: string) => void` | 改写聚焦日；跨月会连带换掉展示月。 |
| `goToPrevMonth` | `() => void` |  |
| `goToNextMonth` | `() => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getHeaderProps` | `() => T['element']` |  |
| `getPrevTriggerProps` | `() => T['button']` |  |
| `getNextTriggerProps` | `() => T['button']` |  |
| `getHeadingProps` | `() => T['element']` |  |
| `getGridProps` | `() => T['element']` |  |
| `getGridHeadProps` | `() => T['element']` |  |
| `getWeekDayProps` | `(props: CalendarWeekDayProps) => T['element']` |  |
| `getGridBodyProps` | `() => T['element']` |  |
| `getWeekRowProps` | `() => T['element']` |  |
| `getCellProps` | `(props: CalendarCellProps) => T['element']` |  |
| `getCellTriggerProps` | `(props: CalendarCellProps) => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/#kbd_label)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | focus outside the grid | 整张网格只占一个 Tab 位：焦点进入聚焦日那一格 |
| `ArrowLeft` | focus in grid | 焦点前移一天；越过月首即翻到上一月并落在那一天 |
| `ArrowRight` | focus in grid | 焦点后移一天；越过月末即翻到下一月并落在那一天 |
| `ArrowUp` | focus in grid | 焦点上移一周（减七天），跨月照样翻页 |
| `ArrowDown` | focus in grid | 焦点下移一周（加七天），跨月照样翻页 |
| `Home` | focus in grid | 焦点移到本周第一天；周首日随 locale 变 |
| `End` | focus in grid | 焦点移到本周最后一天 |
| `PageUp` | focus in grid | 退一个月，日号不变（月末日被目标月夹住：3 月 31 日退成 2 月 29 日） |
| `PageDown` | focus in grid | 进一个月，日号不变 |
| `Shift+PageUp` | focus in grid | 退一年 |
| `Shift+PageDown` | focus in grid | 进一年 |
| `Enter` / `Space` | focus in grid, 聚焦日可用且非只读 | 选中聚焦日：单选替换、多选切换、区间先落起点再落终点 |
