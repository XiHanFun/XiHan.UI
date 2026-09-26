# ToolCall 工具调用 <Badge type="info" text="alpha" />

一次工具调用的卡片：阶段、参数与结果，运行时自动展开、结束后自动收起，用户手动操作过一次后不再自动开合。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/tool-call" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/tool-call.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/tool-call" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/tool-call" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/tool-call.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

等待批准不是运行中：闸门常驻在开关与详情之间，不会被折叠隐藏

<XhDemo src="tool-call/01-phases" />

## 组件结构

加粗的是必需部件。

`data-scope="tool-call"`：**`root`** · **`trigger`** · `indicator` · `label` · `summary` · `status` · `duration` · `approval` · **`content`** · `input` · `output` · `error`

## 示例

### 自动开合与锁存

运行时自动展开、结束时自动收起；用户手动开合过一次之后，阶段如何变化都不再自动开合

<XhDemo src="tool-call/02-auto-disclosure" />

### 摘要与耗时

详情收起时也能看到查询内容与运行时长；两个时刻由宿主提供，组件自身不读取时钟

<XhDemo src="tool-call/03-summary-duration" />

### 多次调用分组

外层套一层手风琴作为分组头：计数使用等宽数位，整组开合归手风琴，卡片各自独立

<XhDemo src="tool-call/04-grouped" />

### 形态、语气与尺寸

三轴只改变该外壳与正文分开的方式，阶段与展开逻辑不受影响

<XhDemo src="tool-call/05-variant-tone-size" />

## 设计指引

### 何时使用

- Agent 界面中展示正在执行的操作：查询了什么、传了什么参数、返回了什么。
- 一次调用需要先经用户批准才能执行。

### 何时不用

- 展示思考过程而不是一次调用时，使用[思考过程](./reasoning)，两者共用同一台状态机但正文形态不同。
- 只需要一个状态色块时，使用[徽标](./badge)，配 `toneOfToolCallPhase(phase)` 取语气。
- 多次调用一次只展开一张时，外层使用[手风琴](./accordion)，每格放一张。

### 特性

- 五档阶段：参数传输中、参数完整、等待批准、已完成、出错。等待批准不是运行中：协议层的审批只改变审批状态、不改变工具状态，没有这一档时等待中的调用会被视为运行中。
- 自动开合的锁存依靠转移的放置位置，不依靠布尔位：用户点击过一次之后，阶段变化在结构上无法到达任何转移，自动开合永久停用。
- 审批闸门常驻在开关与详情之间，不会被折叠隐藏。
- 收起使用 `hidden` + `inert`：退场动画完成前内容仍在渲染，`inert` 把这段窗口挡在读屏与 Tab 序列之外。
- 开关行保留摘要位与耗时位：详情收起时也能看到查询内容与运行时长。
- 耗时由宿主提供两个时刻，`toolCallDuration(startTime, endTime)` 计算毫秒数；组件自身不读时钟也不启动定时器，秒数跳动由宿主驱动。

### 组合

- 参数与结果使用[代码视图](./code-view)：参数在流式期是不完整的 JSON，把 `complete` 接为“阶段不是参数传输中”即可。富文本结果使用[流式正文](./markdown-stream)。
- 结果是代码改动时，详情区放[差异视图](./diff-view)；收起态的摘要取它的 `stats` 组成 `+{added} −{removed} 文件名` 写进摘要位，减号使用 U+2212 而不是连字符。摘要需要悬停查看全文时使用[悬浮卡片](./hover-card)，不自行向 body 挂载节点。
- 审批区放[审批](./approval)。
- 复制不内建，与[剪贴板](./clipboard)组合；多张并排需要方向键跳转时外层使用[工具栏](./toolbar)。
- 一轮中运行多次工具时，外层使用[手风琴](./accordion)分组：手风琴的开关写“运行了 N 个工具”，计数段加 `font-variant-numeric: tabular-nums` 避免数字跳动时左右移动；整组的开合由手风琴的 `aria-expanded` 承担，卡片各自只管理自身。

### 最佳实践

- 工具名与状态都写在开关内，它们自然构成开关的可访问名称（“搜索，已完成”）。
- 出错态要容忍没有错误文本：流被中止时未获得结果的调用会被收尾为出错，但没有原因。
- 摘要位只放一句可一眼读完的参数（查询词、文件路径），完整 JSON 留给详情内的代码视图。
- 耗时文案使用 `translations.ranFor` 模板串，秒数由宿主代入；`endTime` 缺席时不渲染该位。

### 反模式

- 每张卡各开一个 `aria-live`：一屏五张卡就是五个活动区域互相打断。
- 用禁用表达“暂不能展开”：读屏用户无法得知它的存在。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-tool-call>` |
| Vue 组件 | `XhToolCallApproval` `XhToolCallContent` `XhToolCallDuration` `XhToolCallError` `XhToolCallIndicator` `XhToolCallInput` `XhToolCallLabel` `XhToolCallOutput` `XhToolCallRoot` `XhToolCallStatus` `XhToolCallSummary` `XhToolCallTrigger` |
| 组合式函数 | `useToolCall` |
| 状态机 | `toolCallMachine` |
| 皮肤 | `@xihan-ui/styles/tool-call.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `running` | `boolean` |  | 本次调用正在运行。适配器用 isToolCallRunning(phase) 折叠得出，作者只写 phase。 |
| `open` | `boolean` |  |  |
| `defaultOpen` | `boolean` |  |  |
| `autoDisclosure` | `boolean` |  | 运行时自动展开、结束时自动收起，默认开启；用户手动开合过一次即永久停用。 |
| `disabled` | `boolean` |  |  |
| `onOpenChange` | `(details: ToolCallOpenChangeDetails) => void` |  |  |
| `endTime` | `number` |  | 本次调用结束的时刻。可能缺席：仍在运行，或流被中止时兜底收尾不写该字段。 |
| `phase` | `ToolCallPhase` |  | 本次调用所处的阶段，默认 input-available。 |
| `size` | `Size` |  |  |
| `startTime` | `number` |  | 本次调用开始的时刻，毫秒时间戳。 |
| `tone` | `Tone` |  |  |
| `translations` | `Partial<ToolCallTranslations>` |  |  |
| `variant` | `ControlVariant` |  | 形态：outline 描边、subtle 底色分区、ghost 无壳内联。默认 outline。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `open-change` | `ToolCallOpenChangeDetails` | 开合变化；detail 为 `{ open: boolean, source: 'user' \| 'auto' \| 'api' }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhToolCallRoot` | `default` | `ToolCallRootSlotProps` |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhToolCallRoot` | `children` | `SlotChildren<ToolCallRootSlotProps>` |  |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `indicator` | 'open' \| 'closed' |
| `label` | props.phase |
| `summary` | props.phase |
| `status` | props.phase |
| `duration` | props.phase |
| `approval` | props.phase |
| `content` | 'open' \| 'closed' |
| `input` | props.phase |
| `output` | props.phase |
| `error` | props.phase |

以下名称仅用于内部状态机。

**状态**：`auto.collapsed` · `auto.expanded` · `held.collapsed` · `held.expanded`

**事件**：`TOGGLE` · `OPEN` · `CLOSE` · `PHASE.ACTIVE` · `PHASE.SETTLE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `PRESS.START` · `PRESS.END`

**判据**：`isOpenControlled` · `isAutoAllowed` · `isAutoEnabled` · `canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `phase` | `ToolCallPhase` |  |
| `running` | `boolean` | 该档是否视为运行中。 |
| `settled` | `boolean` | 该档是否视为已落定：运行完成，或失败。 |
| `errored` | `boolean` | 该档是否视为失败。 |
| `disabled` | `boolean` |  |
| `statusText` | `string` | 读屏文案，由宿主写入会话级的播报区。 |
| `durationMs` | `number \| undefined` | 运行时长，毫秒；两个时刻任一缺席即 undefined。 |
| `setOpen` | `(next: boolean) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getTriggerProps` | `() => T['button']` |  |
| `getIndicatorProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` |  |
| `getSummaryProps` | `() => T['element']` |  |
| `getStatusProps` | `() => T['element']` |  |
| `getDurationProps` | `() => T['element']` |  |
| `getApprovalProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getInputProps` | `() => T['element']` |  |
| `getOutputProps` | `() => T['element']` |  |
| `getErrorProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | 焦点在折叠开关上且未禁用 | 展开或收起详情，并把自动开合永久停用 |
| `Enter` / `Space` | 按住折叠开关且未禁用 | 按住期间 trigger 投影 data-pressed，与指针 :active 同一副按压面（disclosure trigger 只换面不缩放）；抬起、失焦或转禁用撤下。运行中照常接 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-describedby` | `error` 部件的 id \| undefined |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `indicator` | `aria-hidden` | 'true' |
| `content` | `aria-labelledby` | `trigger` 部件的 id |
| `content` | `role` | 'region' |

- 开关带 `aria-expanded` 与 `aria-controls`，详情区是 `role=region` 且由开关命名。
- 出错时开关才补 `aria-describedby` 指向错误区，无条件挂载会指向作者未渲染的节点。
- 卡片自身不开活动区域：一屏多张卡各开一个会互相打断。播报文本由 `statusText` 交出，由宿主写进会话级的播报区。

## 样式参考

### 皮肤

`@xihan-ui/styles/tool-call.css` 使用 `[data-scope="tool-call"][data-part="root"]` 部件选择器，位于 `xihan.components` 与 `xihan.motion` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-errored` | ''（条件成立时才出现） |
| `root` | `data-loading` | ''（条件成立时才出现） |
| `root` | `data-settled` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `trigger` | `data-disabled` | ''（条件成立时才出现） |
| `trigger` | `data-pressed` | ''（条件成立时才出现） |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-xh-action-control` | '' |
| `trigger` | `data-xh-action-display` | 'always' |
| `trigger` | `data-xh-action-profile` | 'disclosure-trigger' |
| `trigger` | `data-xh-action-size` | props.size |
| `trigger` | `data-xh-action-variant` | 'ghost' |
| `indicator` | `data-instant` | ''（条件成立时才出现） |
| `indicator` | `data-state` | 'open' \| 'closed' |
| `label` | `data-state` | props.phase |
| `summary` | `data-state` | props.phase |
| `status` | `data-state` | props.phase |
| `duration` | `data-loading` | ''（条件成立时才出现） |
| `duration` | `data-state` | props.phase |
| `approval` | `data-state` | props.phase |
| `content` | `data-instant` | ''（条件成立时才出现） |
| `content` | `data-state` | 'open' \| 'closed' |
| `input` | `data-state` | props.phase |
| `output` | `data-state` | props.phase |
| `error` | `data-state` | props.phase |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-tool-call-bg` | `root` | `background` | `default`<br>`variant=subtle` | `--xh-bg-subtle`<br>`--xh-bg-surface` | tool-call 的 root 部件 background 覆盖槽。 |
| `--xh-tool-call-border` | `root` | `border` | `default` | `--xh-border-default` | tool-call 的 root 部件 border 覆盖槽。 |
| `--xh-tool-call-border-error` | `root` | `border-color` | `errored`<br>`has([data-scope='tool-call'][data-state='output-error'])`<br>`state=output-error` | `--xh-border-invalid` | tool-call 的 root 部件 border-color 覆盖槽。 |
| `--xh-tool-call-content-gap` | `content` | `gap` | `default` | `--xh-space-2` | tool-call 的 content 部件 gap 覆盖槽。 |
| `--xh-tool-call-divider` | `approval`<br>`content` | `border-block-start` | `default` | `--xh-border-subtle` | tool-call 的 approval、content 部件 border-block-start 覆盖槽。 |
| `--xh-tool-call-duration-fg` | `duration` | `color` | `default` | `--xh-fg-subtle` | tool-call 的 duration 部件 color 覆盖槽。 |
| `--xh-tool-call-error-fg` | `error` | `color` | `default` | `--xh-fg-danger` | tool-call 的 error 部件 color 覆盖槽。 |
| `--xh-tool-call-font-size` | `trigger` | `font-size` | `default` | `--xh-_tool-call-font-size` | tool-call 的 trigger 部件 font-size 覆盖槽。 |
| `--xh-tool-call-icon-size` | `root`<br>`trigger` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size`<br>`--xh-glyph-size-md` | tool-call 的 root、trigger 部件 --xh-icon-size 覆盖槽。 |
| `--xh-tool-call-indicator-fg` | `indicator` | `color` | `default` | `--xh-fg-subtle` | tool-call 的 indicator 部件 color 覆盖槽。 |
| `--xh-tool-call-label-font` | `label`<br>`summary` | `font-family` | `default` | `--xh-font-family-mono` | tool-call 的 label、summary 部件 font-family 覆盖槽。 |
| `--xh-tool-call-px` | `approval`<br>`content`<br>`trigger` | `padding-inline` | `default` | `--xh-_tool-call-px` | tool-call 的 approval、content、trigger 部件 padding-inline 覆盖槽。 |
| `--xh-tool-call-py` | `approval`<br>`content`<br>`trigger` | `padding-block`<br>`padding-block-end`<br>`padding-block-start` | `@keyframes xh-disclosure-collapse`<br>`@keyframes xh-disclosure-expand`<br>`default`<br>`xh-action-profile=disclosure-trigger` | `--xh-_tool-call-py` | tool-call 的 approval、content、trigger 部件 padding-block、padding-block-end、padding-block-start 覆盖槽。 |
| `--xh-tool-call-radius` | `root` | `border-radius` | `default` | `--xh-shape-surface` | tool-call 的 root 部件 border-radius 覆盖槽。 |
| `--xh-tool-call-shadow` | `root` | `box-shadow` | `default`<br>`tone` | `0 0 0 transparent`<br>`none` | tool-call 的 root 部件 box-shadow 覆盖槽。 |
| `--xh-tool-call-shimmer-duration` | `root`<br>`status` | `animation` | `loading` | `--xh-motion-loop-shimmer` | tool-call 的 root、status 部件 animation 覆盖槽。 |
| `--xh-tool-call-status-bg-approval` | `status` | `background` | `state=awaiting-approval` | `--xh-fg-warning` | tool-call 的 status 部件 background 覆盖槽。 |
| `--xh-tool-call-status-bg-done` | `status` | `background` | `state=output-available` | `--xh-fg-success` | tool-call 的 status 部件 background 覆盖槽。 |
| `--xh-tool-call-status-bg-error` | `status` | `background` | `state=output-error` | `--xh-fg-danger` | tool-call 的 status 部件 background 覆盖槽。 |
| `--xh-tool-call-status-fg` | `root`<br>`status` | `color` | `@media (prefers-reduced-motion: reduce)`<br>`@media print`<br>`default`<br>`loading`<br>`motion=reduce`<br>`where([data-motion='reduce'])` | `--xh-fg-muted` | tool-call 的 root、status 部件 color 覆盖槽。 |
| `--xh-tool-call-status-fg-approval` | `status` | `color` | `state=awaiting-approval` | `--xh-fg-warning` | tool-call 的 status 部件 color 覆盖槽。 |
| `--xh-tool-call-status-fg-done` | `status` | `color` | `state=output-available` | `--xh-fg-success` | tool-call 的 status 部件 color 覆盖槽。 |
| `--xh-tool-call-status-fg-error` | `status` | `color` | `state=output-error` | `--xh-fg-danger` | tool-call 的 status 部件 color 覆盖槽。 |
| `--xh-tool-call-status-font-size` | `duration`<br>`error`<br>`status` | `font-size` | `default` | `--xh-text-caption-size` | tool-call 的 duration、error、status 部件 font-size 覆盖槽。 |
| `--xh-tool-call-status-px` | `status` | `padding-inline` | `state=awaiting-approval`<br>`state=output-available`<br>`state=output-error` | `--xh-space-2` | tool-call 的 status 部件 padding-inline 覆盖槽。 |
| `--xh-tool-call-status-py` | `status` | `padding-block` | `state=awaiting-approval`<br>`state=output-available`<br>`state=output-error` | `--xh-space-0_5` | tool-call 的 status 部件 padding-block 覆盖槽。 |
| `--xh-tool-call-status-radius` | `status` | `border-radius` | `state=awaiting-approval`<br>`state=output-available`<br>`state=output-error` | `--xh-shape-pill` | tool-call 的 status 部件 border-radius 覆盖槽。 |
| `--xh-tool-call-status-shimmer-base` | `root`<br>`status` | `background-image` | `loading` | `--xh-fg-subtle` | tool-call 的 root、status 部件 background-image 覆盖槽。 |
| `--xh-tool-call-status-shimmer-sheen` | `root`<br>`status` | `background-image` | `loading` | `--xh-fg-default` | tool-call 的 root、status 部件 background-image 覆盖槽。 |
| `--xh-tool-call-summary-bg` | `summary` | `background` | `default` | `--xh-bg-subtle` | tool-call 的 summary 部件 background 覆盖槽。 |
| `--xh-tool-call-summary-fg` | `summary` | `color` | `default` | `--xh-fg-muted` | tool-call 的 summary 部件 color 覆盖槽。 |
| `--xh-tool-call-summary-font-size` | `summary` | `font-size` | `default` | `--xh-text-caption-size` | tool-call 的 summary 部件 font-size 覆盖槽。 |
| `--xh-tool-call-summary-px` | `summary` | `padding-inline` | `default` | `--xh-space-1_5` | tool-call 的 summary 部件 padding-inline 覆盖槽。 |
| `--xh-tool-call-summary-radius` | `summary` | `border-radius` | `default` | `--xh-shape-control` | tool-call 的 summary 部件 border-radius 覆盖槽。 |
| `--xh-tool-call-tone-bar` | `root` | `box-shadow` | `tone` | `--xh-stroke-thick` | tool-call 的 root 部件 box-shadow 覆盖槽。 |
| `--xh-tool-call-tone-fg` | `root` | `box-shadow` | `tone` | `--xh-_tone-soft` | tool-call 的 root 部件 box-shadow 覆盖槽。 |
| `--xh-tool-call-trigger-bg-hover` | `trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | tool-call 的 trigger 部件 background-color 覆盖槽。 |
| `--xh-tool-call-trigger-fg` | `trigger` | `color` | `default` | `--xh-fg-default` | tool-call 的 trigger 部件 color 覆盖槽。 |
| `--xh-tool-call-trigger-gap` | `trigger` | `gap` | `default` | `--xh-space-2` | tool-call 的 trigger 部件 gap 覆盖槽。 |
| `--xh-tool-call-trigger-radius` | `root`<br>`trigger` | `border-radius` | `variant=ghost` | `--xh-shape-control` | tool-call 的 root、trigger 部件 border-radius 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：按压 · 状态 · 披露 · 出现 · 列表 · 循环（见[动效规范](../design/motion#角色)）。

可覆盖的动效槽：`--xh-tool-call-shimmer-duration`。

共享关键帧 `xh-disclosure-collapse` · `xh-disclosure-expand` · `xh-item-in` · `xh-shimmer` 由 `family/motion.css` 提供，皮肤 `@import` 它，单独引入仍成立；`rotate` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。
