# 提示输入框 <Badge type="info" text="prompt-input" />

会话界面的输入框：值、输入法、能不能提交，以及发送与停止共用的那一颗按钮。

## 何时使用

- AI 对话、聊天或任何「输入一段话然后提交」的界面。
- 生成期间要能一键停止。

## 何时不用

- 只是表单里的一个多行文本域：用[文本框](./text-field)配[字段](./field)。
- 要 @提及或斜杠命令：整个用[提及](./mention)当输入器，见下方的组合。

## 特性

- 发送与停止**原位共用一个节点**：正在按它的用户不会按空。生成期间按钮恒可用，
  此刻它的语义是停止。
- `submitKey` 一个 prop 表达两档：`enter` 档 Enter 提交、Shift+Enter 换行、Mod+Enter 也提交；
  `mod-enter` 档 Enter 换行，只有 Mod+Enter 提交。
- 输入法组合期间的 Enter 一律放行，那一下是在确认候选词。
- 同一个输入框上叠了别的处理器且它已经处理过这一下时，组件让位。
- 自动长高是两行 CSS，不进状态机；引擎不支持时退化成 `rows` 定的固定行数。
- 两种排布同一份皮肤：直接把输入框与按钮放进 root 就是单行；套一层输入行，root 翻成竖排，
  输入行上下两侧就能再放附件条与动作行。
- 发送按钮留空时皮肤画兜底字形：发送身份一枚上箭头，停止身份一枚圆角方块；
  塞进自己的图标或文案即盖掉它。

## 示例

### 基础用法

Enter 提交、Shift+Enter 换行；输入法组合中的 Enter 一律放行，那一下是在确认候选词

<XhDemo src="prompt-input/01-basic" />

### 与消息流合成一个对话

发送键原位变停止；提交后粘底跟到最新一条，生成期间还能接着改下一句

<XhDemo src="prompt-input/02-chat" />

### 竖排布局与兜底字形

写一层输入行，root 就翻成竖排：输入行在上、动作行在下；按钮留空时皮肤按身份画上箭头或停止方块

<XhDemo src="prompt-input/03-layout" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-prompt-input>` |
| Vue 组件 | `XhPromptInputInput` `XhPromptInputInputRow` `XhPromptInputRoot` `XhPromptInputSubmitTrigger` |
| 组合式函数 | `usePromptInput` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/prompt-input.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="prompt-input"`：**`root`** · `input-row` · **`input`** · **`submit-trigger`**

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` |  |  |
| `defaultValue` | `string` |  |  |
| `disabled` | `boolean` |  |  |
| `busy` | `boolean` |  | 正在生成：按钮换成停止身份，所有提交路径被挡下。 用一个布尔而不是四档运行态字符串——组件只需要二值判断， 「这一轮走到哪一步」是宿主的事，透传成 data 属性属于作者的容器。 |
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

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `PromptInputValueChangeDetails` | 值变化；detail 为 `{ value: string }` |
| `submit` | `PromptInputSubmitDetails` | 提交；detail 为 `{ value: string }`，清空发生在派发之后。 与原生表单提交同名，故不冒泡，请直接在 `&lt;xh-prompt-input&gt;` 元素上监听 |
| `stop` | `` | 生成期间按下停止；无 detail |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhPromptInputRoot` | `default` | `PromptInputRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `input` | state.get() |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**事件**：`VALUE.SET` · `COMPOSITION.START` · `COMPOSITION.END` · `KEY.SUBMIT` · `SUBMIT` · `STOP` · `CONTROLLED.DISABLE` · `CONTROLLED.ENABLE` · `CONTROLLED.VALUE.EMPTY` · `CONTROLLED.VALUE.FILLED`

**判据**：`canSubmit` · `isBusy` · `isValueEmpty` · `isNextValueEmpty`

## connect API

`usePromptInput` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string` |  |
| `isComposing` | `boolean` |  |
| `canSubmit` | `boolean` | 能不能提交。比机器守卫多一条「非禁用」，供按钮置灰用。 |
| `busy` | `boolean` |  |
| `disabled` | `boolean` |  |
| `setValue` | `(next: string) => void` |  |
| `submit` | `() => void` |  |
| `stop` | `() => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getInputRowProps` | `() => T['element']` | 可选的输入行容器：渲了它，输入框与按钮并排收在这一行里，root 翻成竖排。 |
| `getInputProps` | `() => T['textarea']` |  |
| `getSubmitTriggerProps` | `() => T['button']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/WCAG21/Understanding/keyboard)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` | 焦点在输入框、submitKey 为 enter、非组合态、可提交，且这一下还没被别的处理器处理过 | 提交，并按 clearOnSubmit 决定清不清空 |
| `Shift+Enter` | 焦点在输入框 | 不归组件管：原样放行，浏览器插入换行 |
| `Control+Enter` / `Meta+Enter` | 焦点在输入框、非组合态、可提交 | 两档 submitKey 下都提交 |
| `Enter` | 输入法组合中 | 不提交也不拦截：这一下是在确认候选词 |
| `Enter` | 同一个输入框上叠了别的处理器且它已经处理过这一下 | 让位，本组件什么都不做 |
| `Enter` / `Space` | 焦点在发送按钮上 | 按当前身份触发提交或停止（原生按钮激活） |
| `Escape` | 任何时候 | 不接管：留给叠在输入框上的浮层与页面 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `input` | `aria-label` | translations?.input |
| `submit-trigger` | `aria-label` | translations?.stop \| translations?.send |

- 输入框的可访问名**只在给了 `translations.input` 时才发**：无条件发会盖掉作者自己的
  `<label for>` 与 `aria-label`。
- 按钮的可访问名随身份翻面，读屏念到的与屏幕上看到的是同一件事。

## 样式

默认皮肤 `@xihan-ui/styles/prompt-input.css` 按部件选择：`[data-scope="prompt-input"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-busy` | ''（条件成立时才出现） |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `input` | `data-state` | state.get() |
| `submit-trigger` | `data-mode` | 'stop' \| 'send' |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-prompt-input-bg` · `--xh-prompt-input-bg-disabled` · `--xh-prompt-input-border` · `--xh-prompt-input-border-focus` · `--xh-prompt-input-gap` · `--xh-prompt-input-icon-size` · `--xh-prompt-input-input-fg` · `--xh-prompt-input-input-font-size` · `--xh-prompt-input-max-h` · `--xh-prompt-input-p` · `--xh-prompt-input-placeholder-fg` · `--xh-prompt-input-radius` · `--xh-prompt-input-row-gap` · `--xh-prompt-input-send-bg` · `--xh-prompt-input-send-bg-active` · `--xh-prompt-input-send-bg-hover` · `--xh-prompt-input-send-bg-off` · `--xh-prompt-input-send-fg` · `--xh-prompt-input-shadow` · `--xh-prompt-input-stop-bg` · `--xh-prompt-input-stop-bg-active` · `--xh-prompt-input-stop-bg-hover` · `--xh-prompt-input-stop-fg` · `--xh-prompt-input-stop-mark-radius` · `--xh-prompt-input-stop-mark-size` · `--xh-prompt-input-submit-font-size` · `--xh-prompt-input-submit-font-weight` · `--xh-prompt-input-submit-px` · `--xh-prompt-input-submit-radius`

## 动效

状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 附件用[文件上传](./file-upload)：它已覆盖 accept、大小校验、拖拽投放与逐条删除；
  有附件而正文为空时把 `allowEmptySubmit` 置真。附件条摆在输入行上方，动作行摆在下方，
  两者都是 root 的直接子节点，与输入行并列。
- 粘贴上传由作者在输入框上自己挂 `onPaste`，处理器会与组件的链式组合。
- 模型选择器用[弹出选择](./popselect)或[组合框](./combobox)，工具开关用[开关组](./toggle-group)，
  它们连同自己的容器一起摆进输入行下方的那一段。
- 与[消息流](./message-feed)合起来就是一个最小对话界面。

## 最佳实践

- 受控用法下提交后由宿主清空；`clearOnSubmit` 关掉时组件不动值。
- 生成期间把 `busy` 置真而不是把整个输入框禁用：用户还要能改下一句。
- 要药丸形状不必换形态轴：在任意祖先上写一行 `--xh-prompt-input-radius: var(--xh-shape-pill)`，
  按钮那一颗另有 `--xh-prompt-input-submit-radius`。形态轴只管底与描边怎么画。

## 反模式

- 另起一颗停止按钮摆在旁边：两颗按钮的位置会互相挤，且按下去的那一刻它正好换了位置。
- 用 `disabled` 表达「正在生成」：那会连输入一起挡住，也把停止的出口一起关掉。
