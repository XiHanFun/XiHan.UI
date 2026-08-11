# 时间选择器 <Badge type="info" text="time-picker" />

数据录入组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

段位与列写的是同一个值：段上敲、列里挑，另一边当场跟着改口

<XhDemo src="time-picker/01-basic" />

### 分列步长

step=15 只裁浮层里的可选值（分列剩四格），段位上手打的分数不受它限制

<XhDemo src="time-picker/02-step" />

### 12 小时制

时列写的是显示值 01-12，落到哪个真实小时由输入行里的上下午段说了算

<XhDemo src="time-picker/03-hour-cycle" />

### 精度到秒

granularity 同时决定输入行显示几段、浮层里排几列

<XhDemo src="time-picker/04-granularity" />

### 禁用 / 只读 / 校验失败

禁用整条退出 Tab 序，只读仍能展开浏览只是改不动值，invalid 只改标注

<XhDemo src="time-picker/05-state" />

### 可选时段

min / max 直接把界外的格从列里裁掉；分列还会随已选的时再裁一遍

<XhDemo src="time-picker/06-range" />

### 浮层里的操作按钮

列表下面这排按钮是作者自己的节点，键盘事件在它这一层收口，不再上交给列表

<XhDemo src="time-picker/07-actions" />

### 按谓词裁可选值

列里渲染哪几格由作者决定，午休两格整段拿掉；手打进段位的时被吸到下一个可约小时

<XhDemo src="time-picker/08-predicate" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-time-picker>` |
| Vue 组件 | `XhTimePickerClearTrigger` `XhTimePickerColumn` `XhTimePickerContent` `XhTimePickerControl` `XhTimePickerHiddenInput` `XhTimePickerInput` `XhTimePickerItem` `XhTimePickerLabel` `XhTimePickerPositioner` `XhTimePickerRoot` `XhTimePickerTrigger` |
| 组合式函数 | `useTimePicker` |
| 状态机 | `timePickerMachine` |
| 皮肤 | `@xihan-ui/styles/time-picker.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="time-picker"`：**`root`** · `label` · **`control`** · **`input`** · **`trigger`** · `clear-trigger` · `positioner` · **`content`** · `column` · `item` · `hidden-input`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` |  | 受控值，ISO 时间串。给定即受控：cell 直读 prop，写只发 onValueChange 不落内部值。 |
| `defaultValue` | `string` |  |  |
| `open` | `boolean` |  | 展开态。给定即受控：内部不再自改，只发 onOpenChange。 |
| `defaultOpen` | `boolean` |  |  |
| `min` | `string` |  | 下界（含）。裁掉浮层里落在界外的可选值，并把已填的越界值标注出来（不改写它）。 |
| `max` | `string` |  | 上界（含）。同上。 |
| `locale` | `string` |  | BCP 47 语言标记。决定上午/下午的文字，以及未显式给 hourCycle 时的小时制。 |
| `hourCycle` | `TimeHourCycle` |  | 小时制。不给则按 locale 推断，locale 也没有时用 24。 |
| `granularity` | `TimeGranularity` |  | 值精确到哪一段，默认 minute。它同时决定分段输入显示几段、浮层里排几列。 |
| `step` | `number` |  | 分列的步进（分钟），默认 1。只影响浮层里的可选值，不限制手打进去的分数。 |
| `disabled` | `boolean` |  | 禁用：分段输入整组退出 Tab 序列、触发器用原生 disabled，隐藏输入不参与提交。 |
| `readOnly` | `boolean` |  | 只读：浮层照常展开、列表照常浏览，但值改不动也清不掉。 |
| `invalid` | `boolean` |  | 校验失败标注。 |
| `required` | `boolean` |  | 必填标注（落到每段的 aria-required 上）。 |
| `name` | `string` |  | 表单字段名；给了隐藏输入才带 name，值随表单一并提交。 |
| `placement` | `Placement` |  |  |
| `offset` | `number` |  |  |
| `onValueChange` | `(details: TimePickerValueChangeDetails) => void` |  | value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |
| `onOpenChange` | `(details: TimePickerOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |

## 状态机

**状态**：`open` · `closed`

**事件**：`OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `VALUE.SET` · `VALUE.CLEAR` · `SEGMENT.STEP` · `SEGMENT.DIGIT` · `SEGMENT.CLEAR` · `SEGMENT.PERIOD` · `SEGMENT.FOCUS` · `SEGMENT.BLUR` · `OPTION.FOCUS` · `ITEM.SELECT` · `FORM.RESET`

**判据**：`isOpenControlled` · `canEdit`

## connect API

`useTimePicker` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `value` | `string` | ISO 时间串；任一必填段为空时是空串。 |
| `empty` | `boolean` | 值为空串（还没填全）。 |
| `outOfRange` | `boolean` | 已填全但落在 min/max 之外。只是标注，不改写值。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `hourCycle` | `TimeHourCycle` | 实际生效的小时制（prop 没给时由 locale 推出来的那个）。 |
| `granularity` | `TimeGranularity` |  |
| `step` | `number` | 实际生效的分列步进。 |
| `segments` | `TimeSegmentType[]` | 此刻参与显示的段，文档序。未列入的段由 connect 打上 hidden 收起。 |
| `focusedSegment` | `TimeSegmentType \| null` | 焦点所在段；焦点在分段输入外时为 null。 |
| `columns` | `TimePickerColumn[]` | 此刻该排哪几列、每列有哪些可选值（已按 step 与 min/max 裁过）。作者据此渲染浮层。 |
| `focusedColumn` | `TimePickerColumnUnit \| null` |  |
| `focusedItem` | `string \| null` |  |
| `canClear` | `boolean` | 清空按钮此刻可不可按。 |
| `getSegmentText` | `(props: TimePickerInputProps) => string` | 某一段该显示的文字（空段是占位串）。两个适配器都拿它填文本，保证同构。 |
| `isItemSelected` | `(props: TimePickerItemProps) => boolean` |  |
| `isItemDisabled` | `(props: TimePickerItemProps) => boolean` | 落在 min/max 之外（或整个控件禁用）：仍在列表里，但不可选、方向键跳过。 |
| `setOpen` | `(next: boolean) => void` |  |
| `setValue` | `(next: string) => void` |  |
| `clear` | `() => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['label']` |  |
| `getControlProps` | `() => T['element']` |  |
| `getInputProps` | `(props: TimePickerInputProps) => T['element']` | 分段输入：一段一个节点，与 TimeField 的段同构（role=spinbutton + roving tabindex）。 |
| `getTriggerProps` | `() => T['button']` |  |
| `getClearTriggerProps` | `() => T['button']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getColumnProps` | `(props: TimePickerColumnProps) => T['element']` |  |
| `getItemProps` | `(props: TimePickerItemProps) => T['element']` |  |
| `getHiddenInputProps` | `() => T['input']` | 表单出口：一份 type=hidden 的原生输入，随表单提交 ISO 串。 |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowDown` / `ArrowUp` | focus in trigger, closed, not disabled | 展开浮层，焦点落到时列（已选的时仍可选就停在它上面，否则停在首格） |
| `Enter` / `Space` | focus in trigger, not disabled | 按钮的默认激活即展开/收起（不额外拦键，否则会一开一关） |
| `ArrowDown` | open, focus in 某一列 | 列内下移一格，到尾回绕；被 min/max 裁掉的格自动跳过 |
| `ArrowUp` | open, focus in 某一列 | 列内上移一格，到头回绕；被 min/max 裁掉的格自动跳过 |
| `Home` | open, focus in 某一列 | 焦点移到本列首格 |
| `End` | open, focus in 某一列 | 焦点移到本列末格 |
| `ArrowRight` | open | 换到下一列并落在该列的锚点上；已在末列则不动，不回绕 |
| `ArrowLeft` | open | 换到上一列并落在该列的锚点上；已在首列则不动，不回绕 |
| `Enter` / `Space` | open, 焦点停在可选的格上, not disabled/readOnly | 把这一格写进对应的段；浮层不收起（其余列还要接着挑） |
| `Escape` | open | 收起浮层并把焦点归还触发器，值不变 |
| `Tab` / `Shift+Tab` | open | 收起浮层且不拦按键，焦点按 Tab 序列自然离开，不抢回触发器 |
| `ArrowUp` | focus in 某一段, not disabled/readOnly | 本段加一格，到头回绕；空段落到该段下界 |
| `ArrowDown` | focus in 某一段, not disabled/readOnly | 本段减一格，到头回绕；空段落到该段上界 |
| `ArrowRight` | focus in 某一段, not disabled | 焦点移到下一段；已在末段则不动，不回绕 |
| `ArrowLeft` | focus in 某一段, not disabled | 焦点移到上一段；已在首段则不动，不回绕 |
| `Home` | focus in 某一段, not disabled | 焦点移到首段 |
| `End` | focus in 某一段, not disabled | 焦点移到末段 |
| `0-9` | focus in 数字段, not disabled/readOnly | 把数字并进本段；本段再吃不下第二位时自动跳到下一段 |
| `Backspace` / `Delete` | focus in 某一段, not disabled/readOnly | 清掉本段；小时被清时上下午段仍保留原来的上午/下午 |
| `a` / `p` | focus in 上下午段, 12 小时制, not disabled/readOnly | a 取上午、p 取下午（不区分大小写） |
