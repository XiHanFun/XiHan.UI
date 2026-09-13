# Calendar 日历 <Badge type="info" text="alpha" />

以天、周、月、季度或年为周期浏览并选择，也可以在日期格中展示日程内容。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/calendar" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/calendar.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/calendar" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/calendar" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/calendar.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

选择日期

<XhDemo src="calendar/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="calendar"`：`root` · `header` · `prev-year-trigger` · `prev-trigger` · `next-trigger` · `next-year-trigger` · `heading` · `heading-year-trigger` · `heading-month-trigger` · **`grid`** · `grid-head` · `week-day` · `grid-body` · `week-row` · `week-number` · **`cell`** · **`cell-trigger`**

## 示例

### 区间选择

selection-mode=range：先落起点再落终点，也可以按住拖过去；两端都落定才写值，Escape 撤掉起点

<XhDemo src="calendar/02-range" />

### 不可选的日子

isDateUnavailable 与 min / max 都只挡落值不挡聚焦：方向键照样走得过去

<XhDemo src="calendar/03-unavailable" />

### 格子里放内容

cell-trigger 的内容全由作者写，日号之外还能塞自己的标记

<XhDemo src="calendar/04-cell-content" />

## 设计指引

### 何时使用

- 需要看见整段时间的分布：日程、排班、可预约情况。
- 需要在格子里显示当天的事件。

### 何时不用

- 只是录入一个日期：用[日期选择器](./date-picker)或[日期输入](./date-field)。

### 特性

- 标准结构由标题栏、前后翻页按钮、星期表头和日期网格组成；网格数据通过插槽作用域交给作者渲染。
- `granularity` 决定周期格的生成方式，`selectionMode` 独立决定单选、多选或区间；两个维度互不绑定。
- 五种粒度统一产出 `CalendarPeriod`：稳定键、周期首尾、标签与相邻容器标记都来自同一份数据。
- `week` 是一级粒度，使用一行一个整周的网格；不再通过日格高亮模拟整周选择。
- `isDateUnavailable` 与 `min` / `max` 都只挡落值不挡聚焦；粗粒度周期越过任一边界时整格不可选。
- 支持固定六行与显式多面板；单选和区间默认都保持单栏。
- 区间模式先落起点再落终点：起点只记在组件里，两端都落定才写值，Escape 撤掉起点后原来的区间原样还在；同一组件同时承载范围日历。
- 区间支持按住拖选：按下即落起点，拖到另一格松开即收尾；按住已选区间的一端拖动可以直接改写那一端；触屏按住片刻才开始拖，轻点仍是普通点选。
- 落了起点之后可挑的范围默认被夹在两侧最近的不可用日之间，`allowsNonContiguousRanges` 允许跨过它们；`isDateUnavailable` 的第二个参数是当前起点，可以据此限制区间长度。
- 已选区间的某一端越界或不可用即标记为不合法，也可以用 `invalid` 显式声明。
- 日期、月份与年份格按下时轻微缩放，松开后复原；减弱动效下自动收敛。
- 年份网格采用三列紧凑滚动面，可由作者按业务上下界铺入连续年份，复用日历格的选中与键盘语义。
- `calendarPeriodValue` 将单选或区间锚点转换为 `{ granularity, start, end, keys }`，可直接用于查询参数。
- 切换粒度会清空旧选择并保留浏览锚点，避免不同周期键之间发生隐式转换。
- 周首日、月份名与星期名跟着 `locale` 走：`en-US` 周日起、`zh-CN` 周一起。不给 `locale` 就跟宿主浏览器语言，读不到才落 `en-US`——要固定成一种排法就把 `locale` 显式传上去。

### 组合

- 格子里放[徽标](./badge)或一小段[排印](./typography)；外面套[卡片](./card)。

### 最佳实践

- 今天使用淡强调面，选中使用实心强调面，两种状态必须能同时辨认。
- 区间中段应保持连续淡色带，起止使用实心圆帽；挑到一半的预览与已落定的区间同一副长相，hover 预览不能盖出独立的普通悬停圆点。
- 周区间按整周格连续预览，月份、季度和年份区间共用同一套 Period 边界判断。
- 格子里的内容超出时收起来，别让某一行比别的行高很多。

### 反模式

- 不可选的日子连焦点都到不了：键盘用户无从知道那里有什么。
- 用它当日期输入框。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-calendar>` |
| Vue 组件 | `XhCalendarCell` `XhCalendarCellTrigger` `XhCalendarGrid` `XhCalendarGridBody` `XhCalendarGridHead` `XhCalendarHeader` `XhCalendarHeading` `XhCalendarHeadingMonthTrigger` `XhCalendarHeadingYearTrigger` `XhCalendarNextTrigger` `XhCalendarNextYearTrigger` `XhCalendarPrevTrigger` `XhCalendarPrevYearTrigger` `XhCalendarRoot` `XhCalendarWeekDay` `XhCalendarWeekNumber` `XhCalendarWeekRow` |
| 组合式函数 | `useCalendar` |
| 状态机 | `calendarMachine` |
| 皮肤 | `@xihan-ui/styles/calendar.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string \| string[]` |  | 选中值，ISO 串。给定即受控：cell 直读 prop，写只发 onValueChange 不落内部值。 单选写成裸串是简写，内部一律归一成数组。 |
| `defaultValue` | `string \| string[]` |  |  |
| `selectionMode` | `CalendarSelectionMode` |  |  |
| `focusedValue` | `string` |  | 当前聚焦的那天，ISO 串；它同时决定展示哪个月。给定即受控。 缺省时退回首个选中值，再退回今天。 |
| `defaultFocusedValue` | `string` |  |  |
| `min` | `string` |  | 可选范围下界（含当天），ISO 串。界外的日子转 aria-disabled，但仍可聚焦。 |
| `max` | `string` |  | 可选范围上界（含当天），ISO 串。 |
| `isDateUnavailable` | `(value: string, anchor: string \| null) => boolean` |  | 作者给的不可用判定，收 ISO 串。返回真的日子与界外日子同等对待。 第二个参数是区间挑到一半时的起点（周期首日的 ISO 串），其余时候为 null： 据此能做「落了起点之后只许挑 7 天内」这类判定。 |
| `allowsNonContiguousRanges` | `boolean` |  | 区间允许跨过不可用的日子，默认关。 关着时落了起点之后，可挑的范围被夹在起点两侧最近的不可用日之间—— 一段区间里不会夹着挑不了的日子；开着时不夹，只是那些日子不铺轨道。 |
| `invalid` | `boolean` |  | 校验失败：根节点带 data-invalid，区间两端与中段的格子报 aria-invalid。 |
| `locale` | `string` |  | 决定周首日与月份/星期几的文案，不给按宿主语言，宿主也没有时按 en-US。 |
| `timeZone` | `string` |  | 判定「今天」与格式化文案用的时区，默认取宿主本地时区。 |
| `disabled` | `boolean` |  | 整张日历禁用：翻月按钮转原生 disabled，格子全转 aria-disabled，键盘与点击都不改值。 |
| `readOnly` | `boolean` |  | 只读：翻月与移动焦点照常，只是选不动值。 |
| `weekdayFormat` | `CalendarWeekdayFormat` |  | 表头缩写粒度，默认 short。 |
| `fixedWeeks` | `boolean` |  | 恒渲染六行，默认按当月实际周数。开着能让翻月时网格高度不跳。 |
| `granularity` | `CalendarGranularity` |  | 选择粒度；与 selectionMode 正交。格子值一律是周期首日的 ISO 串。 |
| `activeView` | `CalendarView` |  | 面板此刻铺的是哪一档格子。给定即受控（date-picker 就是这么持有它的）。 它与 granularity 是两件事：granularity 是作者要挑的粒度，这个是人钻到了哪一层。 点标题里的年会把它抬到 year，再点一格就往 granularity 那一档钻回去；到了目标粒度， 点一格才是选中。缺省即等于 granularity。 |
| `defaultActiveView` | `CalendarView` |  | 非受控初值，缺省同 granularity。 |
| `visibleCount` | `number` |  | 并排展示几个连续月，默认 1。区间选择给 2 才好挑——起止常跨月， 一个面板要来回翻页。翻页时整窗一起走一个月，不是各翻各的。 小于 1 的写法回落到 1。 |
| `translations` | `Partial<CalendarTranslations>` |  |  |
| `onValueChange` | `(details: CalendarValueChangeDetails) => void` |  | value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |
| `onFocusedValueChange` | `(details: CalendarFocusChangeDetails) => void` |  | 聚焦日变化（方向键、翻页、点了邻月的日子都会发）；受控时是唯一出口。 |
| `onActiveViewChange` | `(details: CalendarViewChangeDetails) => void` |  | 面板钻到了哪一层（点标题钻上、点格子钻下都会发）；受控时是唯一出口。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `CalendarValueChangeDetails` | 选中集合变化；detail 为 `{ value: string[] }` |
| `focused-value-change` | `CalendarFocusChangeDetails` | 聚焦日变化；detail 为 `{ focusedValue: string }` |
| `active-view-change` | `CalendarViewChangeDetails` | 钻到了另一层；detail 为 `{ activeView: 'day'\|'week'\|'month'\|'quarter'\|'year' }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhCalendarRoot` | `default` | `CalendarRootSlotProps` |  |

### 状态

以下名称仅用于内部状态机。

**状态**：`idle` · `anchored`

**事件**：`VALUE.SET` · `CELL.SELECT` · `RANGE.ANCHOR` · `RANGE.COMMIT` · `DRAG.SET` · `FOCUS.SET` · `VIEW.SET` · `HOVER.SET` · `HOVER.CLEAR`

**判据**：`startsRange` · `anchorsRange`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

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
| `granularity` | `CalendarGranularity` | 作者要挑的粒度。 |
| `periods` | `CalendarPeriod[]` | 首个面板内的全部周期。 |
| `activeView` | `CalendarView` | 面板此刻铺的是哪一档格子。等于 granularity 时点一格就是选中，否则是往下钻。 |
| `headingOrder` | `readonly ('year' \| 'month')[]` | 标题里年与月在这个语言里的先后（zh-CN 是年在前，en-US 是月在前）。 手写标记时照它摆两个钮的顺序，标题读起来才顺。 |
| `canZoomOutYear` | `boolean` | 点标题里的年钻不钻得上去：年视图已到顶，钻不上去。 |
| `canZoomOutMonth` | `boolean` | 点标题里的月钻不钻得上去：只有日视图有月这一截。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` | 校验失败：作者标了 invalid，或已选区间的某一端落在界外 / 被判为不可用。 |
| `rangeAnchor` | `string \| null` | 区间挑到一半时的起点（周期首日的 ISO 串）；其余时候为 null。 |
| `dragging` | `boolean` | 指针正按在格子上拖着挑区间。 |
| `isSelected` | `(value: string) => boolean` | 单选与多选看选中集合；区间看两端之间（挑到一半时是起点到悬停 / 聚焦那一段）。 |
| `isUnavailable` | `(value: string) => boolean` | 界外或作者判定不可用。禁用的日历下恒为真。 区间挑到一半且不许跨过不可用日时，起点两侧最近的不可用日之外也算不可用。 |
| `canGoPrev` | `boolean` | 上一页是否还有可看的日子（整张禁用或整页都在 min 之前即为假）。 |
| `canGoNext` | `boolean` |  |
| `canGoPrevYear` | `boolean` | 大步翻此刻能不能按。判据同上，只是步长换成大步。 |
| `canGoNextYear` | `boolean` |  |
| `setValue` | `(next: string[]) => void` |  |
| `select` | `(value: string) => void` |  |
| `setRangeAnchor` | `(next: string \| null) => void` | 直接改写区间起点；传 null 撤掉挑到一半的区间。非区间模式下不起作用。 |
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

## 无障碍

### 键盘

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
| `Enter` / `Space` | focus in grid, 聚焦周期可用且非只读 | 选中聚焦周期：单选替换、多选切换、区间先落起点再落终点。落起点后焦点自动前进一格（挑不了就退一格），方向键走到哪儿预览就铺到哪儿。还没钻到 granularity 那一档时这一下是往下钻一层 |
| `Escape` | focus in grid, 区间已落起点 | 撤掉起点，原来的区间原样还在；不拦默认行为，外层浮层照常收起 |
| `Tab` / `Shift+Tab` | focus in grid, 区间已落起点 | 焦点离开前把区间收在起点到聚焦日之间；不拦默认行为，焦点照常离开 |

### ARIA

以下属性由 `connect` 生成。

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
| `cell-trigger` | `aria-description` | translations.finishRangeSelectionPrompt \| translations.startRangeSelectionPrompt \| undefined |
| `cell-trigger` | `aria-disabled` | 'true' \| 'false' |
| `cell-trigger` | `aria-invalid` | 'true' \| undefined |
| `cell-trigger` | `aria-label` | cellLabelFormatter.format(date.toDate(timeZone)) \| fallback?.label |
| `cell-trigger` | `role` | 'button' |

## 样式参考

### 皮肤

`@xihan-ui/styles/calendar.css` 使用 `[data-scope="calendar"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
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
| `grid` | `data-dragging` | ''（条件成立时才出现） |
| `grid` | `data-index` | panelOf(panel).index |
| `grid` | `data-readonly` | ''（条件成立时才出现） |
| `grid` | `data-view` | context.get('activeView') |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-calendar-cell-bg-hover` | `cell-trigger` | `background` | `disabled`<br>`hover`<br>`in-range`<br>`not([data-disabled], [data-selected], [data-in-range])`<br>`selected` | `--xh-bg-subtle-hover` | calendar 的 cell-trigger 部件 background 覆盖槽。 |
| `--xh-calendar-cell-bg-selected` | `cell-trigger` | `background` | `in-range`<br>`is([data-range-start], [data-range-end])`<br>`not([data-in-range])`<br>`range-end`<br>`range-start`<br>`selected` | `--xh-bg-brand` | calendar 的 cell-trigger 部件 background 覆盖槽。 |
| `--xh-calendar-cell-bg-selected-active` | `cell-trigger` | `background` | `active`<br>`disabled`<br>`in-range`<br>`is([data-range-start], [data-range-end])`<br>`not([data-disabled])`<br>`not([data-in-range], [data-disabled])`<br>`range-end`<br>`range-start`<br>`selected` | `--xh-bg-brand-hover` | calendar 的 cell-trigger 部件 background 覆盖槽。 |
| `--xh-calendar-cell-fg` | `cell-trigger` | `color` | `@media print`<br>`default`<br>`in-range`<br>`is([data-range-start], [data-range-end])`<br>`not([data-in-range])`<br>`range-end`<br>`range-start`<br>`selected` | `--xh-fg-default` | calendar 的 cell-trigger 部件 color 覆盖槽。 |
| `--xh-calendar-cell-fg-outside` | `cell-trigger` | `color` | `outside-month` | `--xh-fg-subtle` | calendar 的 cell-trigger 部件 color 覆盖槽。 |
| `--xh-calendar-cell-fg-selected` | `cell-trigger` | `color` | `in-range`<br>`is([data-range-start], [data-range-end])`<br>`not([data-in-range])`<br>`range-end`<br>`range-start`<br>`selected` | `--xh-fg-on-brand` | calendar 的 cell-trigger 部件 color 覆盖槽。 |
| `--xh-calendar-cell-font-size` | `cell-trigger` | `font-size` | `default` | `--xh-text-body-size` | calendar 的 cell-trigger 部件 font-size 覆盖槽。 |
| `--xh-calendar-cell-font-weight` | `cell-trigger` | `font-weight` | `default` | `--xh-font-weight-medium` | calendar 的 cell-trigger 部件 font-weight 覆盖槽。 |
| `--xh-calendar-cell-gap` | `cell`<br>`cell-trigger` | `inset`<br>`inset-block`<br>`padding` | `default`<br>`in-range` | `--xh-space-0_5` | calendar 的 cell、cell-trigger 部件 inset、inset-block、padding 覆盖槽。 |
| `--xh-calendar-cell-radius` | `cell`<br>`cell-trigger`<br>`grid` | `border-radius` | `default`<br>`in-range`<br>`is([data-view='week'], [data-view='month'], [data-view='quarter'], [data-view='year'])`<br>`view=month`<br>`view=quarter`<br>`view=week`<br>`view=year` | `--xh-shape-pill` | calendar 的 cell、cell-trigger、grid 部件 border-radius 覆盖槽。 |
| `--xh-calendar-cell-size` | `cell-trigger` | `min-inline-size` | `default` | `--xh-control-h-sm` | calendar 的 cell-trigger 部件 min-inline-size 覆盖槽。 |
| `--xh-calendar-gap` | `root` | `gap` | `default` | `--xh-space-2` | calendar 的 root 部件 gap 覆盖槽。 |
| `--xh-calendar-grid-gap` | `grid` | `gap` | `default` | `--xh-space-1` | calendar 的 grid 部件 gap 覆盖槽。 |
| `--xh-calendar-header-gap` | `header` | `gap` | `default` | `--xh-space-2` | calendar 的 header 部件 gap 覆盖槽。 |
| `--xh-calendar-heading-fg` | `heading`<br>`heading-month-trigger`<br>`heading-year-trigger` | `color` | `default`<br>`not([hidden])` | `--xh-fg-default` | calendar 的 heading、heading-month-trigger、heading-year-trigger 部件 color 覆盖槽。 |
| `--xh-calendar-heading-font-size` | `heading`<br>`heading-month-trigger`<br>`heading-year-trigger` | `font-size` | `default`<br>`not([hidden])` | `--xh-text-label-size` | calendar 的 heading、heading-month-trigger、heading-year-trigger 部件 font-size 覆盖槽。 |
| `--xh-calendar-heading-font-weight` | `heading`<br>`heading-month-trigger`<br>`heading-year-trigger` | `font-weight` | `default`<br>`not([hidden])` | `--xh-font-weight-semibold` | calendar 的 heading、heading-month-trigger、heading-year-trigger 部件 font-weight 覆盖槽。 |
| `--xh-calendar-heading-trigger-fg-hover` | `heading-month-trigger`<br>`heading-year-trigger` | `color` | `hover`<br>`not(:disabled)` | `--xh-fg-brand` | calendar 的 heading-month-trigger、heading-year-trigger 部件 color 覆盖槽。 |
| `--xh-calendar-heading-trigger-px` | `heading-month-trigger`<br>`heading-year-trigger` | `padding-inline` | `not([hidden])` | `--xh-space-1` | calendar 的 heading-month-trigger、heading-year-trigger 部件 padding-inline 覆盖槽。 |
| `--xh-calendar-heading-trigger-radius` | `heading-month-trigger`<br>`heading-year-trigger` | `border-radius` | `not([hidden])` | `--xh-shape-control` | calendar 的 heading-month-trigger、heading-year-trigger 部件 border-radius 覆盖槽。 |
| `--xh-calendar-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-glyph-size-text` | calendar 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-calendar-nav-bg` | `next-trigger`<br>`next-year-trigger`<br>`prev-trigger`<br>`prev-year-trigger` | `background` | `default` | `transparent` | calendar 的 next-trigger、next-year-trigger、prev-trigger、prev-year-trigger 部件 background 覆盖槽。 |
| `--xh-calendar-nav-bg-hover` | `next-trigger`<br>`next-year-trigger`<br>`prev-trigger`<br>`prev-year-trigger` | `background` | `hover`<br>`not(:disabled)` | `--xh-bg-subtle-hover` | calendar 的 next-trigger、next-year-trigger、prev-trigger、prev-year-trigger 部件 background 覆盖槽。 |
| `--xh-calendar-nav-fg` | `next-trigger`<br>`next-year-trigger`<br>`prev-trigger`<br>`prev-year-trigger` | `color` | `default` | `--xh-fg-muted` | calendar 的 next-trigger、next-year-trigger、prev-trigger、prev-year-trigger 部件 color 覆盖槽。 |
| `--xh-calendar-nav-fg-hover` | `next-trigger`<br>`next-year-trigger`<br>`prev-trigger`<br>`prev-year-trigger` | `color` | `hover`<br>`not(:disabled)` | `--xh-fg-default` | calendar 的 next-trigger、next-year-trigger、prev-trigger、prev-year-trigger 部件 color 覆盖槽。 |
| `--xh-calendar-nav-radius` | `next-trigger`<br>`next-year-trigger`<br>`prev-trigger`<br>`prev-year-trigger` | `border-radius` | `default` | `--xh-shape-control` | calendar 的 next-trigger、next-year-trigger、prev-trigger、prev-year-trigger 部件 border-radius 覆盖槽。 |
| `--xh-calendar-nav-size` | `next-trigger`<br>`next-year-trigger`<br>`prev-trigger`<br>`prev-year-trigger` | `block-size`<br>`inline-size` | `default` | `--xh-control-h-sm` | calendar 的 next-trigger、next-year-trigger、prev-trigger、prev-year-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-calendar-period-gap` | `grid` | `gap` | `view=month`<br>`view=quarter`<br>`view=week`<br>`view=year` | `--xh-space-1` | calendar 的 grid 部件 gap 覆盖槽。 |
| `--xh-calendar-period-py` | `cell-trigger`<br>`grid` | `padding-block` | `is([data-view='week'], [data-view='month'], [data-view='quarter'], [data-view='year'])`<br>`view=month`<br>`view=quarter`<br>`view=week`<br>`view=year` | `--xh-space-2` | calendar 的 cell-trigger、grid 部件 padding-block 覆盖槽。 |
| `--xh-calendar-period-radius` | `cell-trigger`<br>`grid` | `border-radius` | `is([data-view='week'], [data-view='month'], [data-view='quarter'], [data-view='year'])`<br>`view=month`<br>`view=quarter`<br>`view=week`<br>`view=year` | `--xh-shape-control` | calendar 的 cell-trigger、grid 部件 border-radius 覆盖槽。 |
| `--xh-calendar-range-bg` | `cell` | `background` | `in-range` | `--xh-bg-brand-subtle` | calendar 的 cell 部件 background 覆盖槽。 |
| `--xh-calendar-range-cap-radius` | `cell` | `border-end-end-radius`<br>`border-end-start-radius`<br>`border-start-end-radius`<br>`border-start-start-radius` | `in-range`<br>`range-end`<br>`range-start` | `--xh-shape-pill` | calendar 的 cell 部件 border-end-end-radius、border-end-start-radius、border-start-end-radius、border-start-start-radius 覆盖槽。 |
| `--xh-calendar-range-row-radius` | `cell`<br>`week-number`<br>`week-row` | `border-end-end-radius`<br>`border-end-start-radius`<br>`border-start-end-radius`<br>`border-start-start-radius` | `first-child`<br>`in-range`<br>`last-child` | `--xh-shape-control` | calendar 的 cell、week-number、week-row 部件 border-end-end-radius、border-end-start-radius、border-start-end-radius、border-start-start-radius 覆盖槽。 |
| `--xh-calendar-row-gap` | `grid-body`<br>`grid-head` | `gap` | `default` | `--xh-space-0` | calendar 的 grid-body、grid-head 部件 gap 覆盖槽。 |
| `--xh-calendar-today-bg` | `cell-trigger` | `background` | `today` | `--xh-bg-brand-subtle` | calendar 的 cell-trigger 部件 background 覆盖槽。 |
| `--xh-calendar-today-bg-hover` | `cell-trigger` | `background` | `disabled`<br>`hover`<br>`in-range`<br>`not([data-selected], [data-disabled], [data-in-range])`<br>`selected`<br>`today` | `--xh-bg-brand-subtle-hover` | calendar 的 cell-trigger 部件 background 覆盖槽。 |
| `--xh-calendar-today-border` | `cell-trigger` | `border-color` | `today` | `transparent` | calendar 的 cell-trigger 部件 border-color 覆盖槽。 |
| `--xh-calendar-today-fg` | `cell-trigger` | `color` | `today` | `--xh-fg-brand` | calendar 的 cell-trigger 部件 color 覆盖槽。 |
| `--xh-calendar-week-cell-px` | `cell-trigger`<br>`grid` | `padding-inline` | `view=week` | `--xh-space-3` | calendar 的 cell-trigger、grid 部件 padding-inline 覆盖槽。 |
| `--xh-calendar-week-day-fg` | `week-day` | `color` | `default` | `--xh-fg-subtle` | calendar 的 week-day 部件 color 覆盖槽。 |
| `--xh-calendar-week-day-font-size` | `week-day` | `font-size` | `default` | `--xh-text-caption-size` | calendar 的 week-day 部件 font-size 覆盖槽。 |
| `--xh-calendar-week-day-font-weight` | `week-day` | `font-weight` | `default` | `--xh-font-weight-medium` | calendar 的 week-day 部件 font-weight 覆盖槽。 |
| `--xh-calendar-week-day-h` | `week-day` | `block-size` | `default` | `--xh-control-h-sm` | calendar 的 week-day 部件 block-size 覆盖槽。 |
| `--xh-calendar-week-number-fg` | `week-number` | `color` | `default` | `--xh-fg-subtle` | calendar 的 week-number 部件 color 覆盖槽。 |
| `--xh-calendar-week-number-font-size` | `week-number` | `font-size` | `default` | `--xh-text-caption-size` | calendar 的 week-number 部件 font-size 覆盖槽。 |
| `--xh-calendar-week-number-w` | `week-number`<br>`week-row` | `grid-template-columns` | `has(> [data-part='week-number'])`<br>`not([hidden])` | `2.25rem` | calendar 的 week-number、week-row 部件 grid-template-columns 覆盖槽。 |
| `--xh-calendar-year-grid-max-h` | `grid` | `max-block-size` | `view=year` | `--xh-viewport-h-sm` | calendar 的 grid 部件 max-block-size 覆盖槽。 |
| `--xh-calendar-year-grid-pe` | `grid` | `padding-inline-end` | `view=year` | `--xh-space-1` | calendar 的 grid 部件 padding-inline-end 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`background` · `color` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。
