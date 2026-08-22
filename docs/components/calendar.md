# 日历 <Badge type="info" text="calendar" />

一整月（或周 / 月 / 季 / 年）的网格，格子里可以放内容。

## 何时使用

- 需要看见整段时间的分布：日程、排班、可预约情况。
- 需要在格子里显示当天的事件。

## 何时不用

- 只是录入一个日期：用[日期选择器](./date-picker)或[日期输入](./date-field)。

## 特性

- 星期名由作者自己渲染，组件一个节点都不替你生成。
- `isDateUnavailable` 与 `min` / `max` 都只挡落值不挡聚焦——键盘用户仍能走到不可选的日子上，读屏会念出它不可选。
- 支持区间选择、整周选择、固定六行与多月并排。
- 周首日、月份名与星期名跟着 `locale` 走：`en-US` 周日起、`zh-CN` 周一起。不给 `locale` 就跟宿主浏览器语言，读不到才落 `en-US`——要固定成一种排法就把 `locale` 显式传上去。

## 示例

### 基础用法

网格由作者照 weeks / weekDays 自己渲染，组件一个节点都不替你生成

<XhDemo src="calendar/01-basic" />

### 区间选择

selection-mode=range：第一下落起点、第二下落终点，中间铺一条连续底色

<XhDemo src="calendar/02-range" />

### 不可选的日子

isDateUnavailable 与 min / max 都只挡落值不挡聚焦：方向键照样走得过去

<XhDemo src="calendar/03-unavailable" />

### 格子里放内容

cell-trigger 的内容全由作者写，日号之外还能塞自己的标记

<XhDemo src="calendar/04-cell-content" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-calendar>` |
| Vue 组件 | `XhCalendarCell` `XhCalendarCellTrigger` `XhCalendarGrid` `XhCalendarGridBody` `XhCalendarGridHead` `XhCalendarHeader` `XhCalendarHeading` `XhCalendarHeadingMonthTrigger` `XhCalendarHeadingYearTrigger` `XhCalendarNextTrigger` `XhCalendarNextYearTrigger` `XhCalendarPrevTrigger` `XhCalendarPrevYearTrigger` `XhCalendarRoot` `XhCalendarWeekDay` `XhCalendarWeekNumber` `XhCalendarWeekRow` |
| 组合式函数 | `useCalendar` |
| 状态机 | `calendarMachine` |
| 皮肤 | `@xihan-ui/styles/calendar.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="calendar"`：`root` · `header` · `prev-year-trigger` · `prev-trigger` · `next-trigger` · `next-year-trigger` · `heading` · `heading-year-trigger` · `heading-month-trigger` · **`grid`** · `grid-head` · `week-day` · `grid-body` · `week-row` · `week-number` · **`cell`** · **`cell-trigger`**

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string \| string[]` |  | 选中值，ISO 串。给定即受控：cell 直读 prop，写只发 onValueChange 不落内部值。 单选写成裸串是简写，内部一律归一成数组。 |
| `defaultValue` | `string \| string[]` |  |  |
| `selectionMode` | `CalendarSelectionMode` |  |  |
| `focusedValue` | `string` |  | 当前聚焦的那天，ISO 串；它同时决定展示哪个月。给定即受控。 缺省时退回首个选中值，再退回今天。 |
| `defaultFocusedValue` | `string` |  |  |
| `min` | `string` |  | 可选范围下界（含当天），ISO 串。界外的日子转 aria-disabled，但仍可聚焦。 |
| `max` | `string` |  | 可选范围上界（含当天），ISO 串。 |
| `isDateUnavailable` | `(value: string) => boolean` |  | 作者给的不可用判定，收 ISO 串。返回真的日子与界外日子同等对待。 |
| `locale` | `string` |  | 决定周首日与月份/星期几的文案，不给按宿主语言，宿主也没有时按 en-US。 |
| `timeZone` | `string` |  | 判定「今天」与格式化文案用的时区，默认取宿主本地时区。 |
| `disabled` | `boolean` |  | 整张日历禁用：翻月按钮转原生 disabled，格子全转 aria-disabled，键盘与点击都不改值。 |
| `readOnly` | `boolean` |  | 只读：翻月与移动焦点照常，只是选不动值。 |
| `weekdayFormat` | `CalendarWeekdayFormat` |  | 表头缩写粒度，默认 short。 |
| `fixedWeeks` | `boolean` |  | 恒渲染六行，默认按当月实际周数。开着能让翻月时网格高度不跳。 |
| `view` | `CalendarView` |  | 挑的粒度：天（默认）、月、季度、年。这一档也是「点一格就是选中」的那一档。 格子的值一律是「那段时间的第一天」的 ISO 串，不另立一套值形态—— min/max 比较、区间逻辑、不可用判定、表单出口于是全都原样复用。 |
| `activeView` | `CalendarView` |  | 面板此刻铺的是哪一档格子。给定即受控（date-picker 就是这么持有它的）。 它与 view 是两件事：view 是作者要挑的粒度，这个是人钻到了哪一层。 点标题里的年会把它抬到 year，再点一格就往 view 那一档钻回去；到了 view 那一档， 点一格才是选中。缺省即等于 view。 |
| `defaultActiveView` | `CalendarView` |  | 非受控初值，缺省同 view。 |
| `weekSelection` | `boolean` |  | 周选：点任意一天选中它所在的整周，值落成 [周首日, 周末日]。 只在 view=day 且 selectionMode=range 下生效。 |
| `visibleCount` | `number` |  | 并排展示几个连续月，默认 1。区间选择给 2 才好挑——起止常跨月， 一个面板要来回翻页。翻页时整窗一起走一个月，不是各翻各的。 小于 1 的写法回落到 1。 |
| `onValueChange` | `(details: CalendarValueChangeDetails) => void` |  | value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |
| `onFocusedValueChange` | `(details: CalendarFocusChangeDetails) => void` |  | 聚焦日变化（方向键、翻页、点了邻月的日子都会发）；受控时是唯一出口。 |
| `onActiveViewChange` | `(details: CalendarViewChangeDetails) => void` |  | 面板钻到了哪一层（点标题钻上、点格子钻下都会发）；受控时是唯一出口。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `CalendarValueChangeDetails` | 选中集合变化；detail 为 `{ value: string[] }` |
| `focused-value-change` | `CalendarFocusChangeDetails` | 聚焦日变化；detail 为 `{ focusedValue: string }` |
| `active-view-change` | `CalendarViewChangeDetails` | 钻到了另一层；detail 为 `{ activeView: 'day'\|'month'\|'quarter'\|'year' }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhCalendarRoot` | `default` | `CalendarRootSlotProps` |  |

## 状态

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle`

**事件**：`VALUE.SET` · `CELL.SELECT` · `FOCUS.SET` · `VIEW.SET` · `HOVER.SET` · `HOVER.CLEAR`

## connect API

`useCalendar` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string[]` | 选中集合，ISO 串；形状不随模式变。 |
| `selectionMode` | `CalendarSelectionMode` |  |
| `focusedValue` | `string` | 生效的聚焦日（三路收口后的结果），恒非空。 |
| `panels` | `CalendarPanel[]` | 并排展示的面板，长度即 visibleCount。作者照它渲染几张网格。 |
| `visibleMonth` | `{ year: number, month: number, startValue: string }` | 首个面板的展示月：年、月（1-12）、月首日 ISO。多面板时是最左那个。 |
| `weeks` | `CalendarDay[][]` | 首个面板的日期矩阵。多面板请改用 panels。 |
| `weekDays` | `CalendarWeekDay[]` | 七列表头，作者照它渲染 week-day。 |
| `headingLabel` | `string` | 首个面板的标题文案（如 2024年2月）。多面板请改用 panels。 |
| `view` | `CalendarView` | 作者要挑的粒度。 |
| `activeView` | `CalendarView` | 面板此刻铺的是哪一档格子。等于 view 时点一格就是选中，粗过 view 时点一格是往下钻。 |
| `headingOrder` | `readonly ('year' \| 'month')[]` | 标题里年与月在这个语言里的先后（zh-CN 是年在前，en-US 是月在前）。 手写标记时照它摆两个钮的顺序，标题读起来才顺。 |
| `canZoomOutYear` | `boolean` | 点标题里的年钻不钻得上去：年视图已到顶，钻不上去。 |
| `canZoomOutMonth` | `boolean` | 点标题里的月钻不钻得上去：只有日视图有月这一截。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `isSelected` | `(value: string) => boolean` |  |
| `isUnavailable` | `(value: string) => boolean` | 界外或作者判定不可用。禁用的日历下恒为真。 |
| `canGoPrev` | `boolean` | 上一页是否还有可看的日子（整张禁用或整页都在 min 之前即为假）。 |
| `canGoNext` | `boolean` |  |
| `canGoPrevYear` | `boolean` | 大步翻（« / »）此刻能不能按。判据同上，只是步长换成大步。 |
| `canGoNextYear` | `boolean` |  |
| `setValue` | `(next: string[]) => void` |  |
| `select` | `(value: string) => void` |  |
| `focus` | `(value: string) => void` | 改写聚焦日；跨月会连带换掉展示月。 |
| `setActiveView` | `(next: CalendarView) => void` | 直接钻到某一层。 |
| `goToPrevMonth` | `() => void` |  |
| `goToNextMonth` | `() => void` |  |
| `goToPrevYear` | `() => void` | 大步翻：日视图走一年，月/季度走十年，年视图走一百年。 |
| `goToNextYear` | `() => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getHeaderProps` | `() => T['element']` |  |
| `getPrevYearTriggerProps` | `() => T['button']` |  |
| `getPrevTriggerProps` | `() => T['button']` |  |
| `getNextTriggerProps` | `() => T['button']` |  |
| `getNextYearTriggerProps` | `() => T['button']` |  |
| `getHeadingProps` | `(props?: CalendarPanelProps) => T['element']` |  |
| `getHeadingYearTriggerProps` | `(props?: CalendarPanelProps) => T['button']` | 标题里年那一截，点它钻到十年格。年视图下已到顶，转原生 disabled。 |
| `getHeadingMonthTriggerProps` | `(props?: CalendarPanelProps) => T['button']` | 标题里月那一截，点它钻到月格。不在日视图时带 hidden（那一层没有月这一截）。 |
| `getGridProps` | `(props?: CalendarPanelProps) => T['element']` |  |
| `getGridHeadProps` | `() => T['element']` |  |
| `getWeekDayProps` | `(props: CalendarWeekDayProps) => T['element']` |  |
| `getGridBodyProps` | `() => T['element']` |  |
| `getWeekRowProps` | `() => T['element']` |  |
| `getWeekNumberProps` | `(props: CalendarWeekNumberProps) => T['element']` | 周序号格：行首那一列，语义上是这一行的表头（role=rowheader）。 |
| `getWeekNumberText` | `(props: CalendarWeekNumberProps) => string` | 这一行该显示的周序号文字。两个适配器都拿它填文本，保证同构。 |
| `getCellProps` | `(props: CalendarCellProps) => T['element']` |  |
| `getCellTriggerProps` | `(props: CalendarCellProps) => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/#kbd_label)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | focus outside the grid | 整张网格只占一个 Tab 位：焦点进入聚焦日那一格 |
| `ArrowLeft` | focus in grid | 焦点前移一天；越过月首即翻到上一月并落在那一天。粗粒度视图里走一格（一个月 / 一季 / 一年） |
| `ArrowRight` | focus in grid | 焦点后移一天；越过月末即翻到下一月并落在那一天。粗粒度视图里走一格 |
| `ArrowUp` | focus in grid | 焦点上移一周（减七天），跨月照样翻页。粗粒度视图里上移一行 |
| `ArrowDown` | focus in grid | 焦点下移一周（加七天），跨月照样翻页。粗粒度视图里下移一行 |
| `Home` | focus in grid | 焦点移到本周第一天；周首日随 locale 变。粗粒度视图里移到本行头一格 |
| `End` | focus in grid | 焦点移到本周最后一天。粗粒度视图里移到本行末一格 |
| `PageUp` | focus in grid | 退一个月，日号不变（月末日被目标月夹住：3 月 31 日退成 2 月 29 日）。粗粒度视图里退一整页 |
| `PageDown` | focus in grid | 进一个月，日号不变。粗粒度视图里进一整页 |
| `Shift+PageUp` | focus in grid | 退一年；粗粒度视图里退十页 |
| `Shift+PageDown` | focus in grid | 进一年；粗粒度视图里进十页 |
| `Enter` / `Space` | focus in grid, 聚焦日可用且非只读 | 选中聚焦日：单选替换、多选切换、区间先落起点再落终点。还没钻到 view 那一档时这一下是往下钻一层 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `grid` | `aria-disabled` | 'true' \| 'false' |
| `grid` | `aria-labelledby` | `heading` 部件的 id |
| `grid` | `aria-multiselectable` | 'false' \| 'true' |
| `grid` | `aria-readonly` | 'true' \| 'false' |
| `grid` | `role` | 'grid' |
| `grid-head` | `role` | 'rowgroup' |
| `week-day` | `aria-label` | meta?.long |
| `week-day` | `role` | 'columnheader' |
| `grid-body` | `role` | 'rowgroup' |
| `week-row` | `role` | 'row' |
| `week-number` | `aria-hidden` | 'true' |
| `week-number` | `role` | 'rowheader' |
| `cell` | `aria-selected` | 'true' \| 'false' |
| `cell` | `role` | 'gridcell' |
| `cell-trigger` | `aria-disabled` | 'true' \| 'false' |
| `cell-trigger` | `aria-label` | cellLabelFormatter.format(state.date.toDate(timeZone)) \| undefined |
| `cell-trigger` | `role` | 'button' |

## 样式

默认皮肤 `@xihan-ui/styles/calendar.css` 按部件选择：`[data-scope="calendar"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `prev-year-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `prev-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `next-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `next-year-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `heading` | `data-index` | panelOf(panel).index |
| `heading` | `data-view` | context.get('activeView') |
| `heading-year-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `heading-year-trigger` | `data-index` | panelOf(panel).index |
| `heading-year-trigger` | `data-view` | context.get('activeView') |
| `heading-month-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `heading-month-trigger` | `data-index` | panelOf(panel).index |
| `heading-month-trigger` | `data-view` | context.get('activeView') |
| `grid` | `data-disabled` | ''（条件成立时才出现） |
| `grid` | `data-index` | panelOf(panel).index |
| `grid` | `data-readonly` | ''（条件成立时才出现） |
| `grid` | `data-view` | context.get('activeView') |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-calendar-cell-bg-hover` · `--xh-calendar-cell-bg-selected` · `--xh-calendar-cell-fg` · `--xh-calendar-cell-fg-outside` · `--xh-calendar-cell-fg-selected` · `--xh-calendar-cell-font-size` · `--xh-calendar-cell-gap` · `--xh-calendar-cell-radius` · `--xh-calendar-cell-size` · `--xh-calendar-gap` · `--xh-calendar-grid-gap` · `--xh-calendar-header-gap` · `--xh-calendar-heading-fg` · `--xh-calendar-heading-font-size` · `--xh-calendar-heading-font-weight` · `--xh-calendar-heading-trigger-fg-hover` · `--xh-calendar-heading-trigger-px` · `--xh-calendar-heading-trigger-radius` · `--xh-calendar-icon-size` · `--xh-calendar-nav-bg` · `--xh-calendar-nav-bg-hover` · `--xh-calendar-nav-fg` · `--xh-calendar-nav-radius` · `--xh-calendar-nav-size` · `--xh-calendar-period-gap` · `--xh-calendar-period-py` · `--xh-calendar-range-bg` · `--xh-calendar-row-gap` · `--xh-calendar-today-border` · `--xh-calendar-week-day-fg` · `--xh-calendar-week-day-font-size` · `--xh-calendar-week-day-font-weight` · `--xh-calendar-week-day-h` · `--xh-calendar-week-number-fg` · `--xh-calendar-week-number-font-size` · `--xh-calendar-week-number-w`

## 动效

状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 格子里放[徽标](./badge)或一小段[排印](./typography)；外面套[卡片](./card)。

## 最佳实践

- 今天要有明显标记，且与"选中"区分开。
- 格子里的内容超出时收起来，别让某一行比别的行高很多。

## 反模式

- 不可选的日子连焦点都到不了：键盘用户无从知道那里有什么。
- 用它当日期输入框。
