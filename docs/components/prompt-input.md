# PromptInput 提示输入框

会话界面的输入框：值、输入法、能不能提交，以及发送与停止共用的那一颗按钮。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/prompt-input" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/prompt-input.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/prompt-input" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/prompt-input" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/prompt-input.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

Enter 提交、Shift+Enter 换行；输入法组合中的 Enter 一律放行，那一下是在确认候选词

<XhDemo src="prompt-input/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="prompt-input"`：**`root`** · `control` · **`input`** · **`submit-trigger`**

## 示例

### 与消息流合成一个对话

发送键原位变停止；提交后粘底跟到最新一条，生成期间还能接着改下一句

<XhDemo src="prompt-input/02-chat" />

### 竖排布局与兜底字形

写一层输入行，root 就翻成竖排：输入行在上、动作行在下；按钮留空时皮肤按身份画上箭头或停止方块

<XhDemo src="prompt-input/03-layout" />

### 三档提交按键

enter 档回车就发、mod-enter 档只有 Ctrl/Cmd+Enter 发、none 档两种按法都换行，提交只剩发送按钮

<XhDemo src="prompt-input/04-submit-key" />

### 禁用与空值

disabled 罩住整框并走原生 disabled；输入为空或只有空白时发送按钮转灰，但位置留着不收起

<XhDemo src="prompt-input/05-disabled" />

### 框里的附加节点

root 里除三件外还能放自己的按钮与计数；值的读写归宿主，原生属性照旧直接落到输入框上

<XhDemo src="prompt-input/06-extras" />

### 随内容长高

输入框的高度跟着内容走，rows 定的是起始行数；不手动拖拽，也不写死高度

<XhDemo src="prompt-input/07-autosize" />

### 聚焦与选中

输入部件就是一个原生 textarea，拿到它的节点就能聚焦、全选、失焦；发完一条把焦点送回去，接着敲下一条

<XhDemo src="prompt-input/08-focus" />

### 发送失败的错误态

判定谁算出错是宿主的事：属性直接落到真元素上，整框换色靠覆盖公开变量，原因由活区播报

<XhDemo src="prompt-input/09-invalid" />

### 语气

tone 换聚焦描边与发送钮用哪族颜色，输入与提交那条链不受影响

<XhDemo src="prompt-input/10-tone" />

## 设计指引

### 何时使用

- AI 对话、聊天或任何「输入一段话然后提交」的界面。
- 生成期间要能一键停止。

### 何时不用

- 只是表单里的一个多行文本域：用[文本框](./text-field)配[字段](./field)。
- 要 @提及或斜杠命令：整个用[提及](./mention)当输入器，见下方的组合。

### 特性

- 发送与停止**原位共用一个节点**：正在按它的用户不会按空。生成期间按钮恒可用，
  此刻它的语义是停止。
- `submitKey` 一个 prop 表达三档：`enter` 档 Enter 提交、Shift+Enter 换行、Mod+Enter 也提交；
  `mod-enter` 档 Enter 换行，只有 Mod+Enter 提交；`none` 档两种按法都换行，
  键盘一个提交出口都不留，只剩发送按钮与程序化的 `submit()`。
- 输入法组合期间的 Enter 一律放行，那一下是在确认候选词。
- 同一个输入框上叠了别的处理器且它已经处理过这一下时，组件让位。
- 自动长高是两行 CSS，不进状态机；引擎不支持时退化成 `rows` 定的固定行数。
- 两种排布同一份皮肤：直接把输入框与按钮放进 root 就是单行；套一层输入行，root 翻成竖排，
  输入行上下两侧就能再放附件条与动作行。
- 默认皮肤用 M3 浮动玻璃做外壳；textarea 保持同配方的实体阅读底，复杂背景不会透到输入文字下。
- 发送按钮留空时皮肤画兜底字形：发送身份一枚上箭头，停止身份一枚圆角方块；
  塞进自己的图标或文案即盖掉它。

### 组合

- 附件用[文件上传](./file-upload)：它已覆盖 accept、大小校验、拖拽投放与逐条删除；
  有附件而正文为空时把 `allowEmptySubmit` 置真。附件条摆在输入行上方，动作行摆在下方，
  两者都是 root 的直接子节点，与输入行并列。
- 粘贴上传由作者在输入框上自己挂 `onPaste`，处理器会与组件的链式组合。
- 模型选择器用[选择器](./select)或[组合框](./combobox)，工具开关用[开关组](./toggle-group)，
  它们连同自己的容器一起摆进输入行下方的那一段。
- 与[消息流](./message-feed)合起来就是一个最小对话界面。

### 最佳实践

- 受控用法下提交后由宿主清空；`clearOnSubmit` 关掉时组件不动值。
- 生成期间把 `loading` 置真而不是把整个输入框禁用：用户还要能改下一句。
- 要药丸形状不必换形态轴：在任意祖先上写一行 `--xh-prompt-input-radius: var(--xh-shape-pill)`，
  按钮那一颗另有 `--xh-prompt-input-submit-radius`。形态轴只管底与描边怎么画。

### 反模式

- 另起一颗停止按钮摆在旁边：两颗按钮的位置会互相挤，且按下去的那一刻它正好换了位置。
- 用 `disabled` 表达「正在生成」：那会连输入一起挡住，也把停止的出口一起关掉。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-prompt-input>` |
| Vue 组件 | `XhPromptInputControl` `XhPromptInputInput` `XhPromptInputRoot` `XhPromptInputSubmitTrigger` |
| 组合式函数 | `usePromptInput` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/prompt-input.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` |  |  |
| `defaultValue` | `string` |  |  |
| `disabled` | `boolean` |  |  |
| `loading` | `boolean` |  | 正在生成：按钮换成停止身份，所有提交路径被挡下。 用一个布尔而不是四档运行态字符串——组件只需要二值判断， 「这一轮走到哪一步」是宿主的事，透传成 data 属性属于作者的容器。 |
| `submitKey` | `PromptInputSubmitKey` |  | 按哪一档提交，默认 enter。 |
| `allowEmptySubmit` | `boolean` |  | 允许空值提交，默认 false；有附件时由作者置真。这是唯一为附件留的钩子。 |
| `clearOnSubmit` | `boolean` |  | 提交后清空，默认 true。 |
| `variant` | `ControlVariant` |  |  |
| `tone` | `Tone` |  |  |
| `size` | `Size` |  |  |
| `translations` | `Partial<PromptInputTranslations>` |  |  |
| `onValueChange` | `(details: PromptInputValueChangeDetails) => void` |  |  |
| `onSubmit` | `(details: PromptInputSubmitDetails) => void` |  |  |
| `onStop` | `() => void` |  |  |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `PromptInputValueChangeDetails` | 值变化；detail 为 `{ value: string }` |
| `submit` | `PromptInputSubmitDetails` | 提交；detail 为 `{ value: string }`，清空发生在派发之后。 与原生表单提交同名，故不冒泡，请直接在 `&lt;xh-prompt-input&gt;` 元素上监听 |
| `stop` | `` | 生成期间按下停止；无 detail |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhPromptInputRoot` | `default` | `PromptInputRootSlotProps` |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `input` | state.get() |

以下名称仅用于内部状态机。

**事件**：`VALUE.SET` · `COMPOSITION.START` · `COMPOSITION.END` · `KEY.SUBMIT` · `SUBMIT` · `STOP` · `CONTROLLED.DISABLE` · `CONTROLLED.ENABLE` · `CONTROLLED.VALUE.EMPTY` · `CONTROLLED.VALUE.FILLED`

**判据**：`canSubmit` · `isLoading` · `isValueEmpty` · `isNextValueEmpty`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string` |  |
| `isComposing` | `boolean` |  |
| `canSubmit` | `boolean` | 能不能提交。比机器守卫多一条「非禁用」，供按钮置灰用。 |
| `loading` | `boolean` |  |
| `disabled` | `boolean` |  |
| `setValue` | `(next: string) => void` |  |
| `submit` | `() => void` |  |
| `stop` | `() => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getControlProps` | `() => T['element']` | 可选的输入行容器：渲了它，输入框与按钮并排收在这一行里，root 翻成竖排。 |
| `getInputProps` | `() => T['textarea']` |  |
| `getSubmitTriggerProps` | `() => T['button']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/WCAG21/Understanding/keyboard)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` | 焦点在输入框、submitKey 为 enter、非组合态、可提交，且这一下还没被别的处理器处理过 | 提交，并按 clearOnSubmit 决定清不清空 |
| `Shift+Enter` | 焦点在输入框 | 不归组件管：原样放行，浏览器插入换行 |
| `Control+Enter` / `Meta+Enter` | 焦点在输入框、submitKey 为 enter 或 mod-enter、非组合态、可提交 | 提交，并按 clearOnSubmit 决定清不清空 |
| `Enter` / `Control+Enter` / `Meta+Enter` | 焦点在输入框、submitKey 为 none | 都不提交也不拦截：原样放行，浏览器插入换行；提交只剩按钮与程序化两条路 |
| `Enter` | 输入法组合中 | 不提交也不拦截：这一下是在确认候选词 |
| `Enter` | 同一个输入框上叠了别的处理器且它已经处理过这一下 | 让位，本组件什么都不做 |
| `Enter` / `Space` | 焦点在发送按钮上 | 按当前身份触发提交或停止（原生按钮激活） |
| `Escape` | 任何时候 | 不接管：留给叠在输入框上的浮层与页面 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `input` | `aria-label` | translations?.input |
| `submit-trigger` | `aria-label` | translations?.stop \| translations?.send |

- 输入框的可访问名**只在给了 `translations.input` 时才发**：无条件发会盖掉作者自己的
  `<label for>` 与 `aria-label`。
- 按钮的可访问名随身份翻面，读屏念到的与屏幕上看到的是同一件事。
- 焦点仍由整框的 `:focus-within` 环表达；高对比、减少透明度、强制色与打印时 M3 令牌会原位换成实体表面。

## 样式参考

### 皮肤

`@xihan-ui/styles/prompt-input.css` 使用 `[data-scope="prompt-input"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-loading` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `input` | `data-state` | state.get() |
| `submit-trigger` | `data-mode` | 'stop' \| 'send' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-prompt-input-bg` | `root` | `background` | `default` | `--xh-_prompt-input-bg` | prompt-input 的 root 部件 background 覆盖槽。 |
| `--xh-prompt-input-bg-disabled` | `root` | `background` | `disabled` | `--xh-bg-subtle` | prompt-input 的 root 部件 background 覆盖槽。 |
| `--xh-prompt-input-bg-hover` | `root` | `background` | `disabled`<br>`hover`<br>`not([data-disabled], :focus-within)` | `--xh-_prompt-input-bg-hover` | prompt-input 的 root 部件 background 覆盖槽。 |
| `--xh-prompt-input-border` | `root` | `border` | `default` | `--xh-_prompt-input-border` | prompt-input 的 root 部件 border 覆盖槽。 |
| `--xh-prompt-input-border-focus` | `root` | `border` | `focus-within` | `--xh-_prompt-input-border-focus` | prompt-input 的 root 部件 border 覆盖槽。 |
| `--xh-prompt-input-border-hover` | `root` | `border` | `disabled`<br>`hover`<br>`not([data-disabled], :focus-within)` | `--xh-_prompt-input-border-hover` | prompt-input 的 root 部件 border 覆盖槽。 |
| `--xh-prompt-input-gap` | `root` | `gap` | `default` | `--xh-_prompt-input-gap` | prompt-input 的 root 部件 gap 覆盖槽。 |
| `--xh-prompt-input-icon-size` | `root` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=md`<br>`size=sm` | `--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` | prompt-input 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-prompt-input-input-autofill-bg` | `input` | `box-shadow` | `-webkit-autofill`<br>`autofill` | `--xh-material-glass-focus-surface` | prompt-input 的 input 部件 box-shadow 覆盖槽。 |
| `--xh-prompt-input-input-autofill-fg` | `input` | `-webkit-text-fill-color` | `-webkit-autofill`<br>`autofill` | `--xh-material-glass-fg` | prompt-input 的 input 部件 -webkit-text-fill-color 覆盖槽。 |
| `--xh-prompt-input-input-fg` | `input` | `color` | `default` | `--xh-material-glass-fg` | prompt-input 的 input 部件 color 覆盖槽。 |
| `--xh-prompt-input-input-font-size` | `input` | `font-size`<br>`padding-block` | `default` | `--xh-_prompt-input-font-size` | prompt-input 的 input 部件 font-size、padding-block 覆盖槽。 |
| `--xh-prompt-input-input-radius` | `input` | `border-radius` | `default` | `--xh-shape-inset` | prompt-input 的 input 部件 border-radius 覆盖槽。 |
| `--xh-prompt-input-max-h` | `input` | `max-block-size` | `default` | `--xh-leading-normal` | prompt-input 的 input 部件 max-block-size 覆盖槽。 |
| `--xh-prompt-input-p` | `root` | `--xh-prompt-input-computed-px`<br>`padding` | `default` | `--xh-_prompt-input-px` | prompt-input 的 root 部件 --xh-prompt-input-computed-px、padding 覆盖槽。 |
| `--xh-prompt-input-placeholder-fg` | `input` | `color` | `placeholder` | `--xh-fg-subtle` | prompt-input 的 input 部件 color 覆盖槽。 |
| `--xh-prompt-input-radius` | `root` | `border-radius` | `default` | `--xh-shape-surface` | prompt-input 的 root 部件 border-radius 覆盖槽。 |
| `--xh-prompt-input-row-gap` | `control` | `gap` | `default` | `--xh-_prompt-input-gap` | prompt-input 的 control 部件 gap 覆盖槽。 |
| `--xh-prompt-input-send-bg` | `submit-trigger` | `background` | `default` | `--xh-_tone` | prompt-input 的 submit-trigger 部件 background 覆盖槽。 |
| `--xh-prompt-input-send-bg-active` | `submit-trigger` | `background` | `active`<br>`not(:disabled)` | `--xh-_tone-active` | prompt-input 的 submit-trigger 部件 background 覆盖槽。 |
| `--xh-prompt-input-send-bg-hover` | `submit-trigger` | `background` | `hover`<br>`not(:disabled)` | `--xh-_tone-hover` | prompt-input 的 submit-trigger 部件 background 覆盖槽。 |
| `--xh-prompt-input-send-bg-off` | `submit-trigger` | `background` | `disabled` | `--xh-bg-muted` | prompt-input 的 submit-trigger 部件 background 覆盖槽。 |
| `--xh-prompt-input-send-fg` | `submit-trigger` | `color` | `default` | `--xh-_tone-on` | prompt-input 的 submit-trigger 部件 color 覆盖槽。 |
| `--xh-prompt-input-shadow` | `root` | `box-shadow` | `default` | `--xh-_prompt-input-shadow` | prompt-input 的 root 部件 box-shadow 覆盖槽。 |
| `--xh-prompt-input-stop-bg` | `submit-trigger` | `background` | `mode=stop` | `--xh-bg-subtle` | prompt-input 的 submit-trigger 部件 background 覆盖槽。 |
| `--xh-prompt-input-stop-bg-active` | `submit-trigger` | `background` | `active`<br>`mode=stop`<br>`not(:disabled)` | `--xh-bg-subtle-active` | prompt-input 的 submit-trigger 部件 background 覆盖槽。 |
| `--xh-prompt-input-stop-bg-hover` | `submit-trigger` | `background` | `hover`<br>`mode=stop`<br>`not(:disabled)` | `--xh-bg-subtle-hover` | prompt-input 的 submit-trigger 部件 background 覆盖槽。 |
| `--xh-prompt-input-stop-fg` | `submit-trigger` | `color` | `mode=stop` | `--xh-fg-default` | prompt-input 的 submit-trigger 部件 color 覆盖槽。 |
| `--xh-prompt-input-stop-mark-radius` | `submit-trigger` | `border-radius` | `empty`<br>`mode=stop` | `--xh-shape-inset` | prompt-input 的 submit-trigger 部件 border-radius 覆盖槽。 |
| `--xh-prompt-input-stop-mark-size` | `submit-trigger` | `block-size`<br>`inline-size` | `empty`<br>`mode=stop` | `--xh-icon-size` | prompt-input 的 submit-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-prompt-input-submit-font-size` | `submit-trigger` | `font-size` | `default` | `--xh-text-label-size` | prompt-input 的 submit-trigger 部件 font-size 覆盖槽。 |
| `--xh-prompt-input-submit-font-weight` | `submit-trigger` | `font-weight` | `default` | `--xh-text-label-weight` | prompt-input 的 submit-trigger 部件 font-weight 覆盖槽。 |
| `--xh-prompt-input-submit-px` | `submit-trigger` | `padding-inline` | `default` | `--xh-_prompt-input-submit-px` | prompt-input 的 submit-trigger 部件 padding-inline 覆盖槽。 |
| `--xh-prompt-input-submit-radius` | `submit-trigger` | `border-radius` | `default` | `--xh-shape-control` | prompt-input 的 submit-trigger 部件 border-radius 覆盖槽。 |
| `--xh-prompt-input-submit-shadow` | `submit-trigger` | `box-shadow` | `default` | `--xh-_prompt-input-submit-highlight` | prompt-input 的 submit-trigger 部件 box-shadow 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`background` · `border-color` · `border-radius` · `box-shadow` · `color` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
