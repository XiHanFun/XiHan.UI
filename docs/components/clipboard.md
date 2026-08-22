# 剪贴板 <Badge type="info" text="clipboard" />

把一段文本交给系统剪贴板，并把这次写入的结果如实报出来。

## 何时使用

- 页面上有需要原样带走的字符串：接口密钥、邀请链接、命令行、错误追踪号。

## 何时不用

- 要复制的是富文本或图片：本组件只处理纯文本。
- 内容需要用户先编辑再带走：用[文本输入](./text-field)。

## 特性

- 展示框是只读不是禁用：聚焦即全选，键盘用户照样能自己按 Ctrl / Cmd + C 带走。
- 写入是异步的也真的会失败：按下先进 `copying`，写成功才翻 `copied`，失败一律退回 `idle` 并把原因报出来。
- 必备部件只有 `root` 与 `trigger`：文本已经在页面上时，展示框与标题都可以省掉。
- `timeout` 决定成功指示保持多久，非正数即不自动回落。

## 示例

### 基础用法

展示框是只读不是禁用：聚焦即全选，键盘用户照样能用 Ctrl / Cmd + C 自己带走

<XhDemo src="clipboard/01-basic" />

### 只要一颗按钮

必备部件只有 root 与 trigger：文本已经在页面上时，展示框与标题都可以省掉

<XhDemo src="clipboard/02-trigger-only" />

### 状态与失败

写入是异步的也真的会失败：按下先进 copying，写成功才翻成 copied，失败一律退回 idle 并把原因报出来

<XhDemo src="clipboard/03-status" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-clipboard>` |
| Vue 组件 | `XhClipboardControl` `XhClipboardIndicator` `XhClipboardInput` `XhClipboardLabel` `XhClipboardRoot` `XhClipboardTrigger` |
| 组合式函数 | `useClipboard` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/clipboard.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="clipboard"`：**`root`** · `label` · `control` · `input` · **`trigger`** · `indicator`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` |  | 要复制的文本；缺省即复制空串。 |
| `timeout` | `number` |  | 复制成功后指示器保持多久（毫秒），默认 3000；&lt;=0 或非有限数表示不自动回落。 |
| `onStatusChange` | `(details: ClipboardStatusChangeDetails) => void` |  | 状态每次落位时通知一次；挂载那一刻的 idle 是初始态，不通知。 |
| `onCopyError` | `(details: ClipboardCopyErrorDetails) => void` |  | 写入失败时通知；此时状态已经回到 idle。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `status-change` | `ClipboardStatusChangeDetails` | 状态变化；detail 为 `{ status: 'copying' \| 'copied' \| 'idle' }` |
| `copy-error` | `ClipboardCopyErrorDetails` | 写入失败；detail 为 `{ error, value }`，此刻状态已经回到 idle |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhClipboardRoot` | `default` | `ClipboardRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | state.get() |
| `label` | state.get() |
| `control` | state.get() |
| `input` | state.get() |
| `trigger` | state.get() |
| `indicator` | state.get() |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**事件**：`COPY.TRIGGER` · `COPY.SUCCESS` · `COPY.ERROR` · `after.timeout`

## connect API

`useClipboard` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `status` | `ClipboardStatus` |  |
| `copied` | `boolean` | 已经复制成功且还在停留窗口内。指示器与样式的唯一判据。 |
| `value` | `string` | 当前要复制的文本（prop 缺省时是空串）。 |
| `copy` | `() => void` | 走一次复制意图，与点按钮同一条路。 |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['label']` |  |
| `getControlProps` | `() => T['element']` |  |
| `getInputProps` | `() => T['input']` |  |
| `getTriggerProps` | `() => T['button']` |  |
| `getIndicatorProps` | `(props: ClipboardIndicatorProps) => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://html.spec.whatwg.org/multipage/form-elements.html#the-button-element)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `input` | `aria-labelledby` | `label` 部件的 id |

## 样式

默认皮肤 `@xihan-ui/styles/clipboard.css` 按部件选择：`[data-scope="clipboard"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-copied` | ''（条件成立时才出现） |
| `root` | `data-state` | state.get() |
| `label` | `data-state` | state.get() |
| `control` | `data-state` | state.get() |
| `input` | `data-state` | state.get() |
| `trigger` | `data-copied` | ''（条件成立时才出现） |
| `trigger` | `data-state` | state.get() |
| `indicator` | `data-copied` | ''（条件成立时才出现） |
| `indicator` | `data-state` | state.get() |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-clipboard-control-gap` · `--xh-clipboard-gap` · `--xh-clipboard-indicator-fg-copied` · `--xh-clipboard-input-bg` · `--xh-clipboard-input-border` · `--xh-clipboard-input-border-focus` · `--xh-clipboard-input-fg` · `--xh-clipboard-input-font-size` · `--xh-clipboard-input-h` · `--xh-clipboard-input-min-w` · `--xh-clipboard-input-px` · `--xh-clipboard-input-radius` · `--xh-clipboard-label-fg` · `--xh-clipboard-label-font-size` · `--xh-clipboard-label-font-weight` · `--xh-clipboard-trigger-bg` · `--xh-clipboard-trigger-bg-active` · `--xh-clipboard-trigger-bg-hover` · `--xh-clipboard-trigger-border` · `--xh-clipboard-trigger-border-copied` · `--xh-clipboard-trigger-border-hover` · `--xh-clipboard-trigger-fg` · `--xh-clipboard-trigger-fg-copied` · `--xh-clipboard-trigger-font-size` · `--xh-clipboard-trigger-gap` · `--xh-clipboard-trigger-h` · `--xh-clipboard-trigger-px` · `--xh-clipboard-trigger-radius`

## 动效

状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 与[代码块](./code-block)搭配：代码块负责显示，剪贴板负责带走。
- 成功提示也可以改用[轻提示](./toast)，此时把 `indicator` 省掉。

## 最佳实践

- 复制失败要留可见的兜底路径——展示框就是那条路径，别为了好看把它藏掉。
- 触发器上的文字随状态换（复制 / 已复制），别只换图标颜色。

## 反模式

- 假定复制一定成功：非安全上下文、权限被拒、浏览器策略都会让它失败。
- 用它复制用户看不见的内容：用户无法核对自己带走了什么。
