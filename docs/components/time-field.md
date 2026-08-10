# 时间输入 <Badge type="info" text="time-field" />

数据录入组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

默认 24 小时制，上下键在段区间里回绕，缺一段整份值就退回空串

<XhDemo src="time-field/01-basic" />

### 12 小时制

hour-cycle=12 多出一个上午/下午段，值本身仍是 24 小时的串

<XhDemo src="time-field/02-hour-cycle" />

### 精度到秒

granularity=second 让秒段显出来并参与值，空段按上下键从该段边界起步

<XhDemo src="time-field/03-granularity" />

### 禁用与越界

禁用整组退出 Tab 序；越界只做标注，08:00 原样留着不被改写

<XhDemo src="time-field/04-state" />

### 形态

variant 只改分段框的底色与描边用法，分段结构与键盘行为都不变

<XhDemo src="time-field/05-variant" />

### 语气

tone 决定用哪族颜色，与 variant 正交；这里固定 subtle 形态，只看语气这一轴

<XhDemo src="time-field/06-tone" />

### 尺寸

不传 size 即默认档；行高、内边距与字号一起换档，标题也跟着变

<XhDemo src="time-field/07-size" />

### 外部写值与清空

根插槽给出 setValue / clear 与空、越界两个判据，按钮照它们摆

<XhDemo src="time-field/08-actions" />

### 可选值白名单

值交给宿主持有，写回来的时间被吸附到清单里的一格，上下键与数字键因此都落在清单上

<XhDemo src="time-field/09-whitelist" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-time-field>` |
| Vue 组件 | `XhTimeFieldControl` `XhTimeFieldHiddenInput` `XhTimeFieldLabel` `XhTimeFieldRoot` `XhTimeFieldSegment` |
| 组合式函数 | `useTimeField` |
| 状态机 | `timeFieldMachine` |
| 皮肤 | `@xihan-ui/styled/time-field.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="time-field"`：**`root`** · `label` · **`control`** · **`segment`** · `hidden-input`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` |  | 受控值，ISO 时间串。给定即受控：cell 直读 prop，写只发 onValueChange 不落内部值。 |
| `defaultValue` | `string` |  |  |
| `min` | `string` |  | 下界（含）。只用来标注越界，不改写用户填进去的东西。 |
| `max` | `string` |  | 上界（含）。同上。 |
| `locale` | `string` |  | BCP 47 语言标记。决定上午/下午的文字，以及未显式给 hourCycle 时的小时制。 |
| `hourCycle` | `TimeHourCycle` |  | 小时制。不给则按 locale 推断，locale 也没有时用 24。 |
| `granularity` | `TimeGranularity` |  | 值精确到哪一段，默认 minute。 |
| `disabled` | `boolean` |  | 禁用：段整体退出 Tab 序列、键盘一概不响应，隐藏输入不参与提交。 |
| `readOnly` | `boolean` |  | 只读：仍可聚焦、可用左右键在段间走，但改不动值。 |
| `invalid` | `boolean` |  | 校验失败标注。 |
| `required` | `boolean` |  | 必填标注（落到每段的 aria-required 上）。 |
| `name` | `string` |  | 表单字段名；给了隐藏输入才带 name，值随表单一并提交。 |
| `placeholder` | `string` |  | 空段的占位字符（单字符），按段宽重复，默认 '-'。 |
| `variant` | `string` |  | 形态：outline / subtle / ghost，决定描边与底色怎么用。 |
| `tone` | `string` |  | 语气：brand / neutral / success / warning / danger / info，决定聚焦与强调用哪族颜色。 |
| `size` | `string` |  | 尺寸：sm / md / lg。 |
| `onValueChange` | `(details: TimeFieldValueChangeDetails) => void` |  | value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |

## 状态机

**状态**：`idle`

**事件**：`VALUE.SET` · `VALUE.CLEAR` · `SEGMENT.STEP` · `SEGMENT.DIGIT` · `SEGMENT.CLEAR` · `SEGMENT.PERIOD` · `SEGMENT.FOCUS` · `SEGMENT.BLUR`

**判据**：`canEdit`

## connect API

`useTimeField` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string` | ISO 时间串；任一必填段为空时是空串。 |
| `empty` | `boolean` | 值为空串（还没填全）。作者据此点亮提交按钮或显示提示。 |
| `outOfRange` | `boolean` | 已填全但落在 min/max 之外。只是标注，不改写值。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `hourCycle` | `TimeHourCycle` | 实际生效的小时制（prop 没给时由 locale 推出来的那个）。 |
| `granularity` | `TimeGranularity` |  |
| `segments` | `TimeSegmentType[]` | 此刻参与显示的段，文档序。未列入的段由 connect 打上 hidden 收起。 |
| `focusedSegment` | `TimeSegmentType \| null` | 焦点所在段；焦点在组外时为 null。 |
| `getSegmentText` | `(props: TimeFieldSegmentProps) => string` | 某一段该显示的文字（空段是占位串）。两个适配器都拿它填文本，保证同构。 |
| `setValue` | `(next: string) => void` |  |
| `clear` | `() => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['label']` |  |
| `getControlProps` | `() => T['element']` |  |
| `getSegmentProps` | `(props: TimeFieldSegmentProps) => T['element']` |  |
| `getHiddenInputProps` | `() => T['input']` | 表单出口：一份 type=hidden 的原生输入，随表单提交 ISO 串。 |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowUp` | focus in a segment, not disabled/readOnly | 本段加一格，到头回绕；空段落到该段下界 |
| `ArrowDown` | focus in a segment, not disabled/readOnly | 本段减一格，到头回绕；空段落到该段上界 |
| `ArrowRight` | focus in a segment, not disabled | 焦点移到下一段；已在末段则不动，不回绕 |
| `ArrowLeft` | focus in a segment, not disabled | 焦点移到上一段；已在首段则不动，不回绕 |
| `Home` | focus in a segment, not disabled | 焦点移到首段 |
| `End` | focus in a segment, not disabled | 焦点移到末段 |
| `0-9` | focus in a 数字段, not disabled/readOnly | 把数字并进本段；本段再吃不下第二位时自动跳到下一段 |
| `Backspace` / `Delete` | focus in a segment, not disabled/readOnly | 清掉本段；小时被清时上下午段仍保留原来的上午/下午 |
| `a` / `p` | focus in 上下午段, 12 小时制, not disabled/readOnly | a 取上午、p 取下午（不区分大小写） |
