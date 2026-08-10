# 数字输入 <Badge type="info" text="number-field" />

数据录入组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

加减按钮与输入框共用一份状态；值是原始输入串，不传 value 即为非受控

<XhDemo src="number-field/01-basic" />

### 区间与步长

方向键走 step，PageUp 与 PageDown 走 largeStep，Home 与 End 取端点；贴到边界时对应按钮转灰

<XhDemo src="number-field/02-range" />

### 受控

传了 value 就由宿主说了算；value-change 除了原始串还带一份 valueAsNumber

<XhDemo src="number-field/03-controlled" />

### 禁用与只读

两者都改不动值，禁用还会把加减按钮一并关掉、值也不再随表单提交

<XhDemo src="number-field/04-disabled" />

### 形态

variant 只改皮肤怎么用颜色，加减与键盘行为三档完全一致

<XhDemo src="number-field/05-variant" />

### 语气

tone 决定用哪族颜色，与 variant 正交；这里固定 outline 只看语气的差别

<XhDemo src="number-field/06-tone" />

### 尺寸

输入框高度与加减按钮一起换档，不传 size 即默认档

<XhDemo src="number-field/07-size" />

### 只用输入框

加减钮是可选部件，不渲染它照样能改值：方向键走 step，PageUp 与 PageDown 走 largeStep

<XhDemo src="number-field/08-no-trigger" />

### 加减钮排布

两个触发器摆在哪儿由作者写模板决定，钮里放什么字符也一样；行为不随位置变

<XhDemo src="number-field/09-trigger-placement" />

### 校验态

invalid 由宿主自己判定，不必挂在表单上；标出来之后值照样能改、加减钮照样能按

<XhDemo src="number-field/10-invalid" />

### 框内单位与货币符号

前后缀压在输入框上，输入框自己让出内边距；加减钮照旧摆在包裹层里

<XhDemo src="number-field/11-affix" />

### 固定小数位

步进本身带定点规整，宿主在离开输入框与松开加减钮时把值补齐到两位小数

<XhDemo src="number-field/12-precision" />

### 提交时机

输入途中只动草稿，失焦或回车才把值交给业务模型；不合法就退回上一次提交的值

<XhDemo src="number-field/13-change-timing" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-number-field>` |
| Vue 组件 | `XhNumberFieldDecrementTrigger` `XhNumberFieldIncrementTrigger` `XhNumberFieldInput` `XhNumberFieldLabel` `XhNumberFieldRoot` |
| 组合式函数 | `useNumberField` |
| 状态机 | `numberFieldMachine` |
| 皮肤 | `@xihan-ui/styled/number-field.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="number-field"`：**`root`** · `label` · **`input`** · `increment-trigger` · `decrement-trigger`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` |  |  |
| `defaultValue` | `string` |  |  |
| `min` | `number` |  |  |
| `max` | `number` |  |  |
| `step` | `number` |  | 方向键与加减按钮的步长，默认 1。 |
| `largeStep` | `number` |  | PageUp / PageDown 的步长，默认 10 倍 step。 |
| `disabled` | `boolean` |  |  |
| `readOnly` | `boolean` |  |  |
| `required` | `boolean` |  |  |
| `invalid` | `boolean` |  |  |
| `name` | `string` |  | 表单字段名；给了才参与提交。 |
| `changeDelay` | `number` |  | 按住加减按钮多久开始连发，默认 300ms。 |
| `changeInterval` | `number` |  | 连发间隔，默认 50ms。 |
| `variant` | `string` |  | 形态：outline / subtle / ghost，决定输入框与加减钮的底与描边怎么画。 |
| `tone` | `string` |  | 语气：brand / neutral / success / warning / danger / info，决定聚焦强调用哪族颜色。 |
| `size` | `string` |  | 尺寸：sm / md / lg，决定输入框与加减钮的几何档位。 |
| `onValueChange` | `(details: NumberFieldValueChangeDetails) => void` |  |  |

## 状态机

**状态**：`idle` · `spinning`

**事件**：`VALUE.SET` · `VALUE.STEP` · `VALUE.TO_MIN` · `VALUE.TO_MAX` · `INPUT.BLUR` · `PRESS.START` · `PRESS.END` · `after.changeInterval`

**判据**：`canStep`

## connect API

`useNumberField` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string` |  |
| `valueAsNumber` | `number` |  |
| `empty` | `boolean` | 值为空或非法。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `canIncrement` | `boolean` |  |
| `canDecrement` | `boolean` |  |
| `setValue` | `(next: string) => void` |  |
| `increment` | `() => void` |  |
| `decrement` | `() => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['label']` |  |
| `getInputProps` | `() => T['input']` |  |
| `getIncrementTriggerProps` | `() => T['button']` |  |
| `getDecrementTriggerProps` | `() => T['button']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowUp` | focus in input, not disabled/readOnly | 按 step 递增，越界则停在 max |
| `ArrowDown` | focus in input, not disabled/readOnly | 按 step 递减，越界则停在 min |
| `PageUp` | focus in input, not disabled/readOnly | 按 largeStep 递增（默认 10 倍 step） |
| `PageDown` | focus in input, not disabled/readOnly | 按 largeStep 递减 |
| `Home` | focus in input, 指定了 min | 取 min；未指定 min 时不动 |
| `End` | focus in input, 指定了 max | 取 max；未指定 max 时不动 |
