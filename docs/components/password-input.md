# PasswordInput <Badge type="info" text="密码输入" />

一格密码框，带明暗切换钮，并在大写锁定开着时给出提示。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/password-input" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/password-input.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/password-input" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/password-input" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/password-input.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

root 持有状态，control 是那个视觉盒；不传 value 与 visible 即为非受控，明暗由组件自己管，钮里的图标跟着明暗换

<XhDemo src="password-input/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="password-input"`：**`root`** · `label` · `control` · **`input`** · **`visibility-trigger`** · `caps-lock-indicator` · `strength-meter`

## 示例

### 受控

值与明暗都能受控：传了就由宿主说了算，组件只把意图报出来，写不写回由宿主定

<XhDemo src="password-input/02-controlled" />

### 大写锁定提示

打开大写锁定再往框里敲一个字：提示显出来，读屏也会念一次；焦点离开输入框即熄灭

<XhDemo src="password-input/03-caps-lock" />

### 禁用与校验态

disabled 连明暗一起停掉，read-only 只锁值、明暗照切，invalid 只标注不拦输入

<XhDemo src="password-input/04-states" />

### 形态

variant 决定底与描边怎么画：描边、淡色填底、无框；密码框没有实心档

<XhDemo src="password-input/05-variant" />

### 语气

tone 决定用哪族颜色，与 variant 正交；这里固定 subtle 形态，语气的底色差别不必聚焦就看得见

<XhDemo src="password-input/06-tone" />

### 尺寸

size 只改高度、内边距与字号，标签、切换钮与大写锁定提示一起跟着换档；不写就是缺省档

<XhDemo src="password-input/07-size" />

### 注册表单

name 才让它参与提交，auto-complete 写成 new-password 密码管理器才去存新密码而不是填旧的

<XhDemo src="password-input/08-register" />

## 设计指引

### 何时使用

- 登录、注册、改密码这类要遮住输入内容的字段。
- 输错了要能自己核对：切成明文看一眼，再切回去。

### 何时不用

- 只要一格遮起来的输入、不需要明暗切换与大写锁定提示：用[文本输入](./text-field)的 `type="password"` 就够了，少一层结构。
- 收的是短验证码或一次性密码：用[分格输入](./pin-input)。
- 要在同一页比较两次输入是否一致：那是表单校验的活儿，交给[表单](./form)与[表单字段](./field)。

### 特性

- 明暗切换在 `visible` / `defaultVisible` 两态齐全，受控与非受控都走同一条路。
- 切换之后焦点留在切换钮上，框里的光标与选中范围原样放回。
- 大写锁定提示由按键事件驱动，焦点离开输入框即熄灭。
- `autoComplete` 缺省 `current-password`，注册表单要显式改成 `new-password`。
- `strength` 给 0–4 五档就显出强度条；打分算法归调用方，组件只把档位画出来。
- 形态 · 语气 · 尺寸三轴与[文本输入](./text-field)同源，并排放不会差一档。
- 一体式 `control` 保持实体 Field Chrome；显隐动作与输入/状态区之间有半高语义分隔，三尺寸和 compact 密度使用同一比例。
- 自动填充按当前形态、只读或禁用状态重画实体底与文字，不让浏览器注入的颜色把框切成异色段。

### 组合

- 外面套[表单字段](./field)拿标签、说明与错误文本。
- 切换钮里放[图标](./icon)，随明暗换一只眼睛。钮上带 `data-state`（`visible` / `hidden`），作者用自己的 CSS 按它切两枚图标即可；也可以从 root 的默认插槽拿 `visible`（Vue）或听 `visibility-change`（Web Components）自己换。皮肤不替作者切图标——库里不知道那两枚图标长什么样。

### 最佳实践

- 自己写角色节点时（Web Components 用法），三个角色必须用对标签：标题是原生 `<label>`、输入框是原生 `<input>`、切换钮是原生 `<button>`。标题的 `for` 恒写向输入框的 id，写成 `<span>` 就点不动；切换钮写成 `<div>` 就没有 Enter / Space 激活——两种都不报错，只是静默失效。
- 大写锁定提示这个节点也得由作者写出来（元素不生成结构），写成空壳即可，文字由组件填。Vue 侧这些由组件代劳，作者不会写错。
- 明文只在用户主动切开时出现，别默认 `defaultVisible`：屏幕背后有别人。
- 切换钮别在切开后消失或换位置：它承着焦点，一动键盘用户就丢了位置。
- `readOnly` 只禁止改值，不禁止显隐：用户仍可聚焦、复制和核对已有密码；`disabled` 才同时禁用输入与显隐动作。
- 大写锁定提示只提示，不拦提交：它是键盘的物理状态，用户可能就是要打大写。
- 注册表单把 `autoComplete` 写成 `new-password`，否则密码管理器会把旧密码填进来。

### 当前边界

- anatomy 尚无正式的 prefix/suffix 部件；`control` 中的作者节点目前只按统一 gap 排布，不承诺前后缀语义或专门状态。需要时应以独立三端部件提交，不能用 CSS 猜任意子节点职责。
- `control` 在 meta 中仍是可选部件，但共享 Field Chrome、组合焦点环与本次动作分隔都以它为边界；无 `control` 的结构只是独立输入框和按钮。是否把它提升为必需部件属于后续公共结构合同变更。

### 反模式

- 用它收「请再输一次」的确认格却不给自己的标签：读屏念出来的两格一模一样。
- 把明暗态存进接口或本地存储：下一次打开页面时密码是明着的。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-password-input>` |
| Vue 组件 | `XhPasswordInputCapsLockIndicator` `XhPasswordInputControl` `XhPasswordInputInput` `XhPasswordInputLabel` `XhPasswordInputRoot` `XhPasswordInputStrengthMeter` `XhPasswordInputVisibilityTrigger` |
| 组合式函数 | `usePasswordInput` |
| 状态机 | `passwordInputMachine` |
| 皮肤 | `@xihan-ui/styles/password-input.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` |  | 受控值；给了就由宿主说了算，机器不自改。 |
| `defaultValue` | `string` |  | 非受控初值。 |
| `visible` | `boolean` |  | 受控的明暗态；给了就由宿主说了算。 |
| `defaultVisible` | `boolean` |  | 非受控的初始明暗态，缺省隐藏。 |
| `disabled` | `boolean` |  |  |
| `readOnly` | `boolean` |  |  |
| `required` | `boolean` |  |  |
| `invalid` | `boolean` |  |  |
| `name` | `string` |  | 表单字段名；给了才参与提交。 |
| `placeholder` | `string` |  |  |
| `autoComplete` | `string` |  | 落到 input 上的 autocomplete，缺省 current-password。 密码管理器靠它决定这一格是填旧密码还是存新密码，注册表单要显式写 new-password。 |
| `strength` | `number` |  | 强度档位，0 到 4 共五档。给了才显出强度条，缺省不显。 打分算法归调用方：口令强弱是产品规则（字典、泄漏库、业务口径），组件只负责把档位画出来。 超出区间的值被夹回区间。 |
| `translations` | `Partial<PasswordInputTranslations>` |  | 读屏文案覆盖；没给的条目走组件内建英文。 |
| `variant` | `ControlVariant` |  | 形态：outline / subtle / ghost，决定颜色怎么用。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `onValueChange` | `(details: PasswordInputValueChangeDetails) => void` |  |  |
| `onVisibilityChange` | `(details: PasswordInputVisibilityChangeDetails) => void` |  |  |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `PasswordInputValueChangeDetails` | 值变化；detail 为 `{ value: string }` |
| `visibility-change` | `PasswordInputVisibilityChangeDetails` | 明暗变化；detail 为 `{ visible: boolean }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhPasswordInputRoot` | `default` | `PasswordInputRootSlotProps` |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `visibility-trigger` | 'visible' \| 'hidden' |
| `caps-lock-indicator` | 'visible' \| 'hidden' |

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`VALUE.SET` · `VISIBILITY.SET` · `VISIBILITY.TOGGLE` · `CAPS_LOCK.SET` · `FORM.RESET`

**判据**：`canEdit` · `canToggleVisibility`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string` |  |
| `empty` | `boolean` | 值为空串。 |
| `visible` | `boolean` | 此刻是否明文显示。 |
| `capsLock` | `boolean` | 大写锁定是否开着；为真时提示部件才显出来。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `inputType` | `PasswordInputType` | 输入框此刻的 type，随 visible 走。 |
| `capsLockMessage` | `string` | 大写锁定播报区里此刻的文字：开着时是 `translations.capsLockOn`，关着时是空串。 适配器把它落成提示部件的文本内容，读屏念的就是这一段。 |
| `strength` | `number \| undefined` | 夹回 0–4 后的强度档位；没给 strength 时是 undefined，此时强度条收起。 |
| `setValue` | `(next: string) => void` | 直接写值，只受 disabled / readOnly 约束。 |
| `setVisible` | `(next: boolean) => void` | 指定明暗态；整枚控件禁用时不生效。 |
| `toggleVisibility` | `() => void` | 翻转明暗态；整枚控件禁用时不生效。 |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['label']` |  |
| `getControlProps` | `() => T['element']` |  |
| `getInputProps` | `() => T['input']` |  |
| `getVisibilityTriggerProps` | `() => T['button']` |  |
| `getCapsLockIndicatorProps` | `() => T['element']` |  |
| `getStrengthMeterProps` | `() => T['element']` | 强度条：档位落在 data-level 与 aria-valuenow 上；没给 strength 时带 hidden 收起。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus on visibility-trigger, 控件未禁用 | 切换明暗；切换钮是原生 button，这两个键由平台翻成 click。焦点留在按钮上，框里的光标与选中范围原样放回 |
| `CapsLock` | focus in input | 每次按键都重读一次大写锁定状态：开着就亮起提示，焦点离开输入框即熄灭 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `input` | `aria-describedby` | `capsLock` 部件的 id \| undefined |
| `input` | `aria-invalid` | 'true' \| 'false' |
| `input` | `aria-labelledby` | `label` 部件的 id |
| `visibility-trigger` | `aria-controls` | `password-input-input` 部件的 id |
| `visibility-trigger` | `aria-label` | label.visibilityTriggerHide \| label.visibilityTriggerShow |
| `caps-lock-indicator` | `aria-atomic` | 'true' |
| `caps-lock-indicator` | `aria-live` | 'polite' |
| `caps-lock-indicator` | `role` | 'status' |
| `strength-meter` | `aria-label` | label.strengthMeter |
| `strength-meter` | `aria-valuemax` | 4 |
| `strength-meter` | `aria-valuemin` | 0 |
| `strength-meter` | `aria-valuenow` | undefined \| Math.min(Math.max(Math.trunc(rawStrength), 0), STRENG… |
| `strength-meter` | `role` | 'meter' |

- 切换钮的名字随状态换：隐藏时叫「显示密码」，显示时叫「隐藏密码」，两句都走 `translations`。名字既然已经说清了此刻是明是暗，就不再叠 `aria-pressed`——两个通道各说各的会念成「隐藏密码 已按下」，听的人反而分不清。
- 切换钮的 `aria-controls` 指向输入框，读屏能顺着它跳到被切换的那一格。
- 大写锁定提示是 `role="status"` 的活区域，节点恒在场、恒渲染，开与关只换区内文字。活区域播报的是内容变化，区域本身若被 `hidden` 或 `display: none` 撤下去，再出现时读屏当作插入了个新节点，多数不念——所以这一块不做按需挂载，也不靠收起与显出来触发播报。
- 提示区的文字就是 `translations.capsLockOn`，由组件写进节点，作者把这个节点留空即可；要配图标就往这个 part 上挂 `::before`。
- 焦点晚于提示出现的用户，靠输入框的 `aria-describedby` 也听得到同一句。
- 输入框恒带 `spellcheck="false"` / `autocapitalize="off"` / `autocorrect="off"`：切成明文那一刻它就是普通文本框，拼写检查会把框里的内容发去远端服务，移动端还会给首字母自动大写并按词典纠错。

## 样式参考

### 皮肤

`@xihan-ui/styles/password-input.css` 使用 `[data-scope="password-input"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

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
| `visibility-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `visibility-trigger` | `data-state` | 'visible' \| 'hidden' |
| `caps-lock-indicator` | `data-state` | 'visible' \| 'hidden' |
| `strength-meter` | `data-disabled` | ''（条件成立时才出现） |
| `strength-meter` | `data-level` | undefined \| String(strength) |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-password-input-caps-lock-fg` | `caps-lock-indicator` | `color` | `default` | `--xh-fg-muted` | password-input 的 caps-lock-indicator 部件 color 覆盖槽。 |
| `--xh-password-input-caps-lock-fg-disabled` | `caps-lock-indicator`<br>`control` | `color` | `disabled` | `--xh-fg-disabled` | password-input 的 caps-lock-indicator、control 部件 color 覆盖槽。 |
| `--xh-password-input-caps-lock-font-size` | `caps-lock-indicator` | `font-size` | `default` | `--xh-_password-input-caps-lock-font-size` | password-input 的 caps-lock-indicator 部件 font-size 覆盖槽。 |
| `--xh-password-input-control-bg` | `control` | `background` | `default` | `--xh-_password-input-bg` | password-input 的 control 部件 background 覆盖槽。 |
| `--xh-password-input-control-bg-disabled` | `control` | `background` | `disabled` | `--xh-bg-subtle` | password-input 的 control 部件 background 覆盖槽。 |
| `--xh-password-input-control-bg-hover` | `control` | `background` | `disabled`<br>`hover`<br>`invalid`<br>`not([data-disabled], [data-readonly], [data-invalid])`<br>`readonly` | `--xh-_password-input-bg-hover` | password-input 的 control 部件 background 覆盖槽。 |
| `--xh-password-input-control-bg-readonly` | `control` | `background` | `readonly` | `--xh-bg-subtle` | password-input 的 control 部件 background 覆盖槽。 |
| `--xh-password-input-control-border` | `control` | `border` | `default` | `--xh-_password-input-border` | password-input 的 control 部件 border 覆盖槽。 |
| `--xh-password-input-control-border-focus` | `control` | `border-color` | `disabled`<br>`focus-within`<br>`not([data-disabled])` | `--xh-_password-input-border-focus` | password-input 的 control 部件 border-color 覆盖槽。 |
| `--xh-password-input-control-border-hover` | `control` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`not([data-disabled], [data-readonly], [data-invalid])`<br>`readonly` | `--xh-_password-input-border-hover` | password-input 的 control 部件 border-color 覆盖槽。 |
| `--xh-password-input-control-border-invalid` | `control` | `border-color` | `invalid` | `--xh-border-invalid` | password-input 的 control 部件 border-color 覆盖槽。 |
| `--xh-password-input-control-gap` | `control`<br>`input`<br>`visibility-trigger` | `gap`<br>`inset-inline-end`<br>`inset-inline-start` | `default`<br>`has(~ [data-scope='password-input'][data-part='input'])` | `--xh-_password-input-gap` | password-input 的 control、input、visibility-trigger 部件 gap、inset-inline-end、inset-inline-start 覆盖槽。 |
| `--xh-password-input-control-h` | `control` | `block-size` | `default` | `--xh-_password-input-h` | password-input 的 control 部件 block-size 覆盖槽。 |
| `--xh-password-input-control-min-w` | `control`<br>`root` | `min-inline-size` | `default` | `--xh-control-min-w` | password-input 的 control、root 部件 min-inline-size 覆盖槽。 |
| `--xh-password-input-control-px` | `control` | `padding-inline` | `default` | `--xh-_password-input-px` | password-input 的 control 部件 padding-inline 覆盖槽。 |
| `--xh-password-input-control-radius` | `control` | `border-radius` | `default` | `--xh-shape-control` | password-input 的 control 部件 border-radius 覆盖槽。 |
| `--xh-password-input-control-shadow` | `control` | `box-shadow` | `default` | `--xh-_password-input-shadow` | password-input 的 control 部件 box-shadow 覆盖槽。 |
| `--xh-password-input-gap` | `root` | `gap` | `default` | `--xh-space-1` | password-input 的 root 部件 gap 覆盖槽。 |
| `--xh-password-input-icon-size` | `root` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=sm` | `--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` | password-input 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-password-input-input-autofill-bg` | `control`<br>`input` | `box-shadow` | `-webkit-autofill`<br>`autofill` | `--xh-_password-input-autofill-bg` | password-input 的 control、input 部件 box-shadow 覆盖槽。 |
| `--xh-password-input-input-autofill-fg` | `input` | `-webkit-text-fill-color` | `-webkit-autofill`<br>`autofill` | `--xh-_password-input-autofill-fg` | password-input 的 input 部件 -webkit-text-fill-color 覆盖槽。 |
| `--xh-password-input-input-bg` | `input` | `background` | `default` | `--xh-_password-input-bg` | password-input 的 input 部件 background 覆盖槽。 |
| `--xh-password-input-input-bg-disabled` | `input` | `background` | `disabled` | `--xh-bg-subtle` | password-input 的 input 部件 background 覆盖槽。 |
| `--xh-password-input-input-bg-hover` | `input` | `background` | `hover`<br>`invalid`<br>`not(:disabled, [readonly], [data-invalid])` | `--xh-_password-input-bg-hover` | password-input 的 input 部件 background 覆盖槽。 |
| `--xh-password-input-input-bg-readonly` | `input` | `background` | `default` | `--xh-bg-subtle` | password-input 的 input 部件 background 覆盖槽。 |
| `--xh-password-input-input-border` | `input` | `border` | `default` | `--xh-_password-input-border` | password-input 的 input 部件 border 覆盖槽。 |
| `--xh-password-input-input-border-focus` | `input` | `border-color` | `focus-visible` | `--xh-_password-input-border-focus` | password-input 的 input 部件 border-color 覆盖槽。 |
| `--xh-password-input-input-border-hover` | `input` | `border-color` | `hover`<br>`invalid`<br>`not(:disabled, [readonly], [data-invalid])` | `--xh-_password-input-border-hover` | password-input 的 input 部件 border-color 覆盖槽。 |
| `--xh-password-input-input-border-invalid` | `input` | `border-color` | `invalid` | `--xh-border-invalid` | password-input 的 input 部件 border-color 覆盖槽。 |
| `--xh-password-input-input-fg` | `input` | `color` | `default` | `--xh-fg-default` | password-input 的 input 部件 color 覆盖槽。 |
| `--xh-password-input-input-font-size` | `input` | `font-size` | `default` | `--xh-_password-input-font-size` | password-input 的 input 部件 font-size 覆盖槽。 |
| `--xh-password-input-input-h` | `input` | `block-size` | `default` | `--xh-_password-input-h` | password-input 的 input 部件 block-size 覆盖槽。 |
| `--xh-password-input-input-min-w` | `input` | `min-inline-size` | `default` | `--xh-control-min-w` | password-input 的 input 部件 min-inline-size 覆盖槽。 |
| `--xh-password-input-input-px` | `input` | `padding-inline` | `default` | `--xh-_password-input-px` | password-input 的 input 部件 padding-inline 覆盖槽。 |
| `--xh-password-input-input-radius` | `input` | `border-radius` | `default` | `--xh-shape-control` | password-input 的 input 部件 border-radius 覆盖槽。 |
| `--xh-password-input-input-shadow` | `input` | `box-shadow` | `-webkit-autofill`<br>`autofill`<br>`default` | `--xh-_password-input-shadow` | password-input 的 input 部件 box-shadow 覆盖槽。 |
| `--xh-password-input-label-fg` | `label` | `color` | `default` | `--xh-fg-default` | password-input 的 label 部件 color 覆盖槽。 |
| `--xh-password-input-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-subtle` | password-input 的 label 部件 color 覆盖槽。 |
| `--xh-password-input-label-font-size` | `label` | `font-size` | `default` | `--xh-_password-input-label-font-size` | password-input 的 label 部件 font-size 覆盖槽。 |
| `--xh-password-input-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | password-input 的 label 部件 font-weight 覆盖槽。 |
| `--xh-password-input-placeholder-fg` | `input` | `color` | `placeholder` | `--xh-fg-subtle` | password-input 的 input 部件 color 覆盖槽。 |
| `--xh-password-input-strength-fg` | `strength-meter` | `background` | `empty` | `--xh-_password-input-strength-fg` | password-input 的 strength-meter 部件 background 覆盖槽。 |
| `--xh-password-input-strength-radius` | `strength-meter` | `border-radius` | `default` | `--xh-shape-pill` | password-input 的 strength-meter 部件 border-radius 覆盖槽。 |
| `--xh-password-input-strength-thickness` | `strength-meter` | `block-size` | `default` | `--xh-track-thickness` | password-input 的 strength-meter 部件 block-size 覆盖槽。 |
| `--xh-password-input-strength-track` | `strength-meter` | `background` | `default` | `--xh-bg-subtle-active` | password-input 的 strength-meter 部件 background 覆盖槽。 |
| `--xh-password-input-trigger-bg` | `visibility-trigger` | `background` | `default`<br>`disabled` | `transparent` | password-input 的 visibility-trigger 部件 background 覆盖槽。 |
| `--xh-password-input-trigger-bg-active` | `visibility-trigger` | `background` | `active`<br>`not(:disabled)` | `--xh-bg-subtle-active` | password-input 的 visibility-trigger 部件 background 覆盖槽。 |
| `--xh-password-input-trigger-bg-hover` | `visibility-trigger` | `background` | `hover`<br>`not(:disabled)` | `--xh-bg-subtle-hover` | password-input 的 visibility-trigger 部件 background 覆盖槽。 |
| `--xh-password-input-trigger-fg` | `visibility-trigger` | `color` | `default` | `--xh-fg-muted` | password-input 的 visibility-trigger 部件 color 覆盖槽。 |
| `--xh-password-input-trigger-fg-hover` | `visibility-trigger` | `color` | `hover`<br>`not(:disabled)` | `--xh-fg-default` | password-input 的 visibility-trigger 部件 color 覆盖槽。 |
| `--xh-password-input-trigger-font-size` | `visibility-trigger` | `font-size` | `default` | `--xh-_password-input-trigger-font-size` | password-input 的 visibility-trigger 部件 font-size 覆盖槽。 |
| `--xh-password-input-trigger-radius` | `visibility-trigger` | `border-radius` | `default` | `--xh-shape-control` | password-input 的 visibility-trigger 部件 border-radius 覆盖槽。 |
| `--xh-password-input-trigger-size` | `visibility-trigger` | `block-size`<br>`inline-size` | `default` | `--xh-control-action-size` | password-input 的 visibility-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-password-input-visibility-trigger-separator-color` | `control`<br>`input`<br>`visibility-trigger` | `border-inline-start` | `has(~ [data-scope='password-input'][data-part='input'])` | `--xh-border-subtle` | password-input 的 control、input、visibility-trigger 部件 border-inline-start 覆盖槽。 |
| `--xh-password-input-visibility-trigger-separator-h` | `control`<br>`input`<br>`visibility-trigger` | `block-size`<br>`inset-block-start` | `has(~ [data-scope='password-input'][data-part='input'])` | `--xh-_password-input-divider-h` | password-input 的 control、input、visibility-trigger 部件 block-size、inset-block-start 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`background` · `border-color` · `color` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
