# 工具调用 <Badge type="info" text="tool-call" />

一次工具调用的卡片：阶段、参数与结果，跑起来自动展开、结束自动收起，用户动手过一次就不再自动。

## 何时使用

- Agent 界面里展示「它正在做什么」：查了什么、传了什么参数、拿回了什么。
- 一次调用要先经人批准才能执行。

## 何时不用

- 展示的是「思考过程」而不是一次调用：用[思考过程](./reasoning)，两者共用同一台机器但正文形态不同。
- 只想要一个状态色块：用[徽章](./badge)，配 `toneOfToolCallPhase(phase)` 取语气。
- 多次调用要一次只展开一张：外面套[手风琴](./accordion)，每格里装一张。

## 特性

- 五档阶段：参数在传、参数齐了、等人批准、已完成、出错了。
  **「等人批准」不是「在跑」**——协议层的审批只改审批状态、不改工具状态，
  没有这一档的话等人的调用会被当成在跑。
- **自动开合的锁存靠转移的放置位置，不靠一个布尔位**：用户点过一次之后，
  阶段变化在结构上就够不着任何转移，自动开合永久停用。
- 审批闸门常驻在开关与详情之间，不会被折叠藏起来。
- 收起走 `hidden` + `inert`：退场动画播完之前内容还在渲染，`inert` 把这段窗口挡在读屏与 Tab 序之外。

## 示例

### 五档阶段

等人批准不是在跑：闸门常驻在开关与详情之间，不会被折叠藏起来

<XhDemo src="tool-call/01-phases" />

### 自动开合与锁存

跑起来自动展开、结束自动收起；你手动开合过一次之后，阶段怎么变都不再自动

<XhDemo src="tool-call/02-auto-disclosure" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-tool-call>` |
| Vue 组件 | `XhToolCallApproval` `XhToolCallContent` `XhToolCallError` `XhToolCallIndicator` `XhToolCallInput` `XhToolCallName` `XhToolCallOutput` `XhToolCallRoot` `XhToolCallStatus` `XhToolCallTrigger` |
| 组合式函数 | `useToolCall` |
| 状态机 | `toolCallMachine` |
| 皮肤 | `@xihan-ui/styles/tool-call.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="tool-call"`：**`root`** · **`trigger`** · `indicator` · `name` · `status` · `approval` · **`content`** · `input` · `output` · `error`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `running` | `boolean` |  | 这次调用正在跑。适配器用 isToolCallRunning(phase) 折出来，作者只写 phase。 |
| `open` | `boolean` |  |  |
| `defaultOpen` | `boolean` |  |  |
| `autoDisclosure` | `boolean` |  | 跑起来自动展开、结束自动收起，默认开；用户手动开合过一次即永久停用。 |
| `disabled` | `boolean` |  |  |
| `onOpenChange` | `(details: ToolCallOpenChangeDetails) => void` |  |  |
| `phase` | `ToolCallPhase` |  | 这次调用走到哪一步，默认 input-available。 |
| `size` | `Size` |  |  |
| `tone` | `Tone` |  |  |
| `translations` | `Partial<ToolCallTranslations>` |  |  |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `open-change` | `ToolCallOpenChangeDetails` | 开合变化；detail 为 `{ open: boolean, source: 'user' \| 'auto' \| 'api' }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhToolCallRoot` | `default` | `ToolCallRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `indicator` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`auto.collapsed` · `auto.expanded` · `held.collapsed` · `held.expanded`

**事件**：`TOGGLE` · `OPEN` · `CLOSE` · `PHASE.ACTIVE` · `PHASE.SETTLE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE`

**判据**：`isOpenControlled` · `isAutoAllowed` · `isAutoEnabled`

## connect API

`useToolCall` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `phase` | `ToolCallPhase` |  |
| `running` | `boolean` | 这一档算不算在跑。 |
| `disabled` | `boolean` |  |
| `statusText` | `string` | 读屏用的一句话，由宿主写进会话级的那一个播报区。 |
| `setOpen` | `(next: boolean) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getTriggerProps` | `() => T['button']` |  |
| `getIndicatorProps` | `() => T['element']` |  |
| `getNameProps` | `() => T['element']` |  |
| `getStatusProps` | `() => T['element']` |  |
| `getApprovalProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getInputProps` | `() => T['element']` |  |
| `getOutputProps` | `() => T['element']` |  |
| `getErrorProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | 焦点在折叠开关上且未禁用 | 展开或收起详情，并把自动开合永久停用 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-describedby` | `error` 部件的 id \| undefined |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `indicator` | `aria-hidden` | 'true' |
| `content` | `aria-labelledby` | `trigger` 部件的 id |
| `content` | `role` | 'region' |

- 开关带 `aria-expanded` 与 `aria-controls`，详情区是 `role=region` 且由开关命名。
- 出错时开关才补 `aria-describedby` 指向错误区——无条件挂会指向一个作者根本没渲的节点。
- 卡片自己不开活区：一屏若干张卡各开一个会互相打断。播报文本由 `statusText` 交出去，
  由宿主写进会话级的那一个播报区。

## 样式

默认皮肤 `@xihan-ui/styles/tool-call.css` 按部件选择：`[data-scope="tool-call"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-phase` | props.phase |
| `root` | `data-running` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-tone` | props.tone |
| `trigger` | `data-disabled` | ''（条件成立时才出现） |
| `trigger` | `data-phase` | props.phase |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `indicator` | `data-state` | 'open' \| 'closed' |
| `name` | `data-phase` | props.phase |
| `status` | `data-phase` | props.phase |
| `approval` | `data-phase` | props.phase |
| `content` | `data-state` | 'open' \| 'closed' |
| `input` | `data-phase` | props.phase |
| `output` | `data-phase` | props.phase |
| `error` | `data-phase` | props.phase |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-tool-call-bg` · `--xh-tool-call-border` · `--xh-tool-call-border-error` · `--xh-tool-call-content-gap` · `--xh-tool-call-error-fg` · `--xh-tool-call-font-size` · `--xh-tool-call-indicator-fg` · `--xh-tool-call-name-font` · `--xh-tool-call-px` · `--xh-tool-call-py` · `--xh-tool-call-radius` · `--xh-tool-call-status-fg` · `--xh-tool-call-status-fg-approval` · `--xh-tool-call-status-fg-done` · `--xh-tool-call-status-fg-error` · `--xh-tool-call-status-font-size` · `--xh-tool-call-tone-bar` · `--xh-tool-call-tone-fg` · `--xh-tool-call-trigger-bg-hover` · `--xh-tool-call-trigger-fg` · `--xh-tool-call-trigger-gap`

## 动效

状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 参数与结果用[代码视图](./code-view)：参数在流式期是半截 JSON，把 `complete` 接成
  「阶段不是参数在传」即可。富文本结果走[流式正文](./markdown-stream)。
- 审批那一格装[审批](./approval)。
- 复制不内建，与[剪贴板](./clipboard)组合；多张并排要方向键跳卡片就套[工具条](./toolbar)。

## 最佳实践

- 工具名与状态都写在开关里：它们会自然构成开关的可访问名（「搜索，已完成」）。
- 出错态要容忍没有错误文本：流被中止时未拿到结果的调用会被收尾成出错，但拿不到原因。

## 反模式

- 每张卡各开一个 `aria-live`：一屏五张卡就是五个活区互相打断。
- 用禁用表达「还不能展开」：读屏用户连它存在都听不到。
