# 数字输入 <Badge type="info" text="number-field" />

带加减与区间约束的数值输入。

## 何时使用

- 数量、价格、百分比这类需要精确到某一位的数值。
- 需要步进（键盘上下键、加减钮）。

## 何时不用

- 用户更关心相对位置而非精确值：用[滑块](./slider)。
- 值实际是编号或电话（不参与运算）：用[文本输入](./text-field)，数字输入的千分位与步进会碍事。

## 特性

- `step` 与 `largeStep` 分别对应方向键和 PageUp / PageDown。
- 长按加减钮连续步进，首跳延时与间隔都可调。
- `parse` / `format` 一对，用来接固定小数位、千分位、货币符号或自定义换算。
- 越界的值在提交时机被夹回区间。

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

触发器位置由作者写模板决定：放进 control 即减在左、加在右、输入框居中的一体式，不写 control 则照旧三件并排

<XhDemo src="number-field/09-trigger-placement" />

### 校验态

invalid 由宿主自己判定，不必挂在表单上；标出来之后值照样能改、加减钮照样能按

<XhDemo src="number-field/10-invalid" />

### 框内单位与货币符号

前后缀图标/文字直接流式插进 control：减在左、加在右、输入框居中，前后缀排在输入框两侧

<XhDemo src="number-field/11-affix" />

### 固定小数位

步进本身带定点规整，宿主在离开输入框与松开加减钮时把值补齐到两位小数

<XhDemo src="number-field/12-precision" />

### 提交时机

输入途中只动草稿，失焦或回车才把值交给业务模型；不合法就退回上一次提交的值

<XhDemo src="number-field/13-change-timing" />

### 自定义换算

parse 把显示串读成数、format 把数写回显示串；两个方向必须互逆，否则按一下加号值就会漂

<XhDemo src="number-field/14-parse-format" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-number-field>` |
| Vue 组件 | `XhNumberFieldControl` `XhNumberFieldDecrementTrigger` `XhNumberFieldIncrementTrigger` `XhNumberFieldInput` `XhNumberFieldLabel` `XhNumberFieldRoot` |
| 组合式函数 | `useNumberField` |
| 状态机 | `numberFieldMachine` |
| 皮肤 | `@xihan-ui/styles/number-field.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="number-field"`：**`root`** · `label` · `control` · **`input`** · `increment-trigger` · `decrement-trigger`

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
| `variant` | `ControlVariant` |  | 形态：outline / subtle / ghost，决定输入框与加减钮的底与描边怎么画。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定聚焦强调用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定输入框与加减钮的几何档位。 |
| `parse` | `(text: string) => number` |  | 显示串 → 数。默认按 `Number()` 读（'12abc' 判为非法），给了它就换成它—— 千位分隔符、单位后缀、百分号这类都靠这条读回来。读不出数返回 `NaN`。 与 `format` 必须互逆：`format` 出来的串要能被 `parse` 读回同一个数， 否则按一下加号值就会漂。 |
| `format` | `(value: number) => string` |  | 数 → 显示串。默认 `String(n)`。**只在组件自己改写显示时用**——步进、取端点、 失焦规范化这三处；用户正在打字时一律不碰，否则光标会被打断。 |
| `onValueChange` | `(details: NumberFieldValueChangeDetails) => void` |  |  |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `NumberFieldValueChangeDetails` | 值变化；detail 为 `{ value: string, valueAsNumber: number }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhNumberFieldRoot` | `default` | `NumberFieldRootSlotProps` |  |

## 状态

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle` · `spinning`

**事件**：`VALUE.SET` · `VALUE.STEP` · `VALUE.TO_MIN` · `VALUE.TO_MAX` · `INPUT.BLUR` · `PRESS.START` · `PRESS.END` · `after.changeInterval` · `FORM.RESET`

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
| `getControlProps` | `() => T['element']` | 输入框与加减钮的包裹层：皮肤把视觉盒画在它身上，减在左、加在右、输入框居中。 |
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

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `input` | `aria-invalid` | 'true' \| 'false' |
| `input` | `aria-labelledby` | `label` 部件的 id |
| `input` | `aria-valuemax` | props.max |
| `input` | `aria-valuemin` | props.min |
| `input` | `aria-valuenow` | undefined \| decodeNumber(value, { parse: prop('parse'), format: p… |
| `input` | `role` | 'spinbutton' |

## 样式

默认皮肤 `@xihan-ui/styles/number-field.css` 按部件选择：`[data-scope="number-field"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-empty` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-invalid` | ''（条件成立时才出现） |
| `control` | `data-readonly` | ''（条件成立时才出现） |
| `input` | `data-disabled` | ''（条件成立时才出现） |
| `input` | `data-invalid` | ''（条件成立时才出现） |
| `increment-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `decrement-trigger` | `data-disabled` | ''（条件成立时才出现） |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-number-field-control-gap` · `--xh-number-field-control-h` · `--xh-number-field-control-min-w` · `--xh-number-field-control-px` · `--xh-number-field-gap` · `--xh-number-field-icon-size` · `--xh-number-field-input-align` · `--xh-number-field-input-autofill-bg` · `--xh-number-field-input-autofill-fg` · `--xh-number-field-input-bg` · `--xh-number-field-input-bg-disabled` · `--xh-number-field-input-bg-readonly` · `--xh-number-field-input-border` · `--xh-number-field-input-border-focus` · `--xh-number-field-input-border-hover` · `--xh-number-field-input-border-invalid` · `--xh-number-field-input-fg` · `--xh-number-field-input-font-size` · `--xh-number-field-input-h` · `--xh-number-field-input-px` · `--xh-number-field-input-radius` · `--xh-number-field-input-shadow` · `--xh-number-field-input-w` · `--xh-number-field-label-fg` · `--xh-number-field-label-fg-disabled` · `--xh-number-field-label-font-size` · `--xh-number-field-label-font-weight` · `--xh-number-field-placeholder-fg` · `--xh-number-field-trigger-bg` · `--xh-number-field-trigger-bg-active` · `--xh-number-field-trigger-bg-disabled` · `--xh-number-field-trigger-bg-hover` · `--xh-number-field-trigger-border` · `--xh-number-field-trigger-border-disabled` · `--xh-number-field-trigger-border-hover` · `--xh-number-field-trigger-fg` · `--xh-number-field-trigger-fg-hover` · `--xh-number-field-trigger-font-size` · `--xh-number-field-trigger-radius` · `--xh-number-field-trigger-size`

## 动效

状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 外面套[表单字段](./field)；单位与货币符号放进框内前后缀。

## 最佳实践

- 给出 `min` / `max`，让键盘用户按住方向键时有个尽头。
- 显示格式与提交值分开：显示可以带千分位，提交的是纯数值。

## 反模式

- 加减钮做得太小：这是移动端最常见的误触来源。
- 用它输入年份、邮编、身份证号。
