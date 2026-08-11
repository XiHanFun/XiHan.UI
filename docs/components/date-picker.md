# 日期选择器 <Badge type="info" text="date-picker" />

数据录入组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

段位与日历写的是同一个值，改哪边另一边当场跟着改口

<XhDemo src="date-picker/01-basic" />

### 区间选择

起止各一组段位，两端都能敲；只落一端浮层不收，两端都在才算选完

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

浮层里日历下面接一台时间输入，选中日期不收起，两份值由宿主拼成一条

<XhDemo src="date-picker/07-datetime" />

### 按月选择

浮层里换成年份翻页加十二个月，点完写值并收起；输入行只留年、月两段

<XhDemo src="date-picker/08-month-panel" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-date-picker>` |
| Vue 组件 | `XhDatePickerCalendar` `XhDatePickerCell` `XhDatePickerCellTrigger` `XhDatePickerClearTrigger` `XhDatePickerContent` `XhDatePickerControl` `XhDatePickerGrid` `XhDatePickerGridBody` `XhDatePickerGridHead` `XhDatePickerHeader` `XhDatePickerHeading` `XhDatePickerHiddenInput` `XhDatePickerInput` `XhDatePickerLabel` `XhDatePickerNextTrigger` `XhDatePickerPositioner` `XhDatePickerPrevTrigger` `XhDatePickerRoot` `XhDatePickerSegment` `XhDatePickerTrigger` `XhDatePickerWeekDay` `XhDatePickerWeekRow` |
| 组合式函数 | `useDatePicker` |
| 状态机 | `datePickerMachine` |
| 皮肤 | `@xihan-ui/styles/date-picker.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="date-picker"`：`root` · `label` · **`control`** · `input` · `trigger` · `clear-trigger` · `positioner` · **`content`** · **`calendar`**

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
| `placement` | `Placement` |  |  |
| `offset` | `number` |  |  |
| `translations` | `Partial<DatePickerTranslations>` |  |  |
| `closeOnSelect` | `boolean` |  | 选完即收起，默认 true。区间模式下要两端都落定才算选完。 |
| `onValueChange` | `(details: DatePickerValueChangeDetails) => void` |  | value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |
| `onOpenChange` | `(details: DatePickerOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |
| `onFocusedValueChange` | `(details: DatePickerFocusChangeDetails) => void` |  | 聚焦日变化（方向键、翻月、展开、段位输入都会发）。 网格由外部渲染，不监听这条日历不会换月。 |

## 状态机

**状态**：`open` · `closed`

**事件**：`OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `VALUE.SET` · `VALUE.CLEAR` · `FOCUSED.SET` · `FORM.RESET`

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
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `canClear` | `boolean` | 清空按钮此刻可不可按。 |
| `setOpen` | `(next: boolean) => void` |  |
| `setValue` | `(next: string[]) => void` |  |
| `clear` | `() => void` |  |
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

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/#kbd_label)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus in trigger, closed | 展开日历浮层，焦点落到当前聚焦日那一格 |
| `Enter` / `Space` | focus in trigger, open | 收起浮层，焦点回到 trigger |
| `Escape` | open | 收起浮层并把焦点还给展开前那个控件（通常是 trigger），选中值不变 |
| `Tab` / `Shift+Tab` | open | 不拦按键：焦点按 Tab 序列自然离开，浮层随即收起且不抢回焦点 |
| `Enter` / `Space` | open, focus in grid | 选中聚焦日（由日历完成）；closeOnSelect 时收起浮层——区间要两端都落定才算选完 |
