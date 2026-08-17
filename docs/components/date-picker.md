# 日期选择器 <Badge type="info" text="date-picker" />

数据录入组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

点输入行任意处即展开，不必再去点小箭头；段位与日历写的是同一个值，改哪边另一边当场跟着改口

<XhDemo src="date-picker/01-basic" />

### 区间选择

五种粒度都能挑区间：默认并排两个连续页，翻页整窗一起走；« » 走大步

<XhDemo src="date-picker/02-range" />

### 不可选的日子

周末由 isDateUnavailable 判不可用：方向键仍走得过去，只是落不了值

<XhDemo src="date-picker/03-unavailable" />

### 禁用 / 只读 / 校验失败

禁用整条退出 Tab 序，只读仍能展开翻月只是落不了值，invalid 只改标注

<XhDemo src="date-picker/04-state" />

### 浮层里的快捷选项

日历下面这排按钮是作者自己的节点，写值与收起都走根插槽给的入口

<XhDemo src="date-picker/05-shortcuts" />

### 受控展开与事件

open 交给宿主持有，值、展开、聚焦日三条变化各自播报

<XhDemo src="date-picker/06-events" />

### 日期加时间

show-time 让值升格为一体化 datetime：日历右侧多出时/分列（XhDatePickerTimePanel 整组自动铺），选完日子不收起、时间列点选写值、XhDatePickerConfirmTrigger 收口

<XhDemo src="date-picker/07-datetime" />

### 五种粒度

天 / 周 / 月 / 季度 / 年一套结构走完：输入行铺哪几段跟着 view 走，标题里的年与月可点，逐级钻上去

<XhDemo src="date-picker/08-granularity" />

### 三轴

variant 决定描边与底怎么画、tone 决定用哪族颜色、size 换几何档；三者只落在 root，浮层里的日历一并跟着换

<XhDemo src="date-picker/09-axes" />

### 可选的触发钮

点输入行本来就展开，这个按钮不是必需的；要它是因为它才带 aria-haspopup / aria-expanded

<XhDemo src="date-picker/10-trigger" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-date-picker>` |
| Vue 组件 | `XhDatePickerCalendar` `XhDatePickerCell` `XhDatePickerCellTrigger` `XhDatePickerClearTrigger` `XhDatePickerConfirmTrigger` `XhDatePickerContent` `XhDatePickerControl` `XhDatePickerGrid` `XhDatePickerGridBody` `XhDatePickerGridHead` `XhDatePickerHeader` `XhDatePickerHeading` `XhDatePickerHeadingMonthTrigger` `XhDatePickerHeadingYearTrigger` `XhDatePickerHiddenInput` `XhDatePickerInput` `XhDatePickerLabel` `XhDatePickerNextTrigger` `XhDatePickerNextYearTrigger` `XhDatePickerPositioner` `XhDatePickerPrevTrigger` `XhDatePickerPrevYearTrigger` `XhDatePickerRoot` `XhDatePickerSegment` `XhDatePickerTimePanel` `XhDatePickerTrigger` `XhDatePickerWeekDay` `XhDatePickerWeekNumber` `XhDatePickerWeekRow` |
| 组合式函数 | `useDatePicker` |
| 状态机 | `datePickerMachine` |
| 皮肤 | `@xihan-ui/styles/date-picker.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="date-picker"`：`root` · `label` · **`control`** · `input` · `trigger` · `clear-trigger` · `positioner` · **`content`** · **`calendar`** · `time-column` · `time-item` · `confirm-trigger`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string \| string[]` |  | 选中值，ISO 串。给定即受控：读直取 prop，写只发 onValueChange 不落内部值。 单选可写裸串，内部一律归一成数组。 |
| `defaultValue` | `string \| string[]` |  |  |
| `open` | `boolean` |  | 展开态。给定即受控：内部不再自改，只发 onOpenChange。 |
| `defaultOpen` | `boolean` |  |  |
| `min` | `string` |  | 可选范围下界（含当天），ISO 串。日历与分段输入共用这一条。 |
| `max` | `string` |  | 可选范围上界（含当天），ISO 串。 |
| `locale` | `string` |  | 决定周首日、月份文案与段位先后（zh-CN 年月日、en-US 月日年）。 |
| `timeZone` | `string` |  | 判定「今天」与格式化文案用的时区，默认取宿主本地时区。 |
| `selectionMode` | `CalendarSelectionMode` |  | 选择模式，默认 single；区间模式下两端都落定才算选完。 |
| `isDateUnavailable` | `(value: string) => boolean` |  | 不可用判定，收 ISO 串。界外与它判真的日子同等对待。 |
| `disabled` | `boolean` |  | 整个控件禁用：trigger 转原生 disabled，段位退出 Tab 序，日历格子全转 aria-disabled。 |
| `readOnly` | `boolean` |  | 只读：浮层照常展开、日历照常翻月浏览，但选中值改不动。 |
| `invalid` | `boolean` |  | 校验失败：段位报 aria-invalid，各角色节点带 data-invalid。 |
| `required` | `boolean` |  | 必填标注，落到每一段的 aria-required 上。 |
| `name` | `string` |  | 表单字段名；给了隐藏输入才带 name，ISO 串随表单一并提交。区间模式下是起点那一份。 |
| `endName` | `string` |  | 区间终点那份隐藏输入的表单字段名；不给即终点不参与提交。 |
| `view` | `CalendarView` |  | 挑的粒度：天（默认）、月、季度、年。格子的值仍是 ISO 日期串 （那段时间的第一天），min/max 与区间逻辑因此原样复用。 输入行铺哪几段也跟着它走（按季度挑就出「2026-Q2」），要另铺见 segments。 |
| `activeView` | `CalendarView` |  | 面板此刻钻到了哪一层。给定即受控；缺省跟着 view，每次展开都回到 view 那一档。 点标题里的年 / 月会改它。 |
| `segments` | `DateSegmentSet` |  | 输入行铺哪几段。不给就按 view 推：按月挑出「2026-05」、按季度出「2026-Q2」、 按年出「2026」、周选出「2026-33」，按天挑则按 locale 排年月日。 |
| `weekSelection` | `boolean` |  | 周选：点任意一天选中它所在的整周。只在 view=day 且区间模式下生效。 |
| `visibleCount` | `number` |  | 并排展示几个连续月，默认单选 1、区间 2。 区间的起止常跨月，一个面板要来回翻页才挑得完,两个并排才顺手。 |
| `variant` | `ControlVariant` |  | 形态：outline / subtle / ghost，决定输入行的描边与底色怎么用。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定聚焦与选中强调用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，输入行与浮层里的日历格一并换档。 |
| `placement` | `Placement` |  |  |
| `dir` | `Direction` |  | 文字方向，缺省 ltr。只改写浮层在行内轴上 start 与 end 的落点。 |
| `offset` | `number` |  |  |
| `translations` | `Partial<DatePickerTranslations>` |  |  |
| `closeOnSelect` | `boolean` |  | 选完即收起，默认 true。区间模式下要两端都落定才算选完。 |
| `showTime` | `boolean` |  | 一体化时间：值升格为 'YYYY-MM-DDTHH:mm[:ss]'，面板里多出时间列， 选完日子不收起、由确认按钮收口。只在单选模式下生效。 |
| `timeGranularity` | `DatePickerTimeGranularity` |  | showTime 的时间段精度，默认 minute。 |
| `onValueChange` | `(details: DatePickerValueChangeDetails) => void` |  | value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |
| `onOpenChange` | `(details: DatePickerOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |
| `onFocusedValueChange` | `(details: DatePickerFocusChangeDetails) => void` |  | 聚焦日变化（方向键、翻月、展开、段位输入都会发）。 网格由外部渲染，不监听这条日历不会换月。 |
| `onActiveViewChange` | `(details: CalendarViewChangeDetails) => void` |  | 面板钻到了哪一层（点标题钻上、点格子钻下都会发）；受控时是唯一出口。 |

## 状态机

**状态**：`open` · `closed`

**事件**：`OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `VALUE.SET` · `VALUE.CLEAR` · `FOCUSED.SET` · `VIEW.SET` · `FORM.RESET`

**判据**：`isOpenControlled` · `closesOnSelect`

## connect API

`useDatePicker` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `value` | `string[]` | 选中集合，ISO 串；形状不随模式变。 区间模式下按位存放，空缺的那一端是空串。 |
| `valueAsString` | `string \| null` | 首个选中值（跳过空缺的那一端）；无选中时为 null。 |
| `selectionMode` | `CalendarSelectionMode` |  |
| `focusedValue` | `string` | 生效聚焦日（三路收口后的结果），恒非空。日历展示哪个月由它决定。 |
| `view` | `CalendarView` | 作者要挑的粒度。 |
| `activeView` | `CalendarView` | 面板此刻钻到了哪一层。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `canClear` | `boolean` | 清空按钮此刻可不可按。 |
| `setOpen` | `(next: boolean) => void` |  |
| `setValue` | `(next: string[]) => void` |  |
| `clear` | `() => void` |  |
| `setActiveView` | `(next: CalendarView) => void` | 直接钻到某一层。 |
| `showTime` | `boolean` | showTime 生效（开了且是单选模式）。 |
| `timeColumns` | `readonly TimePickerColumn<DatePickerTimeUnit>[]` | 时间列（时/分[/秒]）；没开 showTime 时为空数组。 |
| `timeValue` | `string \| null` | 当前时间段（'HH:mm[:ss]'）；还没有值时为 null。 |
| `calendar` | `CalendarApi<T>` | 内嵌日历：选日期、翻月、键盘导航都在它身上。 |
| `field` | `DatePickerFieldApi<T>` | 内嵌分段输入，区间模式下是起点那一组。 |
| `fieldEnd` | `DatePickerFieldApi<T> \| null` | 终点那组分段输入；非区间模式为 null。 |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` |  |
| `getControlProps` | `() => T['element']` |  |
| `getInputProps` | `(props?: DatePickerInputProps) => T['element']` | role=group 的分段容器，段位挂在它里面。区间模式下 index 选起止两组，不传即起点。 |
| `getTriggerProps` | `() => T['button']` |  |
| `getClearTriggerProps` | `() => T['button']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getCalendarProps` | `() => T['element']` | 内嵌日历的挂载点，同时充当日历的根节点。 |
| `getTimeColumnProps` | `(props: DatePickerTimeColumnProps) => T['element']` | 时间列容器（时/分[/秒]各一列）；没开 showTime 时带 hidden。 |
| `getTimeItemProps` | `(props: DatePickerTimeItemProps) => T['element']` | 时间选项：点按把该单位写进值（没有日期时以聚焦日为日期段起值）。 |
| `getConfirmTriggerProps` | `() => T['button']` | 确认按钮：showTime 的收口；没开 showTime 时带 hidden。 |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/#kbd_label)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus in trigger, closed | 展开日历浮层，焦点落到当前聚焦日那一格 |
| `Enter` / `Space` | focus in trigger, open | 收起浮层，焦点回到 trigger |
| `Escape` | open | 收起浮层并把焦点还给展开前那个控件（通常是 trigger），选中值不变 |
| `Tab` / `Shift+Tab` | open | 不拦按键：焦点按 Tab 序列自然离开，浮层随即收起且不抢回焦点 |
| `Enter` / `Space` | open, focus in grid | 选中聚焦日（由日历完成）；closeOnSelect 时收起浮层——区间要两端都落定才算选完 |
| `Alt+ArrowDown` | focus in 某一段, closed, not disabled | 展开浮层并把焦点送进去；触发钮是可选部件，键盘那条入口不能只挂在它身上 |
| `Enter` | focus in 某一段, open | 收起浮层。段位里敲出来的值不触发「选完即收」（那时人还在打字），这是那条路的收口手势 |
