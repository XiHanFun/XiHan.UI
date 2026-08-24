# 消息编辑器 <Badge type="info" text="composer" />

对话界面底部那个输入框：写内容、提交，运行中可以停止。

## 何时使用

- AI 对话、聊天界面的输入区。
- 需要 Enter 提交、Shift + Enter 换行，并在生成中把提交钮换成停止钮。

## 何时不用

- 只是一个普通的多行输入：用[文本输入](./text-field)。
- 是一条评论的输入框且没有运行态：文本输入加一颗按钮就够。

## 特性

- 三件必备：`root` · `input` · `submit-trigger`，缺一不可。
- `runStatus` 驱动提交钮与停止钮的切换。
- 清空发生在 `submit` 派发之后：宿主拿得到这次提交的完整内容。
- `submitOnEnter` 可关，关掉后 Enter 只换行。
- 输入框可随内容长高；字数上限、输入过滤、附加按钮都由作者组合。

## 示例

### 基础用法

root / input / submit-trigger 三件缺一不可；Enter 提交、Shift+Enter 换行，清空发生在 submit 派发之后

<XhDemo src="composer/01-basic" />

### 流式与停止

run-status 翻成 streaming 后，发送按钮原位变停止：同一个节点、同一个位置，只换 data-mode 与可访问名

<XhDemo src="composer/02-streaming" />

### Enter 只换行

submit-on-enter 关掉后 Enter 交回浏览器插入换行，发送只剩按钮一条路

<XhDemo src="composer/03-enter" />

### 禁用与空值

disabled 罩住整框并走原生 disabled；输入为空或只有空白时发送按钮转灰，但位置留着不收起

<XhDemo src="composer/04-disabled" />

### 框里的附加按钮

root 里除输入与发送外还能放自己的节点；值的读写归宿主，清空这类操作就在框内完成

<XhDemo src="composer/05-clear" />

### 字数与上限

原生属性直接落到输入框上（maxlength 定上限），字数由宿主拿当前值现算

<XhDemo src="composer/06-count" />

### 随内容长高

输入框的高度跟着内容走，rows 定的是起始行数；不手动拖拽，也不写死高度

<XhDemo src="composer/07-autosize" />

### 过滤输入

写回这一步由宿主说了算：把不要的字符滤掉再落回去，框里留下的始终是滤过的那一份

<XhDemo src="composer/08-filter" />

### 聚焦与选中

输入部件就是一个原生 textarea，拿到它的节点就能聚焦、全选、失焦；发完一条把焦点送回去，接着敲下一条

<XhDemo src="composer/09-focus" />

### 发送失败的错误态

判定谁算出错是宿主的事：属性直接落到真元素上，整框换色靠覆盖公开变量，原因由活区播报

<XhDemo src="composer/10-status" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-composer>` |
| Vue 组件 | `XhComposerInput` `XhComposerRoot` `XhComposerSubmitTrigger` |
| 组合式函数 | `useComposer` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/composer.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="composer"`：**`root`** · **`input`** · **`submit-trigger`**

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` |  | 受控值，给了就由宿主写回。 |
| `defaultValue` | `string` |  | 非受控初值。 |
| `disabled` | `boolean` |  |  |
| `runStatus` | `ComposerRunStatus` |  | 宿主传入的运行态。 |
| `submitOnEnter` | `boolean` |  | Enter 直接提交、Shift+Enter 换行，默认 true。 |
| `translations` | `Partial<ComposerTranslations>` |  |  |
| `onValueChange` | `(details: ComposerValueChangeDetails) => void` |  |  |
| `onSubmit` | `(details: ComposerSubmitDetails) => void` |  |  |
| `onStop` | `() => void` |  |  |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `ComposerValueChangeDetails` | 值变化；detail 为 `{ value: string }` |
| `submit` | `ComposerSubmitDetails` | 提交；detail 为 `{ value: string }`，清空发生在派发之后。 与原生表单提交同名，故不冒泡，请直接在 `&lt;xh-composer&gt;` 元素上监听 |
| `stop` | `` | 流式期间按下停止；无 detail |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhComposerRoot` | `default` | `ComposerRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | props.runStatus |
| `input` | state.get() |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**事件**：`VALUE.SET` · `KEY.ENTER` · `COMPOSITION.START` · `COMPOSITION.END` · `SUBMIT` · `STOP` · `CONTROLLED.DISABLE` · `CONTROLLED.ENABLE` · `CONTROLLED.VALUE.EMPTY` · `CONTROLLED.VALUE.FILLED`

**判据**：`canSubmit` · `isStreaming` · `isValueEmpty` · `isNextValueEmpty`

## connect API

`useComposer` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string` |  |
| `isComposing` | `boolean` | 是否正在用输入法组合文字。 |
| `canSubmit` | `boolean` | 当前提交是否会真正发出，在机器守卫之外还额外要求非 disabled。 |
| `streaming` | `boolean` |  |
| `disabled` | `boolean` |  |
| `setValue` | `(value: string) => void` |  |
| `submit` | `() => void` |  |
| `stop` | `() => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getInputProps` | `() => T['textarea']` |  |
| `getSubmitTriggerProps` | `() => T['button']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` | 焦点在输入框、未处于 IME 组合态、submitOnEnter 为真且可提交 | 提交当前输入并清空 |
| `Shift+Enter` | 焦点在输入框 | 不归组件管：原样放行，浏览器插入换行 |
| `Enter` | 处于 IME 组合态（isComposing 为真） | 不提交：交给输入法确认候选词 |
| `Space` / `Enter` | 焦点在发送/停止按钮上 | 按 data-mode 触发提交或停止 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `input` | `aria-label` | translations?.input |
| `submit-trigger` | `aria-label` | translations?.stop \| translations?.send |

## 样式

默认皮肤 `@xihan-ui/styles/composer.css` 按部件选择：`[data-scope="composer"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-state` | props.runStatus |
| `root` | `data-status` | props.runStatus |
| `input` | `data-state` | state.get() |
| `submit-trigger` | `data-mode` | 'stop' \| 'send' |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-composer-bg` · `--xh-composer-bg-disabled` · `--xh-composer-border` · `--xh-composer-gap` · `--xh-composer-input-fg` · `--xh-composer-input-font-size` · `--xh-composer-p` · `--xh-composer-placeholder-fg` · `--xh-composer-radius` · `--xh-composer-root-border-focus` · `--xh-composer-send-bg` · `--xh-composer-send-bg-active` · `--xh-composer-send-bg-hover` · `--xh-composer-send-fg` · `--xh-composer-stop-bg` · `--xh-composer-stop-bg-active` · `--xh-composer-stop-bg-hover` · `--xh-composer-stop-fg` · `--xh-composer-submit-font-size` · `--xh-composer-submit-font-weight` · `--xh-composer-submit-h` · `--xh-composer-submit-px` · `--xh-composer-submit-radius`

## 动效

状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 上面接[会话线程](./thread)；框内插[提及](./mention)；附件用[文件上传](./file-upload)。

## 最佳实践

- 生成中一定要能停止，且停止后已生成的内容保留。
- 提交失败要保留用户输入的内容，别清空。

## 反模式

- Enter 提交却没有换行方式：写多行内容的用户会被迫用别处编辑再粘进来。
- 生成中禁用整个输入框，用户连下一句都不能先打好。
