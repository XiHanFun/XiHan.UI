# 分格输入 <Badge type="info" text="pin-input" />

数据录入组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

每格都是原生输入框，敲一个字符自动跳下一格；粘贴整串会从落点那一格起按格铺开

<XhDemo src="pin-input/01-basic" />

### 一次性验证码

otp 补上 autocomplete=one-time-code，隐藏输入把拼好的整串交给表单，填满那一刻发 value-complete

<XhDemo src="pin-input/02-otp" />

### 遮蔽与字符类别

mask 把每格转成密码框，type 决定哪类字符进得来，其余按键既不进值也不留在框里

<XhDemo src="pin-input/03-mask" />

### 禁用与校验失败

disabled 让每格都带原生 disabled 且不参与提交，invalid 只做标注、照样能改

<XhDemo src="pin-input/04-disabled" />

### 形态

variant 只改每格的颜色槽位，跳格与粘贴铺开的行为三档一致

<XhDemo src="pin-input/05-variant" />

### 语气

tone 决定用哪族颜色，与 variant 正交；这里固定 outline 只看语气的差别

<XhDemo src="pin-input/06-tone" />

### 尺寸

每格的边长随 size 换档，不传 size 即默认档

<XhDemo src="pin-input/07-size" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-pin-input>` |
| Vue 组件 | `XhPinInputHiddenInput` `XhPinInputInput` `XhPinInputLabel` `XhPinInputRoot` |
| 组合式函数 | `usePinInput` |
| 状态机 | `pinInputMachine` |
| 皮肤 | `@xihan-ui/styled/pin-input.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="pin-input"`：**`root`** · `label` · **`input`** · `hidden-input`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string[]` |  | 逐格的值。给定即受控：cell 直读 prop，写只发 onValueChange 不落内部值。 |
| `defaultValue` | `string[]` |  |  |
| `length` | `number` |  | 格数，默认 6。值的长度恒被归一到它。 |
| `type` | `PinInputType` |  | 接受的字符类别，默认 numeric。 |
| `mask` | `boolean` |  | 遮蔽显示：输入框转 type=password。 |
| `otp` | `boolean` |  | 一次性验证码：补 autocomplete=one-time-code，短信验证码才能被系统自动填入。 |
| `placeholder` | `string` |  | 空格子的占位字符。 |
| `disabled` | `boolean` |  | 禁用：每格都带原生 disabled（不可聚焦、不可输入），隐藏输入不参与提交。 |
| `invalid` | `boolean` |  | 校验失败标注。 |
| `blurOnComplete` | `boolean` |  | 填满即把焦点撤走，常用于"填满就自动提交"的表单。 |
| `name` | `string` |  | 表单字段名；给了隐藏输入才带 name，整串值随表单一并提交。 |
| `variant` | `string` |  | 形态：outline / subtle / ghost，决定颜色怎么用。 |
| `tone` | `string` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 |
| `size` | `string` |  | 尺寸：sm / md / lg。 |
| `translations` | `Partial<PinInputTranslations>` |  |  |
| `onValueChange` | `(details: PinInputValueChangeDetails) => void` |  | value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |
| `onValueComplete` | `(details: PinInputValueChangeDetails) => void` |  | 每格都填满的那一刻触发；值没真变时不重复触发。 |

## 状态机

**状态**：`idle`

**事件**：`VALUE.SET` · `VALUE.FILL` · `VALUE.CLEAR_AT` · `VALUE.CLEAR` · `INPUT.FOCUS` · `INPUT.BLUR`

**判据**：`canEdit`

## connect API

`usePinInput` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string[]` | 逐格的值，长度恒等于 length。 |
| `valueAsString` | `string` |  |
| `complete` | `boolean` | 每格都填满了。作者据此点亮提交按钮。 |
| `length` | `number` |  |
| `focusedIndex` | `number` | 焦点所在格；焦点在组外时为 -1。 |
| `disabled` | `boolean` |  |
| `invalid` | `boolean` |  |
| `setValue` | `(next: string[]) => void` |  |
| `clear` | `() => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['label']` |  |
| `getInputProps` | `(props: PinInputInputProps) => T['input']` |  |
| `getHiddenInputProps` | `() => T['input']` | 整份验证码的表单出口：一份 type=hidden 的原生输入，随表单提交拼好的串。 |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/#textbox)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowRight` | focus in a box, not disabled | 焦点移到下一格；已在末格则不动，不回绕 |
| `ArrowLeft` | focus in a box, not disabled | 焦点移到上一格；已在首格则不动，不回绕 |
| `Home` | focus in a box, not disabled | 焦点移到首格 |
| `End` | focus in a box, not disabled | 焦点移到末格 |
| `Backspace` | focus in a box, not disabled | 本格有值则清本格；本格为空则退回上一格并清掉上一格 |
| `Delete` | focus in a box, not disabled | 清掉本格，焦点不动 |
