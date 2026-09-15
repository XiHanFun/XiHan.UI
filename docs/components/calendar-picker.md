# CalendarPicker 日历选择器 <Badge type="info" text="alpha" />

以天、周、月、季度或年为周期浏览并选择一个或多个日期，也可以在日期格中展示日程内容。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/calendar-picker" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/calendar-picker.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/calendar-picker" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/calendar-picker" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/calendar-picker.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

选择日期

<XhDemo src="calendar-picker/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="calendar-picker"`：`root` · `header` · `prev-year-trigger` · `prev-trigger` · `next-trigger` · `next-year-trigger` · `heading` · `heading-year-trigger` · `heading-month-trigger` · **`grid`** · `grid-head` · `week-day` · `grid-body` · `week-row` · `week-number` · **`cell`** · **`cell-trigger`**

## 示例

### 多选

selection-mode=multiple：点击一次加入，再点击一次移除，集合按日期升序

<XhDemo src="calendar-picker/02-multiple" />

### 不可选的日期

isDateUnavailable 与 min / max 都只阻止落值不阻止聚焦：方向键照常可以经过

<XhDemo src="calendar-picker/03-unavailable" />

### 格子内放置内容

cell-trigger 的内容全部由作者编写，日号之外还可放置自己的标记

<XhDemo src="calendar-picker/04-cell-content" />

## 设计指引

### 何时使用

- 需要先看到整段时间的分布再选择日期：日程、排班、可预约情况。
- 需要在格子中显示当天的事件。
- 需要一次选择多个不连续的日期。

### 何时不用

- 只录入一个日期时，使用[日期选择器](./date-picker)或[日期字段](./date-field)。
- 选择一段连续的起止时，使用[日历范围选择器](./calendar-range-picker)。

### 特性

- 标准结构由标题栏、前后翻页按钮、星期表头和日期网格组成；网格数据通过插槽作用域交给作者渲染。
- `granularity` 决定周期格的生成方式，`selectionMode` 独立决定单选或多选；两个维度互不绑定。
- 五种粒度统一产出 `CalendarPeriod`：稳定键、周期首尾、标签与相邻容器标记都来自同一份数据。
- `week` 是一级粒度，使用一行一个整周的网格；不通过日格高亮模拟整周选择。
- `isDateUnavailable` 与 `min` / `max` 只阻止取值，不阻止聚焦；粗粒度周期越过任一边界时整格不可选。
- 支持固定六行与显式多面板；翻页时整个视窗一起移动。
- 日期、月份与年份格按下时轻微缩放，松开后复原；减弱动效下自动收敛。
- 年份网格采用三列紧凑滚动面，可由作者按业务上下界铺入连续年份，复用日历格的选中与键盘语义。
- `calendarPeriodValue` 将选中的周期转换为 `{ granularity, start, end, keys }`，可直接用于查询参数。
- 切换粒度会清空旧选择并保留浏览锚点，避免不同周期键之间发生隐式转换。
- 周首日、月份名与星期名跟随 `locale`：`en-US` 周日起、`zh-CN` 周一起。未提供 `locale` 时跟随宿主浏览器语言，读取失败时使用 `en-US`；需要固定排法时显式传入 `locale`。

### 组合

- 格子中放[徽标](./badge)或一小段[排印](./typography)；外层放[卡片](./card)。
- 与[日历范围选择器](./calendar-range-picker)共用同一套部件名与皮肤槽，两者可以并排出现且外观一致。

### 最佳实践

- 今天使用淡强调面，选中使用实心强调面，两种状态必须能同时辨认。
- 多选时使用 `aria-multiselectable` 告知读屏用户可以多选，不依赖视觉提示。
- 格子中的内容超出时收起，避免某一行明显高于其他行。

### 反模式

- 不可选的日期无法聚焦，键盘用户无从知道该位置的内容。
- 将它用作日期输入框。
- 用多选模拟区间：中间的日期不会自动补齐，也没有拖选与预览。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-calendar-picker>` |
| Vue 组件 | `XhCalendarPickerCell` `XhCalendarPickerCellTrigger` `XhCalendarPickerGrid` `XhCalendarPickerGridBody` `XhCalendarPickerGridHead` `XhCalendarPickerHeader` `XhCalendarPickerHeading` `XhCalendarPickerHeadingMonthTrigger` `XhCalendarPickerHeadingYearTrigger` `XhCalendarPickerNextTrigger` `XhCalendarPickerNextYearTrigger` `XhCalendarPickerPrevTrigger` `XhCalendarPickerPrevYearTrigger` `XhCalendarPickerRoot` `XhCalendarPickerWeekDay` `XhCalendarPickerWeekNumber` `XhCalendarPickerWeekRow` |
| 组合式函数 | `useCalendarPicker` |
| 状态机 | `calendarPickerMachine` |
| 皮肤 | `@xihan-ui/styles/calendar-picker.css` |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `CalendarPickerValueChangeDetails` | 选中集合变化；detail 为 `{ value: string[] }` |
| `focused-value-change` | `CalendarFocusChangeDetails` | 聚焦日变化；detail 为 `{ focusedValue: string }` |
| `active-view-change` | `CalendarViewChangeDetails` | 切换到另一层级；detail 为 `{ activeView: 'day'\|'week'\|'month'\|'quarter'\|'year' }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhCalendarPickerRoot` | `default` | `CalendarPickerRootSlotProps` |  |

### 状态

以下名称仅用于内部状态机。

**状态**：`idle`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `selectionMode` | `CalendarPickerSelectionMode` |  |

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
| `Enter` / `Space` | focus in grid, 聚焦周期可用且非只读 | 选中聚焦周期：单选替换、多选切换。还没钻到 granularity 那一档时这一下是往下钻一层 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `grid` | `aria-disabled` | 'true' \| 'false' |
| `grid` | `aria-labelledby` | frame.headingId(panel.index) |
| `grid` | `aria-multiselectable` | 'true' \| 'false' |
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
| `cell-trigger` | `aria-label` | frame.dateLabel(state.date, state.period) |
| `cell-trigger` | `role` | 'button' |

## 样式参考

### 皮肤

`@xihan-ui/styles/calendar-picker.css` 使用 `[data-scope="calendar-picker"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

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
| `heading` | `data-index` | frame.panelOf(panel).index |
| `heading` | `data-view` | view |
| `heading-year-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `heading-year-trigger` | `data-index` | frame.panelOf(panel).index |
| `heading-year-trigger` | `data-view` | view |
| `heading-month-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `heading-month-trigger` | `data-index` | frame.panelOf(panel).index |
| `heading-month-trigger` | `data-view` | view |
| `grid` | `data-disabled` | ''（条件成立时才出现） |
| `grid` | `data-index` | frame.panelOf(panel).index |
| `grid` | `data-readonly` | ''（条件成立时才出现） |
| `grid` | `data-view` | view |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-calendar-picker-cell-bg-hover` | `cell-trigger` | `background` | `disabled`<br>`hover`<br>`not([data-disabled], [data-selected])`<br>`selected` | `--xh-bg-subtle-hover` | calendar-picker 的 cell-trigger 部件 background 覆盖槽。 |
| `--xh-calendar-picker-cell-bg-selected` | `cell-trigger` | `background` | `selected` | `--xh-bg-brand` | calendar-picker 的 cell-trigger 部件 background 覆盖槽。 |
| `--xh-calendar-picker-cell-bg-selected-active` | `cell-trigger` | `background` | `active`<br>`disabled`<br>`not([data-disabled])`<br>`selected` | `--xh-bg-brand-hover` | calendar-picker 的 cell-trigger 部件 background 覆盖槽。 |
| `--xh-calendar-picker-cell-fg` | `cell-trigger` | `color` | `@media print`<br>`default`<br>`selected` | `--xh-fg-default` | calendar-picker 的 cell-trigger 部件 color 覆盖槽。 |
| `--xh-calendar-picker-cell-fg-outside` | `cell-trigger` | `color` | `outside-month` | `--xh-fg-subtle` | calendar-picker 的 cell-trigger 部件 color 覆盖槽。 |
| `--xh-calendar-picker-cell-fg-selected` | `cell-trigger` | `color` | `selected` | `--xh-fg-on-brand` | calendar-picker 的 cell-trigger 部件 color 覆盖槽。 |
| `--xh-calendar-picker-cell-font-size` | `cell-trigger` | `font-size` | `default` | `--xh-text-body-size` | calendar-picker 的 cell-trigger 部件 font-size 覆盖槽。 |
| `--xh-calendar-picker-cell-font-weight` | `cell-trigger` | `font-weight` | `default` | `--xh-font-weight-medium` | calendar-picker 的 cell-trigger 部件 font-weight 覆盖槽。 |
| `--xh-calendar-picker-cell-gap` | `cell`<br>`cell-trigger` | `inset`<br>`padding` | `default` | `--xh-space-0_5` | calendar-picker 的 cell、cell-trigger 部件 inset、padding 覆盖槽。 |
| `--xh-calendar-picker-cell-radius` | `cell-trigger` | `border-radius` | `default` | `--xh-shape-inset` | calendar-picker 的 cell-trigger 部件 border-radius 覆盖槽。 |
| `--xh-calendar-picker-cell-size` | `cell-trigger` | `min-inline-size` | `default` | `--xh-control-h-sm` | calendar-picker 的 cell-trigger 部件 min-inline-size 覆盖槽。 |
| `--xh-calendar-picker-gap` | `root` | `gap` | `default` | `--xh-space-2` | calendar-picker 的 root 部件 gap 覆盖槽。 |
| `--xh-calendar-picker-grid-gap` | `grid` | `gap` | `default` | `--xh-space-1` | calendar-picker 的 grid 部件 gap 覆盖槽。 |
| `--xh-calendar-picker-header-gap` | `header` | `gap` | `default` | `--xh-space-2` | calendar-picker 的 header 部件 gap 覆盖槽。 |
| `--xh-calendar-picker-heading-fg` | `heading`<br>`heading-month-trigger`<br>`heading-year-trigger` | `color` | `default`<br>`not([hidden])` | `--xh-fg-default` | calendar-picker 的 heading、heading-month-trigger、heading-year-trigger 部件 color 覆盖槽。 |
| `--xh-calendar-picker-heading-font-size` | `heading`<br>`heading-month-trigger`<br>`heading-year-trigger` | `font-size` | `default`<br>`not([hidden])` | `--xh-text-label-size` | calendar-picker 的 heading、heading-month-trigger、heading-year-trigger 部件 font-size 覆盖槽。 |
| `--xh-calendar-picker-heading-font-weight` | `heading`<br>`heading-month-trigger`<br>`heading-year-trigger` | `font-weight` | `default`<br>`not([hidden])` | `--xh-font-weight-semibold` | calendar-picker 的 heading、heading-month-trigger、heading-year-trigger 部件 font-weight 覆盖槽。 |
| `--xh-calendar-picker-heading-trigger-fg-hover` | `heading-month-trigger`<br>`heading-year-trigger` | `color` | `hover`<br>`not(:disabled)` | `--xh-fg-brand` | calendar-picker 的 heading-month-trigger、heading-year-trigger 部件 color 覆盖槽。 |
| `--xh-calendar-picker-heading-trigger-px` | `heading-month-trigger`<br>`heading-year-trigger` | `padding-inline` | `not([hidden])` | `--xh-space-1` | calendar-picker 的 heading-month-trigger、heading-year-trigger 部件 padding-inline 覆盖槽。 |
| `--xh-calendar-picker-heading-trigger-radius` | `heading-month-trigger`<br>`heading-year-trigger` | `border-radius` | `not([hidden])` | `--xh-shape-control` | calendar-picker 的 heading-month-trigger、heading-year-trigger 部件 border-radius 覆盖槽。 |
| `--xh-calendar-picker-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-glyph-size-text` | calendar-picker 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-calendar-picker-nav-bg` | `next-trigger`<br>`next-year-trigger`<br>`prev-trigger`<br>`prev-year-trigger` | `background` | `default` | `transparent` | calendar-picker 的 next-trigger、next-year-trigger、prev-trigger、prev-year-trigger 部件 background 覆盖槽。 |
| `--xh-calendar-picker-nav-bg-hover` | `next-trigger`<br>`next-year-trigger`<br>`prev-trigger`<br>`prev-year-trigger` | `background` | `hover`<br>`not(:disabled)` | `--xh-bg-subtle-hover` | calendar-picker 的 next-trigger、next-year-trigger、prev-trigger、prev-year-trigger 部件 background 覆盖槽。 |
| `--xh-calendar-picker-nav-fg` | `next-trigger`<br>`next-year-trigger`<br>`prev-trigger`<br>`prev-year-trigger` | `color` | `default` | `--xh-fg-muted` | calendar-picker 的 next-trigger、next-year-trigger、prev-trigger、prev-year-trigger 部件 color 覆盖槽。 |
| `--xh-calendar-picker-nav-fg-hover` | `next-trigger`<br>`next-year-trigger`<br>`prev-trigger`<br>`prev-year-trigger` | `color` | `hover`<br>`not(:disabled)` | `--xh-fg-default` | calendar-picker 的 next-trigger、next-year-trigger、prev-trigger、prev-year-trigger 部件 color 覆盖槽。 |
| `--xh-calendar-picker-nav-radius` | `next-trigger`<br>`next-year-trigger`<br>`prev-trigger`<br>`prev-year-trigger` | `border-radius` | `default` | `--xh-shape-control` | calendar-picker 的 next-trigger、next-year-trigger、prev-trigger、prev-year-trigger 部件 border-radius 覆盖槽。 |
| `--xh-calendar-picker-nav-size` | `next-trigger`<br>`next-year-trigger`<br>`prev-trigger`<br>`prev-year-trigger` | `block-size`<br>`inline-size` | `default` | `--xh-control-h-sm` | calendar-picker 的 next-trigger、next-year-trigger、prev-trigger、prev-year-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-calendar-picker-period-gap` | `grid` | `gap` | `view=month`<br>`view=quarter`<br>`view=week`<br>`view=year` | `--xh-space-1` | calendar-picker 的 grid 部件 gap 覆盖槽。 |
| `--xh-calendar-picker-period-py` | `cell-trigger`<br>`grid` | `padding-block` | `is([data-view='week'], [data-view='month'], [data-view='quarter'], [data-view='year'])`<br>`view=month`<br>`view=quarter`<br>`view=week`<br>`view=year` | `--xh-space-2` | calendar-picker 的 cell-trigger、grid 部件 padding-block 覆盖槽。 |
| `--xh-calendar-picker-period-radius` | `cell-trigger`<br>`grid` | `border-radius` | `is([data-view='week'], [data-view='month'], [data-view='quarter'], [data-view='year'])`<br>`view=month`<br>`view=quarter`<br>`view=week`<br>`view=year` | `--xh-shape-control` | calendar-picker 的 cell-trigger、grid 部件 border-radius 覆盖槽。 |
| `--xh-calendar-picker-row-gap` | `grid-body`<br>`grid-head` | `gap` | `default` | `--xh-space-0` | calendar-picker 的 grid-body、grid-head 部件 gap 覆盖槽。 |
| `--xh-calendar-picker-today-bg` | `cell-trigger` | `background` | `today` | `--xh-bg-brand-subtle` | calendar-picker 的 cell-trigger 部件 background 覆盖槽。 |
| `--xh-calendar-picker-today-bg-hover` | `cell-trigger` | `background` | `disabled`<br>`hover`<br>`not([data-selected], [data-disabled])`<br>`selected`<br>`today` | `--xh-bg-brand-subtle-hover` | calendar-picker 的 cell-trigger 部件 background 覆盖槽。 |
| `--xh-calendar-picker-today-border` | `cell-trigger` | `border-color` | `today` | `transparent` | calendar-picker 的 cell-trigger 部件 border-color 覆盖槽。 |
| `--xh-calendar-picker-today-fg` | `cell-trigger` | `color` | `today` | `--xh-fg-brand` | calendar-picker 的 cell-trigger 部件 color 覆盖槽。 |
| `--xh-calendar-picker-week-cell-px` | `cell-trigger`<br>`grid` | `padding-inline` | `view=week` | `--xh-space-3` | calendar-picker 的 cell-trigger、grid 部件 padding-inline 覆盖槽。 |
| `--xh-calendar-picker-week-day-fg` | `week-day` | `color` | `default` | `--xh-fg-subtle` | calendar-picker 的 week-day 部件 color 覆盖槽。 |
| `--xh-calendar-picker-week-day-font-size` | `week-day` | `font-size` | `default` | `--xh-text-caption-size` | calendar-picker 的 week-day 部件 font-size 覆盖槽。 |
| `--xh-calendar-picker-week-day-font-weight` | `week-day` | `font-weight` | `default` | `--xh-font-weight-medium` | calendar-picker 的 week-day 部件 font-weight 覆盖槽。 |
| `--xh-calendar-picker-week-day-h` | `week-day` | `block-size` | `default` | `--xh-control-h-sm` | calendar-picker 的 week-day 部件 block-size 覆盖槽。 |
| `--xh-calendar-picker-week-number-fg` | `week-number` | `color` | `default` | `--xh-fg-subtle` | calendar-picker 的 week-number 部件 color 覆盖槽。 |
| `--xh-calendar-picker-week-number-font-size` | `week-number` | `font-size` | `default` | `--xh-text-caption-size` | calendar-picker 的 week-number 部件 font-size 覆盖槽。 |
| `--xh-calendar-picker-week-number-w` | `week-number`<br>`week-row` | `grid-template-columns` | `has(> [data-part='week-number'])`<br>`not([hidden])` | `--xh-control-h-md` | calendar-picker 的 week-number、week-row 部件 grid-template-columns 覆盖槽。 |
| `--xh-calendar-picker-year-grid-max-h` | `grid` | `max-block-size` | `view=year` | `--xh-viewport-h-sm` | calendar-picker 的 grid 部件 max-block-size 覆盖槽。 |
| `--xh-calendar-picker-year-grid-pe` | `grid` | `padding-inline-end` | `view=year` | `--xh-space-1` | calendar-picker 的 grid 部件 padding-inline-end 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`background` · `color` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。
