# PinInput 分格输入 <Badge type="info" text="alpha" />

把一串短码拆成若干格子，一格一个字符。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/pin-input" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/pin-input.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/pin-input" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/pin-input" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/pin-input.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

每格都是原生输入框，输入一个字符自动跳到下一格；粘贴整串会从落点格起按格铺开

<XhDemo src="pin-input/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="pin-input"`：**`root`** · `label` · `group` · **`input`** · `separator` · `hidden-input`

## 示例

### 一次性验证码

otp 补上 autocomplete=one-time-code，隐藏输入把拼接后的整串交给表单，填满时发出 value-complete

<XhDemo src="pin-input/02-otp" />

### 遮蔽与字符类别

mask 把每格转为密码框，type 决定哪类字符可以输入，其余按键既不进入值也不留在框中

<XhDemo src="pin-input/03-mask" />

### 禁用与校验失败

disabled 使每格都带原生 disabled 且不参与提交，invalid 只做标注、照常可以修改

<XhDemo src="pin-input/04-disabled" />

### 变体

variant 只改变每格的颜色槽位，跳格与粘贴铺开的行为三档一致

<XhDemo src="pin-input/05-variant" />

### 颜色

tone 决定使用哪族颜色，与 variant 正交；这里固定 outline 只查看语气的差别

<XhDemo src="pin-input/06-tone" />

### 尺寸

每格的边长随 size 换档，不传 size 即默认档

<XhDemo src="pin-input/07-size" />

### 分组排布

格子由作者逐个写出，中间可插入任意内容；下标接续排列，跳格与整串粘贴仍按文档序进行

<XhDemo src="pin-input/08-grouped" />

### 填满才可提交

每格都有字符才算填满，作者据此启用提交按钮；重填一次清空整组

<XhDemo src="pin-input/09-complete" />

### 只读

格子带上原生 readonly，值受控且宿主不回写：可聚焦、可选中复制，不可修改

<XhDemo src="pin-input/10-readonly" />

### 自定义准入字符

pattern 是一段正则源码，逐个字符整格匹配；写法无效时退回 type 的准入表

<XhDemo src="pin-input/11-pattern" />

## 设计指引

### 何时使用

- 一次性验证码、支付密码、邀请码等定长的短串。

### 何时不用

- 长度不固定或较长时，使用[文本字段](./text-field)。
- 输入密码时，使用 `type="password"` 的文本输入，密码管理器能识别它。

### 特性

- `otp` 开启后接入平台的验证码自动填充。
- 按顺序录入：焦点落在第一个空格上，尚未轮到的格子既不可点击、也不是 Tab 停靠点；回退修改已填的格子照常可用，填满之后任一格都可修改。`readOnly` 与 `disabled` 不设此限制。
- 粘贴整串时按格拆开填入。
- `mask` 遮蔽字符，`type` 与 `pattern` 限制可输入的字符类别。
- `onValueComplete` 在填满时发出一次，用于自动提交。
- `group` 与 `separator` 把格子分段排列（123-456），下标仍按文档序计算。
- `readOnly` 让格子只能查看与复制，`required` 为每格补上原生必填。

### 组合

- 与[表单](./form)配合，填满后才允许提交。

### 最佳实践

- 验证码务必开启 `otp`，否则短信中的码需要用户手动输入。
- 填满后自动提交，不让用户再寻找按钮。

### 反模式

- 格数超过八个，视觉上不再是一串短码。
- 遮蔽验证码，用户无法看到输错的位置。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-pin-input>` |
| Vue 组件 | `XhPinInputGroup` `XhPinInputHiddenInput` `XhPinInputInput` `XhPinInputLabel` `XhPinInputRoot` `XhPinInputSeparator` |
| 组合式函数 | `usePinInput` |
| 状态机 | `pinInputMachine` |
| 皮肤 | `@xihan-ui/styles/pin-input.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string[]` |  | 逐格的值。提供即受控：cell 直读 prop，写入只发 onValueChange 不落内部值。 |
| `defaultValue` | `string[]` |  |  |
| `length` | `number` |  | 格数，默认 6。值的长度恒归一到它。 |
| `type` | `PinInputType` |  | 接受的字符类别，默认 numeric。同时决定移动端弹出的键盘类型。 |
| `pattern` | `string` |  | 自定义准入：一段正则源码，逐个字符整格匹配（内部自动加首尾锚与 u 标志， 因此写 `[0-9A-Fa-f]` 即可，不必自行写 `^...$`）。提供后覆盖 type 的准入表。 弹出的键盘类型仍由 type 决定：准入放宽到字母时需要把 type 一并修改， 否则移动端弹出的仍是数字键盘，用户无法输入这些字符。 无法编译为正则时回退为 type 的准入表，不抛错。 |
| `mask` | `boolean` |  | 遮蔽显示：输入框改为 type=password。 |
| `otp` | `boolean` |  | 一次性验证码：补充 autocomplete=one-time-code，短信验证码才能被系统自动填入。 |
| `placeholder` | `string` |  | 空格子的占位字符。 |
| `disabled` | `boolean` |  | 禁用：每格都带原生 disabled（不可聚焦、不可输入），隐藏输入不参与提交。 |
| `readOnly` | `boolean` |  | 只读：每格仍可聚焦、可复制，不可写入；隐藏输入照常参与提交。 |
| `required` | `boolean` |  | 必填标注：每格都带原生 required。 |
| `invalid` | `boolean` |  | 校验失败标注。 |
| `blurOnComplete` | `boolean` |  | 填满即移走焦点，常用于填满后自动提交的表单。 |
| `name` | `string` |  | 表单字段名；提供后隐藏输入才带 name，整串值随表单一并提交。 |
| `variant` | `ControlVariant` |  | 形态：outline / subtle / ghost，决定底色与描边的绘制方式。默认 outline。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定使用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `translations` | `Partial<PinInputTranslations>` |  |  |
| `onValueChange` | `(details: PinInputValueChangeDetails) => void` |  | value 变化意图回调；受控时是唯一出口，非受控时随内部写入一并通知。 |
| `onValueComplete` | `(details: PinInputValueChangeDetails) => void` |  | 每格都填满时触发；值未实际变化时不重复触发。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `PinInputValueChangeDetails` | 值变化；detail 为 `{ value: string[], valueAsString: string }` |
| `value-complete` | `PinInputValueChangeDetails` | 每格都填满；detail 同上 |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhPinInputRoot` | `default` | `PinInputRootSlotProps` |  |

### 状态

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`VALUE.SET` · `VALUE.FILL` · `VALUE.CLEAR_AT` · `VALUE.CLEAR` · `INPUT.FOCUS` · `INPUT.BLUR` · `FORM.RESET`

**判据**：`canEdit`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string[]` | 逐格的值，长度恒等于 length。 |
| `valueAsString` | `string` |  |
| `complete` | `boolean` | 每格都已填满。作者据此启用提交按钮。 |
| `length` | `number` |  |
| `focusedIndex` | `number` | 焦点应落在哪一格；焦点在组外时为 -1。按顺序录入时它不会越过第一个空格。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `setValue` | `(next: string[]) => void` |  |
| `clear` | `() => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['label']` |  |
| `getGroupProps` | `() => T['element']` | 相邻的几格划为一段（123-456 这类分段写法）；纯排版，不参与下标计算。 |
| `getInputProps` | `(props: PinInputInputProps) => T['input']` |  |
| `getSeparatorProps` | `() => T['element']` | 段与段之间的分隔；对读屏隐藏，朗读只会打断验证码。 |
| `getHiddenInputProps` | `() => T['input']` | 整份验证码的表单出口：一份 type=hidden 的原生输入，随表单提交拼接后的串。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/#textbox)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowRight` | focus in a box, not disabled | 焦点移到下一格；越不过第一个空格，已在末格则不动，不回绕 |
| `ArrowLeft` | focus in a box, not disabled | 焦点移到上一格；已在首格则不动，不回绕 |
| `Home` | focus in a box, not disabled | 焦点移到首格 |
| `End` | focus in a box, not disabled | 焦点移到最后一格可落焦的格子：填满时是末格，还有空格时是第一个空格 |
| `Backspace` | focus in a box, not disabled | 本格有值则清本格；本格为空则退回上一格并清掉上一格 |
| `Delete` | focus in a box, not disabled | 清掉本格，焦点不动 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-labelledby` | `label` 部件的 id |
| `root` | `role` | 'group' |
| `input` | `aria-invalid` | 'true' \| 'false' |
| `input` | `aria-label` | label.input(index + 1, length) |
| `separator` | `aria-hidden` | 'true' |

## 样式参考

### 皮肤

`@xihan-ui/styles/pin-input.css` 使用 `[data-scope="pin-input"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-complete` | ''（条件成立时才出现） |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `group` | `data-disabled` | ''（条件成立时才出现） |
| `group` | `data-invalid` | ''（条件成立时才出现） |
| `input` | `data-disabled` | ''（条件成立时才出现） |
| `input` | `data-empty` | ''（条件成立时才出现） |
| `input` | `data-focus` | ''（条件成立时才出现） |
| `input` | `data-index` | String(index) |
| `input` | `data-invalid` | ''（条件成立时才出现） |
| `input` | `data-readonly` | ''（条件成立时才出现） |
| `input` | `data-variant` | props.variant |
| `input` | `data-xh-field-chrome` | '' |
| `input` | `data-xh-field-size` | props.size |
| `separator` | `data-disabled` | ''（条件成立时才出现） |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-pin-input-box-autofill-bg` | `input` | `box-shadow` | `-webkit-autofill`<br>`autofill` | `--xh-bg-canvas` | pin-input 的 input 部件 box-shadow 覆盖槽。 |
| `--xh-pin-input-box-autofill-fg` | `input` | `-webkit-text-fill-color` | `-webkit-autofill`<br>`autofill` | `--xh-fg-default` | pin-input 的 input 部件 -webkit-text-fill-color 覆盖槽。 |
| `--xh-pin-input-box-bg` | `input` | `background-color` | `xh-field-chrome` | `--xh-_field-variant-bg-rest` | pin-input 的 input 部件 background-color 覆盖槽。 |
| `--xh-pin-input-box-bg-disabled` | `input` | `background-color` | `disabled`<br>`xh-field-chrome` | `--xh-_field-variant-bg-disabled` | pin-input 的 input 部件 background-color 覆盖槽。 |
| `--xh-pin-input-box-bg-hover` | `input` | `background-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-hover` | pin-input 的 input 部件 background-color 覆盖槽。 |
| `--xh-pin-input-box-bg-readonly` | `input` | `background-color` | `readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-read-only` | pin-input 的 input 部件 background-color 覆盖槽。 |
| `--xh-pin-input-box-border` | `input` | `border` | `xh-field-chrome` | `--xh-_field-variant-border-rest` | pin-input 的 input 部件 border 覆盖槽。 |
| `--xh-pin-input-box-border-complete` | `input`<br>`root` | `border-color` | `complete`<br>`invalid`<br>`not([data-invalid], :disabled)` | `--xh-_pin-input-accent` | pin-input 的 input、root 部件 border-color 覆盖槽。 |
| `--xh-pin-input-box-border-focus` | `input` | `border-color` | `disabled`<br>`focus`<br>`focus-within`<br>`not([data-disabled])`<br>`xh-field-chrome` | `--xh-_field-variant-border-focus` | pin-input 的 input 部件 border-color 覆盖槽。 |
| `--xh-pin-input-box-border-hover` | `input` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-border-hover` | pin-input 的 input 部件 border-color 覆盖槽。 |
| `--xh-pin-input-box-border-invalid` | `input` | `border-color` | `invalid`<br>`xh-field-chrome` | `--xh-_field-variant-border-invalid` | pin-input 的 input 部件 border-color 覆盖槽。 |
| `--xh-pin-input-box-fg` | `input` | `color` | `xh-field-chrome` | `--xh-fg-default` | pin-input 的 input 部件 color 覆盖槽。 |
| `--xh-pin-input-box-font-size` | `input` | `font-size` | `default` | `--xh-_pin-input-box-font-size` | pin-input 的 input 部件 font-size 覆盖槽。 |
| `--xh-pin-input-box-gap` | `input` | `margin-inline-start` | `default` | `--xh-_pin-input-box-gap` | pin-input 的 input 部件 margin-inline-start 覆盖槽。 |
| `--xh-pin-input-box-radius` | `input` | `border-radius` | `xh-field-chrome` | `--xh-shape-control` | pin-input 的 input 部件 border-radius 覆盖槽。 |
| `--xh-pin-input-box-shadow` | `input` | `box-shadow` | `xh-field-chrome` | `none` | pin-input 的 input 部件 box-shadow 覆盖槽。 |
| `--xh-pin-input-box-size` | `input` | `block-size`<br>`inline-size`<br>`min-block-size` | `default`<br>`has([data-xh-field-input][data-xh-field-layout='multi-tag'])`<br>`has([data-xh-field-input][data-xh-field-layout='single-line'])`<br>`has([data-xh-field-input][data-xh-field-layout='textarea'])`<br>`xh-field-chrome`<br>`xh-field-input`<br>`xh-field-layout=multi-tag`<br>`xh-field-layout=single-line`<br>`xh-field-layout=textarea` | `--xh-_pin-input-box-size` | pin-input 的 input 部件 block-size、inline-size、min-block-size 覆盖槽。 |
| `--xh-pin-input-gap` | `root` | `gap` | `default` | `--xh-space-1` | pin-input 的 root 部件 gap 覆盖槽。 |
| `--xh-pin-input-label-fg` | `label` | `color` | `default` | `--xh-fg-default` | pin-input 的 label 部件 color 覆盖槽。 |
| `--xh-pin-input-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-subtle` | pin-input 的 label 部件 color 覆盖槽。 |
| `--xh-pin-input-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` | pin-input 的 label 部件 font-size 覆盖槽。 |
| `--xh-pin-input-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | pin-input 的 label 部件 font-weight 覆盖槽。 |
| `--xh-pin-input-placeholder-fg` | `input` | `color` | `placeholder` | `--xh-fg-subtle` | pin-input 的 input 部件 color 覆盖槽。 |
| `--xh-pin-input-separator-fg` | `separator` | `color` | `default` | `--xh-fg-muted` | pin-input 的 separator 部件 color 覆盖槽。 |
| `--xh-pin-input-separator-fg-disabled` | `separator` | `color` | `disabled` | `--xh-fg-disabled` | pin-input 的 separator 部件 color 覆盖槽。 |
| `--xh-pin-input-separator-font-size` | `separator` | `font-size` | `default` | `--xh-_pin-input-box-font-size` | pin-input 的 separator 部件 font-size 覆盖槽。 |
| `--xh-pin-input-separator-gap` | `separator` | `margin-inline` | `default` | `--xh-_pin-input-box-gap` | pin-input 的 separator 部件 margin-inline 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
