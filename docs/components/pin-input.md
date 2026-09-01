# 分格输入 <Badge type="info" text="pin-input" />

把一串短码拆成几个格子，一格一个字符。

## 何时使用

- 一次性验证码、支付密码、邀请码这类定长的短串。

## 何时不用

- 长度不固定或较长：用[文本输入](./text-field)。
- 输入的是密码：用 `type="password"` 的文本输入，密码管理器认得它。

## 特性

- `otp` 一开就接上平台的验证码自动填充。
- 粘贴一整串会按格拆开填进去。
- `mask` 遮蔽字符、`type` 与 `pattern` 限制可输入字符类别。
- `onValueComplete` 在填满那一刻发一次，用来自动提交。

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

### 分组排布

格子由作者逐个写出，中间插什么都行；下标接着排，跳格与整串粘贴仍按文档序走

<XhDemo src="pin-input/08-grouped" />

### 填满才可提交

每格都有字才算填满，作者据此点亮提交按钮；重填一次清空整组

<XhDemo src="pin-input/09-complete" />

### 只读

格子带上原生 readonly，值走受控且宿主不回写：能聚焦、能选中复制，改不动

<XhDemo src="pin-input/10-readonly" />

### 自定义准入字符

pattern 是一段正则源码，逐个字符整格匹配；写坏了退回 type 的准入表

<XhDemo src="pin-input/11-pattern" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-pin-input>` |
| Vue 组件 | `XhPinInputHiddenInput` `XhPinInputInput` `XhPinInputLabel` `XhPinInputRoot` |
| 组合式函数 | `usePinInput` |
| 状态机 | `pinInputMachine` |
| 皮肤 | `@xihan-ui/styles/pin-input.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="pin-input"`：**`root`** · `label` · **`input`** · `hidden-input`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string[]` |  | 逐格的值。给定即受控：cell 直读 prop，写只发 onValueChange 不落内部值。 |
| `defaultValue` | `string[]` |  |  |
| `length` | `number` |  | 格数，默认 6。值的长度恒被归一到它。 |
| `type` | `PinInputType` |  | 接受的字符类别，默认 numeric。同时决定移动端弹哪种键盘。 |
| `pattern` | `string` |  | 自定义准入：一段正则源码，逐个字符整格匹配（内部自动加首尾锚与 u 标志， 所以写 `[0-9A-Fa-f]` 即可，不必自己写 `^...$`）。给了它就盖过 type 的准入表。 弹哪种键盘仍由 type 说了算——准入放宽到字母时记得把 type 一并改掉， 否则移动端弹的还是数字键盘，用户敲不进那些字符。 写坏了（编不成正则）退回 type 的准入表，不抛。 |
| `mask` | `boolean` |  | 遮蔽显示：输入框转 type=password。 |
| `otp` | `boolean` |  | 一次性验证码：补 autocomplete=one-time-code，短信验证码才能被系统自动填入。 |
| `placeholder` | `string` |  | 空格子的占位字符。 |
| `disabled` | `boolean` |  | 禁用：每格都带原生 disabled（不可聚焦、不可输入），隐藏输入不参与提交。 |
| `invalid` | `boolean` |  | 校验失败标注。 |
| `blurOnComplete` | `boolean` |  | 填满即把焦点撤走，常用于"填满就自动提交"的表单。 |
| `name` | `string` |  | 表单字段名；给了隐藏输入才带 name，整串值随表单一并提交。 |
| `variant` | `ControlVariant` |  | 形态：outline / subtle / ghost，决定颜色怎么用。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `translations` | `Partial<PinInputTranslations>` |  |  |
| `onValueChange` | `(details: PinInputValueChangeDetails) => void` |  | value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |
| `onValueComplete` | `(details: PinInputValueChangeDetails) => void` |  | 每格都填满的那一刻触发；值没真变时不重复触发。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `PinInputValueChangeDetails` | 值变化；detail 为 `{ value: string[], valueAsString: string }` |
| `value-complete` | `PinInputValueChangeDetails` | 每格都填满；detail 同上 |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhPinInputRoot` | `default` | `PinInputRootSlotProps` |  |

## 状态

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle`

**事件**：`VALUE.SET` · `VALUE.FILL` · `VALUE.CLEAR_AT` · `VALUE.CLEAR` · `INPUT.FOCUS` · `INPUT.BLUR` · `FORM.RESET`

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

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-labelledby` | `label` 部件的 id |
| `root` | `role` | 'group' |
| `input` | `aria-invalid` | 'true' \| 'false' |
| `input` | `aria-label` | label.input(index + 1, length) |

## 样式

默认皮肤 `@xihan-ui/styles/pin-input.css` 按部件选择：`[data-scope="pin-input"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-complete` | ''（条件成立时才出现） |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `input` | `data-disabled` | ''（条件成立时才出现） |
| `input` | `data-focus` | ''（条件成立时才出现） |
| `input` | `data-index` | String(index) |
| `input` | `data-invalid` | ''（条件成立时才出现） |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-pin-input-box-bg` · `--xh-pin-input-box-bg-disabled` · `--xh-pin-input-box-border` · `--xh-pin-input-box-border-complete` · `--xh-pin-input-box-border-focus` · `--xh-pin-input-box-border-hover` · `--xh-pin-input-box-border-invalid` · `--xh-pin-input-box-fg` · `--xh-pin-input-box-font-size` · `--xh-pin-input-box-gap` · `--xh-pin-input-box-radius` · `--xh-pin-input-box-shadow` · `--xh-pin-input-box-size` · `--xh-pin-input-gap` · `--xh-pin-input-label-fg` · `--xh-pin-input-label-fg-disabled` · `--xh-pin-input-label-font-size` · `--xh-pin-input-label-font-weight` · `--xh-pin-input-placeholder-fg`

## 动效

状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 与[表单](./form)配合，填满才允许提交。

## 最佳实践

- 验证码务必开 `otp`，否则短信里的码要用户手打。
- 填满后自动提交，别让用户再找一次按钮。

## 反模式

- 格数超过八个：视觉上就不再是"一串短码"了。
- 遮蔽验证码：用户看不见自己输错在哪一位。
