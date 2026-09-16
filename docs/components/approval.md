# Approval 审批 <Badge type="info" text="alpha" />

危险操作执行前的人工闸门：批准或拒绝，超时按拒绝处理，可附带勾选式的授权范围。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/approval" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/approval.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/approval" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/approval" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/approval.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

勾选与判定是原子的：批准的载荷带着批准的项，不存在已批准但范围尚未同步的窗口

<XhDemo src="approval/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="approval"`：**`root`** · `title` · `description` · `live-region` · `group` · `item` · `item-indicator` · `item-text` · `note` · `timer` · `result` · `footer` · **`approve-trigger`** · **`deny-trigger`**

## 示例

### 超时按拒绝收口

默认不提供超时值：替宿主制定安全策略比不制定更危险。到期落为拒绝，expired 只是显示态

<XhDemo src="approval/02-timeout" />

### 附加备注

备注与勾选同批取快照，随判定载荷一起发出；留空时不带该字段，它不参与必选项是否勾满的判断

<XhDemo src="approval/03-note" />

### 形态与尺寸

variant 改变该闸门与正文分开的方式，size 改变标题、条目与按钮的几何档；判定链不变

<XhDemo src="approval/04-variant-size" />

## 设计指引

### 何时使用

- Agent 执行写文件、发请求、付费等实际操作前需要用户确认。
- 授权带范围：批准的同时需要说明批准了哪些项。

### 何时不用

- 只需要一句确认时，使用[弹出确认](./popconfirm)。
- 判定结果不影响任何执行时，它不是闸门，应使用提示。

### 特性

- 超时一律按拒绝处理，由状态机结构保证，不依赖调用方遵守约定：判定的取值只有批准与拒绝，`expired` 只是显示状态；通往批准的转移只有一条；到期事件只在待决状态有转移，迟到的定时事件静默丢弃。
- 不提供默认超时值，由宿主决定安全策略。时长非有限数或非正数时不启动计时器，停留在待决状态；既不按 0ms 立即到期，也不视为无限期放行。
- 拒绝路径始终可达：状态机层的拒绝不受必选项和任何闸门限制，超时、卸载兜底与宿主的 `deny()` 入口都能落地。拒绝按钮与 Escape 另有一道挂起闸门：判定在途时与批准按钮一起锁定，避免等待宿主响应期间产生第二条判定。
- 勾选与判定是原子的：批准的载荷携带已勾选的授权项，不存在已批准但范围未同步的窗口。
- 备注（`note`）与勾选同批快照，随判定载荷一起发出；为空时不携带该字段。备注不参与必选项是否勾满的判断。
- `requestId` 变化即重新进入待决并按新时长重启计时；不为上一轮补发拒绝，旧结果由宿主自行作废。重入时勾选与备注回到各自默认值。
- 判定落定后 `result` 部件才显示，语气随判定变化：批准取成功档，拒绝与超时取危险档。它对读屏隐藏，同一句话由播报区读出一次。
- 两个按钮位于 `actions` 行内，间距与对齐由库统一处理，使用者不需要另写容器。

### 组合

- 放入[工具调用](./tool-call)的 `approval` 部件位：该位置常驻于开关与详情之间，不会被折叠隐藏。
- 需要弹窗时每个闸门一个[对话框](./dialog)：`role="alertdialog"`、关闭 `closeOnEscape`，并把 `initialFocus` 设为本组件导出的 `APPROVAL_DENY_SELECTOR`。浮层只保留批准与拒绝两个出口，Escape 仍冒泡到闸门并判为拒绝。
- 剩余时间的显示交给[计时器](./timer)，判定权仍由本组件持有。不要把倒计时直接渲染为 `timer` 节点：两套解剖打在同一节点上会互相覆盖，应让 `timer` 作为外层容器。
- 需要连续询问多件事时，使用[步骤条](./steps)或[走马灯](./carousel)串联多个闸门。本组件是单发闸门，`data-state` 的四个值互斥，不表达序号。
- 需要提供“稍后再说”入口时，该入口由宿主实现，不属于闸门。常见做法是在 `onDecision` 之外另留延后路径，或按上一条把闸门放进对话框；浮层内仍只有批准与拒绝两个出口。

### 最佳实践

- 判定落定后两个按钮都会禁用，浮层不再有出口，宿主必须在判定回调中关闭浮层。
- 卸载即拒绝（`denyOnUnmount`）默认关闭。启用前确认列表换 key、路由切换、热更新等任何一次重新挂载都会替用户发出判定。

### 反模式

- 把超时做成到点自动放行。
- 用可关闭的浮层承载闸门：关闭窗口既不是批准也不是拒绝，闸门会悬空。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-approval>` |
| Vue 组件 | `XhApprovalApproveTrigger` `XhApprovalDenyTrigger` `XhApprovalDescription` `XhApprovalFooter` `XhApprovalGroup` `XhApprovalItem` `XhApprovalItemIndicator` `XhApprovalItemText` `XhApprovalLiveRegion` `XhApprovalNote` `XhApprovalResult` `XhApprovalRoot` `XhApprovalTimer` `XhApprovalTitle` |
| 组合式函数 | `useApproval` |
| 状态机 | `approvalMachine` |
| 皮肤 | `@xihan-ui/styles/approval.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `requestId` | `string` |  | 本轮请求的身份。变化即重新进入待决，并按新时长重新计时。 |
| `status` | `ApprovalStatus` |  | 提供即受控。 |
| `defaultStatus` | `ApprovalStatus` |  |  |
| `timeoutMs` | `number` |  | 超时无人应答时按拒绝收口。默认不提供默认值：替宿主决定安全策略比不决定更危险。 非有限值或非正数同样不启动计时器，既不按 0ms 立即到期，也不视为无限期放行。 |
| `scopes` | `readonly ApprovalScope[]` |  |  |
| `grantedScopes` | `readonly string[]` |  |  |
| `defaultGrantedScopes` | `readonly string[]` |  |  |
| `note` | `string` |  | 附在判定上的一段自由文本。提供即受控。 它只随判定载荷发出，不参与必选项是否全部勾选的判断。 |
| `defaultNote` | `string` |  |  |
| `loading` | `boolean` |  | 判定在途：只阻止重复批准，不阻止拒绝。 |
| `denyOnEscape` | `boolean` |  | Escape 判为拒绝，默认开启。 |
| `denyOnUnmount` | `boolean` |  | 卸载时若仍待决则按拒绝派发一次，默认关闭。 机制成立不等于默认值成立：列表更换 key、路由切换、热更新的任何一次重挂， 都会替用户发出未做过的判定。 |
| `live` | `'polite' \| 'assertive'` |  | 播报档位，默认 polite。 |
| `variant` | `ControlVariant` |  | 形态：outline 描边、subtle 底色分区、ghost 无壳内联。默认 outline。 |
| `tone` | `Tone` |  |  |
| `size` | `Size` |  |  |
| `translations` | `Partial<ApprovalTranslations>` |  |  |
| `onDecision` | `(details: ApprovalDecisionDetails) => void` |  |  |
| `onGrantedScopesChange` | `(details: ApprovalScopesChangeDetails) => void` |  |  |
| `onNoteChange` | `(details: ApprovalNoteChangeDetails) => void` |  |  |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `decision` | `ApprovalDecisionDetails` | 判定落定；detail 为 `{ requestId, decision, source, scopes }` |
| `granted-scopes-change` | `ApprovalScopesChangeDetails` | 勾选的授权项变化；detail 为 `{ value: string[] }` |
| `note-change` | `ApprovalNoteChangeDetails` | 备注变化；detail 为 `{ value: string }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhApprovalItem` | `default` | `ApprovalScopeSlotProps` |  |
| `XhApprovalRoot` | `default` | `ApprovalRootSlotProps` |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'pending' \| 'approved' \| 'denied' \| 'expired' |
| `item` | 'checked' \| 'unchecked' |
| `item-indicator` | 'checked' \| 'unchecked' |
| `note` | 'pending' \| 'approved' \| 'denied' \| 'expired' |
| `timer` | 'pending' \| 'approved' \| 'denied' \| 'expired' |
| `result` | 'pending' \| 'approved' \| 'denied' \| 'expired' |
| `approve-trigger` | 'pending' \| 'approved' \| 'denied' \| 'expired' |
| `deny-trigger` | 'pending' \| 'approved' \| 'denied' \| 'expired' |

以下名称仅用于内部状态机。

**状态**：`pending` · `approved` · `denied` · `expired`

**事件**：`APPROVE` · `DENY` · `SCOPE.TOGGLE` · `SCOPE.SET` · `NOTE.SET` · `after.timeout` · `CONTROLLED.PENDING` · `CONTROLLED.APPROVE` · `CONTROLLED.DENY` · `CONTROLLED.EXPIRE` · `REQUEST.RESET`

**判据**：`isStatusControlled` · `canApprove` · `isEditable` · `canApproveControlled`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `status` | `ApprovalStatus` |  |
| `settled` | `boolean` | 已判定：两个按钮都收起出口。 |
| `loading` | `boolean` |  |
| `grantedScopes` | `string[]` |  |
| `note` | `string` | 备注中的文字；未填写时为空串。 |
| `canApprove` | `boolean` | 必选项是否全部勾选。 |
| `announcement` | `string` | 按 status 选出的播报文本；关闭 announce 时作者不渲染该部件即可。 |
| `approve` | `() => void` |  |
| `deny` | `() => void` |  |
| `setGrantedScopes` | `(next: string[]) => void` |  |
| `setNote` | `(next: string) => void` |  |
| `isScopeGranted` | `(value: string) => boolean` |  |
| `getRootProps` | `() => T['element']` |  |
| `getTitleProps` | `() => T['element']` |  |
| `getDescriptionProps` | `() => T['element']` |  |
| `getLiveRegionProps` | `() => T['element']` |  |
| `getGroupProps` | `() => T['element']` |  |
| `getItemProps` | `(scope: ApprovalScope) => T['element']` |  |
| `getItemIndicatorProps` | `(scope: ApprovalScope) => T['element']` |  |
| `getItemTextProps` | `(scope: ApprovalScope) => T['element']` |  |
| `getNoteProps` | `() => T['input']` |  |
| `getTimerProps` | `() => T['element']` |  |
| `getResultProps` | `() => T['element']` |  |
| `getFooterProps` | `() => T['element']` |  |
| `getApproveTriggerProps` | `() => T['button']` |  |
| `getDenyTriggerProps` | `() => T['button']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | 焦点在批准按钮上，待决、必选项已勾满、且不在挂起中 | 判为批准，载荷带上已勾选的授权项 |
| `Enter` / `Space` | 焦点在拒绝按钮上，待决且不在挂起中 | 判为拒绝 |
| `Space` | 焦点在授权项上，待决且该项未禁用 | 勾选或取消该项。Enter 刻意不参与，与原生复选框一致 |
| `Escape` | 焦点在闸门内，待决、未挂起、且开启 denyOnEscape | 判为拒绝。它不是关闭：本组件不提供不作答的出口 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-describedby` | `description` 部件的 id |
| `root` | `aria-labelledby` | `title` 部件的 id |
| `root` | `role` | 'group' |
| `live-region` | `aria-atomic` | 'true' |
| `live-region` | `aria-live` | props.live |
| `group` | `aria-label` | translations?.scopes |
| `group` | `role` | 'group' |
| `item` | `aria-checked` | 'true' \| 'false' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `aria-required` | 'true' \| 'false' |
| `item` | `role` | 'checkbox' |
| `item-indicator` | `aria-hidden` | 'true' |
| `note` | `aria-label` | translations?.note |
| `timer` | `aria-hidden` | 'true' |
| `result` | `aria-hidden` | 'true' |
| `approve-trigger` | `aria-busy` | 'true' \| undefined |
| `approve-trigger` | `aria-disabled` | 'true' \| 'false' |
| `approve-trigger` | `aria-label` | translations?.approve |
| `deny-trigger` | `aria-busy` | 'true' \| undefined |
| `deny-trigger` | `aria-disabled` | 'true' \| 'false' |
| `deny-trigger` | `aria-label` | translations?.deny |

- 闸门是 `role=group`，由标题命名、由说明描述。
- 待决时批准键使用 `aria-disabled` 而不是原生 `disabled`：保持可聚焦，读屏可以读出不可用的原因。
- 授权项是 `role=checkbox`，各占一个 Tab 停靠点，只响应 `Space`，与原生复选框一致。
- 剩余时间与结果条都对读屏隐藏：逐秒变化的数字进入活动区域会持续打断，判定结果与截止事件由播报区各读出一次。
- 备注取 `translations.note` 作为可访问名称（默认 `Note`），占位文字取 `translations.notePlaceholder`。

## 样式参考

### 皮肤

`@xihan-ui/styles/approval.css` 使用 `[data-scope="approval"][data-part="root"]` 部件选择器，位于 `xihan.components` 与 `xihan.motion` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-loading` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'pending' \| 'approved' \| 'denied' \| 'expired' |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `item` | `data-disabled` | ''（条件成立时才出现） |
| `item` | `data-state` | 'checked' \| 'unchecked' |
| `item` | `data-value` | item.value |
| `item` | `data-xh-action-control` | '' |
| `item` | `data-xh-action-display` | 'always' |
| `item` | `data-xh-action-profile` | 'row' |
| `item` | `data-xh-action-size` | props.size |
| `item` | `data-xh-action-variant` | 'ghost' |
| `item-indicator` | `data-state` | 'checked' \| 'unchecked' |
| `item-text` | `data-value` | item.value |
| `note` | `data-state` | 'pending' \| 'approved' \| 'denied' \| 'expired' |
| `timer` | `data-state` | 'pending' \| 'approved' \| 'denied' \| 'expired' |
| `result` | `data-state` | 'pending' \| 'approved' \| 'denied' \| 'expired' |
| `approve-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `approve-trigger` | `data-loading` | ''（条件成立时才出现） |
| `approve-trigger` | `data-state` | 'pending' \| 'approved' \| 'denied' \| 'expired' |
| `approve-trigger` | `data-xh-action-control` | '' |
| `approve-trigger` | `data-xh-action-display` | 'always' |
| `approve-trigger` | `data-xh-action-profile` | 'text' |
| `approve-trigger` | `data-xh-action-size` | props.size |
| `approve-trigger` | `data-xh-action-variant` | 'solid' |
| `deny-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `deny-trigger` | `data-loading` | ''（条件成立时才出现） |
| `deny-trigger` | `data-state` | 'pending' \| 'approved' \| 'denied' \| 'expired' |
| `deny-trigger` | `data-xh-action-control` | '' |
| `deny-trigger` | `data-xh-action-display` | 'always' |
| `deny-trigger` | `data-xh-action-profile` | 'text' |
| `deny-trigger` | `data-xh-action-size` | props.size |
| `deny-trigger` | `data-xh-action-variant` | 'outline' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-approval-action-font-size` | `approve-trigger`<br>`deny-trigger`<br>`footer`<br>`root` | `font-size` | `default`<br>`loading` | `--xh-text-label-size` | approval 的 approve-trigger、deny-trigger、footer、root 部件 font-size 覆盖槽。 |
| `--xh-approval-action-font-weight` | `approve-trigger`<br>`deny-trigger` | `font-weight` | `default` | `--xh-text-label-weight` | approval 的 approve-trigger、deny-trigger 部件 font-weight 覆盖槽。 |
| `--xh-approval-action-h` | `approve-trigger`<br>`deny-trigger` | `block-size`<br>`min-block-size` | `default`<br>`xh-action-profile=row` | `--xh-_approval-action-h` | approval 的 approve-trigger、deny-trigger 部件 block-size、min-block-size 覆盖槽。 |
| `--xh-approval-action-px` | `approve-trigger`<br>`deny-trigger` | `padding-inline` | `default` | `--xh-_approval-action-px` | approval 的 approve-trigger、deny-trigger 部件 padding-inline 覆盖槽。 |
| `--xh-approval-action-radius` | `approve-trigger`<br>`deny-trigger` | `border-radius` | `default` | `--xh-shape-control` | approval 的 approve-trigger、deny-trigger 部件 border-radius 覆盖槽。 |
| `--xh-approval-approve-bg` | `approve-trigger` | `background-color` | `default`<br>`loading` | `--xh-_action-variant-bg-loading`<br>`--xh-_action-variant-bg-rest` | approval 的 approve-trigger 部件 background-color 覆盖槽。 |
| `--xh-approval-approve-bg-hover` | `approve-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | approval 的 approve-trigger 部件 background-color 覆盖槽。 |
| `--xh-approval-approve-bg-off` | `approve-trigger` | `background-color` | `disabled` | `--xh-_action-variant-bg-disabled` | approval 的 approve-trigger 部件 background-color 覆盖槽。 |
| `--xh-approval-approve-fg` | `approve-trigger` | `color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-loading`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest` | approval 的 approve-trigger 部件 color 覆盖槽。 |
| `--xh-approval-approve-shadow` | `approve-trigger` | `box-shadow` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_highlight-tone` | approval 的 approve-trigger 部件 box-shadow 覆盖槽。 |
| `--xh-approval-bg` | `root` | `background` | `default`<br>`variant=subtle` | `--xh-bg-subtle`<br>`--xh-bg-surface` | approval 的 root 部件 background 覆盖槽。 |
| `--xh-approval-border` | `root` | `border`<br>`border-color` | `default`<br>`tone` | `--xh-_tone`<br>`--xh-border-default` | approval 的 root 部件 border、border-color 覆盖槽。 |
| `--xh-approval-border-settled` | `root` | `border-color` | `not([data-state='pending'])`<br>`state=pending` | `--xh-border-default` | approval 的 root 部件 border-color 覆盖槽。 |
| `--xh-approval-deny-bg` | `deny-trigger` | `background-color` | `default` | `--xh-_action-variant-bg-rest` | approval 的 deny-trigger 部件 background-color 覆盖槽。 |
| `--xh-approval-deny-bg-hover` | `deny-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | approval 的 deny-trigger 部件 background-color 覆盖槽。 |
| `--xh-approval-deny-bg-off` | `deny-trigger` | `background-color` | `disabled` | `--xh-_action-variant-bg-disabled` | approval 的 deny-trigger 部件 background-color 覆盖槽。 |
| `--xh-approval-deny-border` | `deny-trigger` | `border` | `default` | `--xh-_action-variant-border-rest` | approval 的 deny-trigger 部件 border 覆盖槽。 |
| `--xh-approval-deny-border-off` | `deny-trigger` | `border-color` | `disabled` | `--xh-_action-variant-border-disabled` | approval 的 deny-trigger 部件 border-color 覆盖槽。 |
| `--xh-approval-deny-fg` | `deny-trigger` | `color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest` | approval 的 deny-trigger 部件 color 覆盖槽。 |
| `--xh-approval-description-fg` | `description` | `color` | `default` | `--xh-fg-muted` | approval 的 description 部件 color 覆盖槽。 |
| `--xh-approval-description-font-size` | `description` | `font-size` | `default` | `--xh-text-secondary-size` | approval 的 description 部件 font-size 覆盖槽。 |
| `--xh-approval-footer-gap` | `footer` | `gap` | `default` | `--xh-space-2` | approval 的 footer 部件 gap 覆盖槽。 |
| `--xh-approval-gap` | `root` | `gap` | `default` | `--xh-_approval-gap` | approval 的 root 部件 gap 覆盖槽。 |
| `--xh-approval-group-gap` | `group` | `gap` | `default` | `--xh-space-1` | approval 的 group 部件 gap 覆盖槽。 |
| `--xh-approval-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-_approval-icon-size` | approval 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-approval-indicator-bg-checked` | `item-indicator` | `background` | `state=checked` | `--xh-bg-brand` | approval 的 item-indicator 部件 background 覆盖槽。 |
| `--xh-approval-indicator-border` | `item-indicator` | `border` | `default` | `--xh-border-control` | approval 的 item-indicator 部件 border 覆盖槽。 |
| `--xh-approval-indicator-border-checked` | `item-indicator` | `border-color` | `state=checked` | `--xh-bg-brand` | approval 的 item-indicator 部件 border-color 覆盖槽。 |
| `--xh-approval-indicator-fg` | `item-indicator` | `color` | `default` | `--xh-fg-on-brand` | approval 的 item-indicator 部件 color 覆盖槽。 |
| `--xh-approval-indicator-icon-size` | `item-indicator` | `--xh-icon-size` | `default` | `--xh-_approval-indicator-glyph` | approval 的 item-indicator 部件 --xh-icon-size 覆盖槽。 |
| `--xh-approval-indicator-radius` | `item-indicator` | `border-radius` | `default` | `--xh-shape-inset` | approval 的 item-indicator 部件 border-radius 覆盖槽。 |
| `--xh-approval-indicator-size` | `item-indicator` | `--xh-icon-size`<br>`block-size`<br>`inline-size` | `default` | `--xh-control-indicator-size` | approval 的 item-indicator 部件 --xh-icon-size、block-size、inline-size 覆盖槽。 |
| `--xh-approval-item-bg-hover` | `item` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | approval 的 item 部件 background-color 覆盖槽。 |
| `--xh-approval-item-font-size` | `item` | `font-size` | `default` | `--xh-_approval-item-font-size` | approval 的 item 部件 font-size 覆盖槽。 |
| `--xh-approval-item-gap` | `item` | `gap` | `default` | `--xh-space-1_5` | approval 的 item 部件 gap 覆盖槽。 |
| `--xh-approval-item-px` | `item` | `padding-inline` | `default` | `--xh-space-2` | approval 的 item 部件 padding-inline 覆盖槽。 |
| `--xh-approval-item-py` | `item` | `padding-block` | `xh-action-profile=row` | `--xh-space-1` | approval 的 item 部件 padding-block 覆盖槽。 |
| `--xh-approval-item-radius` | `item` | `border-radius` | `default` | `--xh-_action-profile-radius` | approval 的 item 部件 border-radius 覆盖槽。 |
| `--xh-approval-item-text-fg` | `item-text` | `color` | `default` | `--xh-fg-muted` | approval 的 item-text 部件 color 覆盖槽。 |
| `--xh-approval-item-text-fg-checked` | `item`<br>`item-text` | `color` | `state=checked` | `--xh-fg-default` | approval 的 item、item-text 部件 color 覆盖槽。 |
| `--xh-approval-loading-duration` | `footer`<br>`root` | `animation` | `loading` | `--xh-spin-duration` | approval 的 footer、root 部件 animation 覆盖槽。 |
| `--xh-approval-note-bg` | `note` | `background` | `default` | `--xh-bg-surface` | approval 的 note 部件 background 覆盖槽。 |
| `--xh-approval-note-border` | `note` | `border` | `default` | `--xh-border-control` | approval 的 note 部件 border 覆盖槽。 |
| `--xh-approval-note-fg` | `note` | `color` | `default` | `--xh-fg-default` | approval 的 note 部件 color 覆盖槽。 |
| `--xh-approval-note-font-size` | `note` | `font-size` | `default` | `--xh-_approval-note-font-size` | approval 的 note 部件 font-size 覆盖槽。 |
| `--xh-approval-note-px` | `note` | `padding-inline` | `default` | `--xh-space-2` | approval 的 note 部件 padding-inline 覆盖槽。 |
| `--xh-approval-note-py` | `note` | `padding-block` | `default` | `--xh-space-1_5` | approval 的 note 部件 padding-block 覆盖槽。 |
| `--xh-approval-note-radius` | `note` | `border-radius` | `default` | `--xh-shape-control` | approval 的 note 部件 border-radius 覆盖槽。 |
| `--xh-approval-p` | `root` | `padding` | `default` | `--xh-_approval-p` | approval 的 root 部件 padding 覆盖槽。 |
| `--xh-approval-radius` | `root` | `border-radius` | `default` | `--xh-shape-surface` | approval 的 root 部件 border-radius 覆盖槽。 |
| `--xh-approval-result-bg` | `result` | `background` | `default` | `--xh-fg-success` | approval 的 result 部件 background 覆盖槽。 |
| `--xh-approval-result-bg-denied` | `result` | `background` | `is([data-state='denied'], [data-state='expired'])`<br>`state=denied`<br>`state=expired` | `--xh-fg-danger` | approval 的 result 部件 background 覆盖槽。 |
| `--xh-approval-result-fg` | `result` | `color` | `default` | `--xh-fg-success` | approval 的 result 部件 color 覆盖槽。 |
| `--xh-approval-result-fg-denied` | `result` | `color` | `is([data-state='denied'], [data-state='expired'])`<br>`state=denied`<br>`state=expired` | `--xh-fg-danger` | approval 的 result 部件 color 覆盖槽。 |
| `--xh-approval-result-font-size` | `result` | `font-size` | `default` | `--xh-text-caption-size` | approval 的 result 部件 font-size 覆盖槽。 |
| `--xh-approval-result-font-weight` | `result` | `font-weight` | `default` | `--xh-text-label-weight` | approval 的 result 部件 font-weight 覆盖槽。 |
| `--xh-approval-result-gap` | `result` | `gap` | `default` | `--xh-space-1_5` | approval 的 result 部件 gap 覆盖槽。 |
| `--xh-approval-result-px` | `result` | `padding-inline` | `default` | `--xh-space-2` | approval 的 result 部件 padding-inline 覆盖槽。 |
| `--xh-approval-result-py` | `result` | `padding-block` | `default` | `--xh-space-1` | approval 的 result 部件 padding-block 覆盖槽。 |
| `--xh-approval-result-radius` | `result` | `border-radius` | `default` | `--xh-shape-pill` | approval 的 result 部件 border-radius 覆盖槽。 |
| `--xh-approval-shadow` | `root` | `box-shadow` | `default` | `none` | approval 的 root 部件 box-shadow 覆盖槽。 |
| `--xh-approval-timer-fg` | `timer` | `color` | `default` | `--xh-fg-muted` | approval 的 timer 部件 color 覆盖槽。 |
| `--xh-approval-timer-font-size` | `timer` | `font-size` | `default` | `--xh-text-caption-size` | approval 的 timer 部件 font-size 覆盖槽。 |
| `--xh-approval-title-fg` | `title` | `color` | `default` | `--xh-fg-default` | approval 的 title 部件 color 覆盖槽。 |
| `--xh-approval-title-font-size` | `title` | `font-size` | `default` | `--xh-text-label-size` | approval 的 title 部件 font-size 覆盖槽。 |
| `--xh-approval-title-font-weight` | `title` | `font-weight` | `default` | `--xh-font-weight-semibold` | approval 的 title 部件 font-weight 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

关键帧 `xh-approval-in` · `xh-approval-result-in` · `xh-approval-rotate` 随皮肤自带，不引用别处文件里的名字；`background` · `border-color` · `color` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
