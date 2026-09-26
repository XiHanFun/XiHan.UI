# PromptInput 提示输入框 <Badge type="info" text="alpha" />

会话界面的输入框：值、输入法、能否提交，以及发送与停止共用的按钮。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/prompt-input" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/prompt-input.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/prompt-input" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/prompt-input" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/prompt-input.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

Enter 提交、Shift+Enter 换行；输入法组合中的 Enter 一律放行，该按键是在确认候选词

<XhDemo src="prompt-input/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="prompt-input"`：**`root`** · `control` · **`input`** · **`submit-trigger`**

## 示例

### 与消息流组成一个对话

发送键原位变为停止；提交后粘底跟随到最新一条，生成期间仍可继续编辑下一句

<XhDemo src="prompt-input/02-chat" />

### 竖排布局与兜底字形

写一层输入行，root 即切换为竖排：输入行在上、动作行在下；按钮留空时皮肤按身份绘制箭头或停止方块

<XhDemo src="prompt-input/03-layout" />

### 三档提交按键

enter 档回车即发送、mod-enter 档只有 Ctrl/Cmd+Enter 发送、none 档两种按法都换行，提交只剩发送按钮

<XhDemo src="prompt-input/04-submit-key" />

### 禁用与空值

disabled 覆盖整框并使用原生 disabled；输入为空或只有空白时发送按钮转灰，但位置保留不收起

<XhDemo src="prompt-input/05-disabled" />

### 框内的附加节点

root 中除三件部件外还可放置自己的按钮与计数；值的读写归宿主，原生属性照常直接落到输入框上

<XhDemo src="prompt-input/06-extras" />

### 随内容增高

输入框的高度跟随内容，rows 决定起始行数；不手动拖拽，也不写死高度

<XhDemo src="prompt-input/07-autosize" />

### 聚焦与选中

输入部件就是一个原生 textarea，取得它的节点即可聚焦、全选、失焦；发送后把焦点送回，继续输入下一条

<XhDemo src="prompt-input/08-focus" />

### 发送失败的错误态

判定是否出错由宿主决定：属性直接落到真实元素上，整框换色依靠覆盖公开变量，原因由活区播报

<XhDemo src="prompt-input/09-invalid" />

### 颜色

tone 切换聚焦描边与发送按钮使用哪族颜色，输入与提交链路不受影响

<XhDemo src="prompt-input/10-tone" />

## 设计指引

### 何时使用

- AI 对话、聊天或任何输入一段话后提交的界面。
- 生成期间需要一键停止。

### 何时不用

- 只是表单中的多行文本域时，使用[文本字段](./text-field)配[表单字段](./field)。
- 需要 @提及或斜杠命令时，整体使用[提及](./mention)作为输入器，见下方的组合。

### 特性

- 发送与停止原位共用一个节点：正在按它的用户不会按空。生成期间按钮始终可用，此时它的语义是停止。
- `submitKey` 一个 prop 表达三档：`enter` 档 Enter 提交、Shift+Enter 换行、Mod+Enter 也提交；`mod-enter` 档 Enter 换行，只有 Mod+Enter 提交；`none` 档两种按法都换行，不保留任何键盘提交出口，只剩发送按钮与程序化的 `submit()`。
- 输入法组合期间的 Enter 一律放行，该按键用于确认候选词。
- 同一个输入框上叠加了其他处理器且它已处理该按键时，组件让位。
- 自动长高是两行 CSS，不进入状态机；引擎不支持时退化为 `rows` 决定的固定行数。
- 两种排布同一份皮肤：直接把输入框与按钮放进 root 是单行；套一层输入行后 root 变为竖排，输入行上下两侧可以再放附件条与动作行。
- 默认形态是 outline：不填底、`--xh-border-control` 描边、无影，不画顶光与背景模糊；输入段透明，底由外框承担。发送按钮与 Button 缺省同为品牌实心，生成中降为中性淡底的停止身份。
- 发送按钮留空时皮肤绘制兜底字形：发送身份为上箭头，停止身份为圆角方块；放入自定义图标或文案即覆盖。

### 组合

- 附件使用[文件上传](./file-upload)：它已覆盖 accept、大小校验、拖拽投放与逐条删除；有附件而正文为空时把 `allowEmptySubmit` 置真。附件条放在输入行上方，动作行放在下方，两者都是 root 的直接子节点，与输入行并列。
- 粘贴上传由作者在输入框上自行挂 `onPaste`，处理器会与组件的处理器链式组合。
- 模型选择器使用[选择器](./select)或[组合框](./combobox)，工具开关使用[切换按钮组](./toggle-group)，它们连同自己的容器一起放进输入行下方。
- 与[消息流](./message-feed)组合即是最小对话界面。

### 最佳实践

- 受控用法下提交后由宿主清空；`clearOnSubmit` 关闭时组件不改动值。
- 生成期间把 `loading` 置真而不是禁用整个输入框，用户仍需要编辑下一句。
- 需要胶囊形状时不必更换形态轴：在任意祖先上写 `--xh-prompt-input-radius: var(--xh-shape-pill)`，按钮另有 `--xh-prompt-input-submit-radius`。形态轴只决定底与描边的画法。

### 反模式

- 另起一个停止按钮放在旁边：两个按钮的位置会互相挤压，按下的瞬间位置也会变化。
- 用 `disabled` 表达正在生成：会连输入一起挡住，也关闭了停止的出口。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-prompt-input>` |
| Vue 组件 | `XhPromptInputControl` `XhPromptInputInput` `XhPromptInputRoot` `XhPromptInputSubmitTrigger` |
| 组合式函数 | `usePromptInput` |
| 状态机 | `promptInputMachine` |
| 皮肤 | `@xihan-ui/styles/prompt-input.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` |  |  |
| `defaultValue` | `string` |  |  |
| `disabled` | `boolean` |  |  |
| `loading` | `boolean` |  | 正在生成：按钮换为停止身份，所有提交路径被拦截。 使用一个布尔而不是四档运行态字符串：组件只需要二值判断， 本轮进行到哪一步是宿主的事，透传为 data 属性属于作者的容器。 |
| `submitKey` | `PromptInputSubmitKey` |  | 按哪一档提交，默认 enter。 |
| `allowEmptySubmit` | `boolean` |  | 允许空值提交，默认 false；有附件时由作者置真。这是唯一为附件保留的钩子。 |
| `clearOnSubmit` | `boolean` |  | 提交后清空，默认 true。 |
| `variant` | `ControlVariant` |  | 形态：outline / subtle / ghost，决定底色与描边的绘制方式。默认 outline。 |
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

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhPromptInputRoot` | `children` | `SlotChildren<PromptInputRootSlotProps>` |  |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `input` | 'empty' \| 'editing' \| 'disabled' |

以下名称仅用于内部状态机。

**状态**：`empty` · `editing` · `disabled`

**事件**：`VALUE.SET` · `COMPOSITION.START` · `COMPOSITION.END` · `KEY.SUBMIT` · `SUBMIT` · `STOP` · `CONTROLLED.DISABLE` · `CONTROLLED.ENABLE` · `CONTROLLED.VALUE.EMPTY` · `PRESS.START` · `PRESS.END` · `CONTROLLED.VALUE.FILLED`

**判据**：`canSubmit` · `isLoading` · `isValueEmpty` · `isNextValueEmpty` · `canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string` |  |
| `isComposing` | `boolean` |  |
| `canSubmit` | `boolean` | 是否可以提交。比状态机守卫多一条非禁用，供按钮置灰使用。 |
| `loading` | `boolean` |  |
| `disabled` | `boolean` |  |
| `setValue` | `(next: string) => void` |  |
| `submit` | `() => void` |  |
| `stop` | `() => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getControlProps` | `() => T['element']` | 可选的输入行容器：渲染它后，输入框与按钮并排收在这一行中，root 改为纵向排列。 |
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
| `Enter` / `Space` | held on submit-trigger, not disabled（发送身份要可提交，停止身份恒可用） | 按住期间按钮投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下，身份随 loading 切换或提交后清空使按钮转禁用时一并撤下 |
| `Escape` | 任何时候 | 不接管：留给叠在输入框上的浮层与页面 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `input` | `aria-label` | translations?.input |
| `submit-trigger` | `aria-label` | translations?.stop \| translations?.send |

- 输入框的可访问名称只在提供 `translations.input` 时才发出：无条件发出会覆盖作者自己的 `<label for>` 与 `aria-label`。
- 按钮的可访问名称随身份切换，读屏读到的与屏幕上看到的一致。
- 焦点由整框的 `:focus-within` 环表达；高对比、减少透明度、强制色与打印时外壳保持实体描边面。

## 样式参考

### 皮肤

`@xihan-ui/styles/prompt-input.css` 使用 `[data-scope="prompt-input"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-loading` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `root` | `data-xh-field-chrome` | '' |
| `root` | `data-xh-field-size` | props.size |
| `input` | `data-state` | 'empty' \| 'editing' \| 'disabled' |
| `input` | `data-xh-field-input` | '' |
| `submit-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `submit-trigger` | `data-mode` | 'stop' \| 'send' |
| `submit-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `submit-trigger` | `data-xh-action-control` | '' |
| `submit-trigger` | `data-xh-action-display` | 'always' |
| `submit-trigger` | `data-xh-action-profile` | 'text' |
| `submit-trigger` | `data-xh-action-size` | props.size |
| `submit-trigger` | `data-xh-action-variant` | 'subtle' \| 'solid' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-prompt-input-bg` | `root` | `background-color` | `xh-field-chrome` | `--xh-_field-variant-bg-rest` | prompt-input 的 root 部件 background-color 覆盖槽。 |
| `--xh-prompt-input-bg-disabled` | `root` | `background-color` | `disabled`<br>`xh-field-chrome` | `--xh-_field-variant-bg-disabled` | prompt-input 的 root 部件 background-color 覆盖槽。 |
| `--xh-prompt-input-bg-hover` | `root` | `background-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-hover` | prompt-input 的 root 部件 background-color 覆盖槽。 |
| `--xh-prompt-input-border` | `root` | `border` | `xh-field-chrome` | `--xh-_field-variant-border-rest` | prompt-input 的 root 部件 border 覆盖槽。 |
| `--xh-prompt-input-border-focus` | `root` | `border-color` | `disabled`<br>`focus-within`<br>`not([data-disabled])`<br>`xh-field-chrome` | `--xh-_field-variant-border-focus` | prompt-input 的 root 部件 border-color 覆盖槽。 |
| `--xh-prompt-input-border-hover` | `root` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-border-hover` | prompt-input 的 root 部件 border-color 覆盖槽。 |
| `--xh-prompt-input-gap` | `root` | `gap` | `xh-field-chrome` | `--xh-_prompt-input-gap` | prompt-input 的 root 部件 gap 覆盖槽。 |
| `--xh-prompt-input-icon-size` | `root` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=md`<br>`size=sm`<br>`xh-field-chrome` | `--xh-_field-size-glyph-size`<br>`--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` | prompt-input 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-prompt-input-input-autofill-bg` | `input` | `box-shadow` | `-webkit-autofill`<br>`autofill`<br>`xh-field-input` | `--xh-bg-canvas` | prompt-input 的 input 部件 box-shadow 覆盖槽。 |
| `--xh-prompt-input-input-autofill-fg` | `input` | `-webkit-text-fill-color` | `-webkit-autofill`<br>`autofill`<br>`xh-field-input` | `--xh-fg-default` | prompt-input 的 input 部件 -webkit-text-fill-color 覆盖槽。 |
| `--xh-prompt-input-input-fg` | `input` | `color` | `xh-field-input` | `--xh-fg-default` | prompt-input 的 input 部件 color 覆盖槽。 |
| `--xh-prompt-input-input-font-size` | `input` | `font-size`<br>`padding-block` | `default`<br>`xh-field-input` | `--xh-_prompt-input-font-size` | prompt-input 的 input 部件 font-size、padding-block 覆盖槽。 |
| `--xh-prompt-input-input-radius` | `input` | `border-radius` | `default` | `--xh-shape-inset` | prompt-input 的 input 部件 border-radius 覆盖槽。 |
| `--xh-prompt-input-max-h` | `input` | `max-block-size` | `default` | `--xh-leading-normal` | prompt-input 的 input 部件 max-block-size 覆盖槽。 |
| `--xh-prompt-input-p` | `root` | `--xh-prompt-input-computed-px`<br>`padding`<br>`padding-inline` | `default`<br>`xh-field-chrome` | `--xh-_prompt-input-px` | prompt-input 的 root 部件 --xh-prompt-input-computed-px、padding、padding-inline 覆盖槽。 |
| `--xh-prompt-input-placeholder-fg` | `input` | `color` | `placeholder`<br>`xh-field-input` | `--xh-fg-subtle` | prompt-input 的 input 部件 color 覆盖槽。 |
| `--xh-prompt-input-radius` | `root` | `border-radius` | `xh-field-chrome` | `--xh-shape-surface` | prompt-input 的 root 部件 border-radius 覆盖槽。 |
| `--xh-prompt-input-row-gap` | `control` | `gap` | `default` | `--xh-_prompt-input-gap` | prompt-input 的 control 部件 gap 覆盖槽。 |
| `--xh-prompt-input-send-bg` | `submit-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest` | prompt-input 的 submit-trigger 部件 --xh-ink-surface、background-color 覆盖槽。 |
| `--xh-prompt-input-send-bg-active` | `submit-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | prompt-input 的 submit-trigger 部件 background-color 覆盖槽。 |
| `--xh-prompt-input-send-bg-hover` | `submit-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | prompt-input 的 submit-trigger 部件 background-color 覆盖槽。 |
| `--xh-prompt-input-send-bg-off` | `submit-trigger` | `--xh-ink-surface`<br>`background-color` | `disabled`<br>`xh-ink-surface` | `--xh-bg-muted` | prompt-input 的 submit-trigger 部件 --xh-ink-surface、background-color 覆盖槽。 |
| `--xh-prompt-input-send-fg` | `submit-trigger` | `color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest` | prompt-input 的 submit-trigger 部件 color 覆盖槽。 |
| `--xh-prompt-input-shadow` | `root` | `box-shadow` | `xh-field-chrome` | `none` | prompt-input 的 root 部件 box-shadow 覆盖槽。 |
| `--xh-prompt-input-stop-bg` | `submit-trigger` | `--xh-ink-surface`<br>`background-color` | `mode=stop`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest` | prompt-input 的 submit-trigger 部件 --xh-ink-surface、background-color 覆盖槽。 |
| `--xh-prompt-input-stop-bg-active` | `submit-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`mode=stop`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | prompt-input 的 submit-trigger 部件 background-color 覆盖槽。 |
| `--xh-prompt-input-stop-bg-hover` | `submit-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`mode=stop`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | prompt-input 的 submit-trigger 部件 background-color 覆盖槽。 |
| `--xh-prompt-input-stop-fg` | `submit-trigger` | `color` | `disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`mode=stop`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest` | prompt-input 的 submit-trigger 部件 color 覆盖槽。 |
| `--xh-prompt-input-stop-mark-radius` | `submit-trigger` | `border-radius` | `empty`<br>`mode=stop` | `--xh-shape-inset` | prompt-input 的 submit-trigger 部件 border-radius 覆盖槽。 |
| `--xh-prompt-input-stop-mark-size` | `submit-trigger` | `block-size`<br>`inline-size` | `empty`<br>`mode=stop` | `--xh-icon-size` | prompt-input 的 submit-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-prompt-input-submit-font-size` | `submit-trigger` | `font-size` | `default` | `--xh-text-label-size` | prompt-input 的 submit-trigger 部件 font-size 覆盖槽。 |
| `--xh-prompt-input-submit-font-weight` | `submit-trigger` | `font-weight` | `default` | `--xh-text-label-weight` | prompt-input 的 submit-trigger 部件 font-weight 覆盖槽。 |
| `--xh-prompt-input-submit-px` | `submit-trigger` | `padding-inline` | `default` | `--xh-_prompt-input-submit-px` | prompt-input 的 submit-trigger 部件 padding-inline 覆盖槽。 |
| `--xh-prompt-input-submit-radius` | `submit-trigger` | `border-radius` | `default` | `--xh-shape-control` | prompt-input 的 submit-trigger 部件 border-radius 覆盖槽。 |
| `--xh-prompt-input-submit-shadow` | `submit-trigger` | `box-shadow` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_highlight-tone` | prompt-input 的 submit-trigger 部件 box-shadow 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：按压 · 状态（见[动效规范](../design/motion#角色)）。

`border-radius` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
