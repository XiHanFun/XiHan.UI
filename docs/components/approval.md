# Approval <Badge type="info" text="审批" />

危险动作执行前的人在环闸门：批准、拒绝，超时按拒绝收口，可带勾选式的授权范围。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/approval" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/approval.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/approval" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/approval" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/approval.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

勾选与判定是原子的：批准的载荷带着批的是哪几项，不存在「已批准但范围还没同步」的窗口

<XhDemo src="approval/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="approval"`：**`root`** · `title` · `description` · `live-region` · `group` · `item` · `item-indicator` · `item-text` · `note` · `timer` · `result` · `footer` · **`approve-trigger`** · **`deny-trigger`**

## 示例

### 超时按拒绝收口

缺省不给默认超时值：替宿主定安全策略比不定更危险。到点落成拒绝，expired 只是显示态

<XhDemo src="approval/02-timeout" />

### 附一句备注

备注与勾选同批取快照，随判定载荷一起发出；空着就不带这一格，它不参与「必选项勾满了没有」的判断

<XhDemo src="approval/03-note" />

### 形态与尺寸

variant 换这块闸门怎么与正文分开，size 换标题、条目与按钮的几何档；判定链一个字不动

<XhDemo src="approval/04-variant-size" />

## 设计指引

### 何时使用

- Agent 要动真格之前（写文件、发请求、花钱）先问一句。
- 这次授权带范围：批准的同时要说清批的是哪几项。

### 何时不用

- 只是一句「确定吗」：用[气泡确认](./popconfirm)。
- 判定结果不影响任何执行：那不是闸门，是一个提示。

### 特性

- **超时一律按拒绝收口**，且这条由机器结构保证、不靠调用方守规矩：判定的取值域只有
  批准与拒绝，`expired` 只是显示态；通往批准的转移全机只有一条；到点事件只在待决态上
  有转移，迟到的定时事件落地即静默丢弃。
- **缺省不给默认超时值**：替宿主定安全策略比不定更危险。时长非有限或非正数时一个计时器
  都不起，停在待决——既不当 0ms 立刻到期，也绝不当成无限期放行。
- **拒绝这条路永远走得通**：机器这一层的拒绝不吃必选项、不吃任何闸门，超时、卸载兜底与
  宿主的 `deny()` 入口都落得下去。人手按的那两条路（拒绝按钮与 Escape）另有一道挂起闸门：
  判定在途时它们跟批准钮一起锁住，否则等待宿主回话的空窗里能按出第二条判定。
- 勾选与判定是原子的：批准的载荷带着「批的是哪几项」，不存在「已批准但范围还没同步」的窗口。
- 备注（`note`）与勾选同批取快照，随判定载荷一起发出；空着就不带这一格。
  它不参与「必选项勾满了没有」的判断。
- `requestId` 变了即重入待决并按新时长重起计时；**不替旧一轮补一次拒绝**，旧结果由宿主自己作废。
  重入时勾选与备注一并回到各自的默认值。
- 判定落定后 `result` 那一格才露出，语气随判定走（批准取成功档，拒绝与超时同取危险档）。
  它对读屏隐藏：同一句话由播报区念一次就够。
- 两颗按钮住在 `actions` 那一行里，间距与对齐归库管，不必每个使用者自己写一个 flex 容器。

### 组合

- 装进[工具调用](./tool-call)的 `approval` 部件位：那一格常驻在开关与详情之间，不会被折叠藏起来。
- 要弹窗就一条一个[对话框](./dialog)：`role="alertdialog"`、关掉 `closeOnEscape`，
  并把 `initialFocus` 设成本组件导出的 `APPROVAL_DENY_SELECTOR`——
  这样浮层只剩批准与拒绝两个出口，而 Escape 仍会冒泡到闸门上判拒绝。
- 剩余时间的跳字交给[计时器](./timer)，判定权仍在本组件手里。
  **别把倒计时直接当 `timer` 那个节点渲**：两套解剖打在同一节点上会互相盖，
  让 `timer` 做外层容器、倒计时住在它里面。
- 要一次问好几件事：用[步骤条](./steps)或[走马灯](./carousel)串起若干个闸门，一步一个。
  本组件是单发闸门，`data-state` 的四个值互斥，塞不下「第几题」。
- 要给用户「稍后再说」：那个入口归宿主，不归闸门。
  常见做法是在 `onDecision` 之外自己留一条延后的路，或按上一条把闸门装进对话框——
  浮层里仍只有批准与拒绝两个出口。

### 最佳实践

- 判定落定后两颗按钮都会禁用，浮层再无出口：**宿主必须在判定回调里自己关闭浮层**。
- 卸载即拒绝（`denyOnUnmount`）默认关着。开之前想清楚：列表换 key、路由切换、
  热更新任何一次重挂，都会替用户发出他没做过的判定。

### 反模式

- 把超时做成「到点自动放行」：那等于把最危险的一档交给了沉默。
- 用一个可关闭的浮层承载它：关掉窗口既不是批准也不是拒绝，闸门就悬空了。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-approval>` |
| Vue 组件 | `XhApprovalApproveTrigger` `XhApprovalDenyTrigger` `XhApprovalDescription` `XhApprovalFooter` `XhApprovalGroup` `XhApprovalItem` `XhApprovalItemIndicator` `XhApprovalItemText` `XhApprovalLiveRegion` `XhApprovalNote` `XhApprovalResult` `XhApprovalRoot` `XhApprovalTimer` `XhApprovalTitle` |
| 组合式函数 | `useApproval` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/approval.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `requestId` | `string` |  | 这一轮请求的身份。变了即重入待决，并按新时长重起计时。 |
| `status` | `ApprovalStatus` |  | 给定即受控。 |
| `defaultStatus` | `ApprovalStatus` |  |  |
| `timeoutMs` | `number` |  | 多久没人答就按拒绝收口。**缺省不给默认值**——替宿主定安全策略比不定更危险。 非有限值或非正数同样不起计时器，既不当 0ms 立刻到期，也绝不当成无限期放行。 |
| `scopes` | `readonly ApprovalScope[]` |  |  |
| `grantedScopes` | `readonly string[]` |  |  |
| `defaultGrantedScopes` | `readonly string[]` |  |  |
| `note` | `string` |  | 附在判定上的一句自由文本。给定即受控。 它只随判定载荷发出，不参与「必选项勾满了没有」的判断。 |
| `defaultNote` | `string` |  |  |
| `loading` | `boolean` |  | 判定在途：只挡重复批准，不挡拒绝。 |
| `denyOnEscape` | `boolean` |  | Escape 判为拒绝，默认开。 |
| `denyOnUnmount` | `boolean` |  | 卸载时若仍待决就按拒绝派发一次，**默认关**。 机理成立不等于默认值成立：列表换 key、路由切换、热更新任何一次重挂， 都会替用户发出他没做过的判定。 |
| `live` | `'polite' \| 'assertive'` |  | 播报档位，默认 polite。 |
| `variant` | `ControlVariant` |  | 形态：outline 描边（缺省档）、subtle 底色分区、ghost 无壳内联。 |
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
| `root` | state.get() |
| `item` | 'checked' \| 'unchecked' |
| `item-indicator` | 'checked' \| 'unchecked' |
| `note` | state.get() |
| `timer` | state.get() |
| `result` | state.get() |
| `approve-trigger` | state.get() |
| `deny-trigger` | state.get() |

以下名称仅用于内部状态机。

**事件**：`APPROVE` · `DENY` · `SCOPE.TOGGLE` · `SCOPE.SET` · `NOTE.SET` · `after.timeout` · `CONTROLLED.PENDING` · `CONTROLLED.APPROVE` · `CONTROLLED.DENY` · `CONTROLLED.EXPIRE` · `REQUEST.RESET`

**判据**：`isStatusControlled` · `canApprove` · `isEditable` · `canApproveControlled`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `status` | `ApprovalStatus` |  |
| `settled` | `boolean` | 已经判过了：两颗按钮都收起出口。 |
| `loading` | `boolean` |  |
| `grantedScopes` | `string[]` |  |
| `note` | `string` | 备注里的文字；没写过是空串。 |
| `canApprove` | `boolean` | 必选项是不是都勾满了。 |
| `announcement` | `string` | 按 status 选出的那一句播报文本；announce 关掉时作者不渲那个部件即可。 |
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
| `Escape` | 焦点在闸门内，待决、不在挂起中、且开着 denyOnEscape | 判为拒绝。**它不是「关闭」**——本组件不提供不作答的出口 |

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
- 待决时批准键用 `aria-disabled` 而不是原生 `disabled`：保住可聚焦，让读屏念得到为什么按不动。
- 授权项是 `role=checkbox`，各占一个 Tab 停靠点，只认 `Space`——与原生复选框一致。
- 剩余时间与结果条都对读屏隐藏：逐秒变化的数字进活区会不停打断，判定结果由播报区念一次；
  截止这件事同样在播报区里一次说清。
- 备注那一格取 `translations.note` 作可及名（缺省 `Note`），占位文字另走 `translations.notePlaceholder`。

## 样式参考

### 皮肤

`@xihan-ui/styles/approval.css` 使用 `[data-scope="approval"][data-part="root"]` 部件选择器，位于 `xihan.components` 与 `xihan.motion` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-loading` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-state` | state.get() |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `item` | `data-disabled` | ''（条件成立时才出现） |
| `item` | `data-state` | 'checked' \| 'unchecked' |
| `item` | `data-value` | item.value |
| `item-indicator` | `data-state` | 'checked' \| 'unchecked' |
| `item-text` | `data-value` | item.value |
| `note` | `data-state` | state.get() |
| `timer` | `data-state` | state.get() |
| `result` | `data-state` | state.get() |
| `approve-trigger` | `data-loading` | ''（条件成立时才出现） |
| `approve-trigger` | `data-state` | state.get() |
| `deny-trigger` | `data-loading` | ''（条件成立时才出现） |
| `deny-trigger` | `data-state` | state.get() |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-approval-action-font-size` | `approve-trigger`<br>`deny-trigger`<br>`footer`<br>`root` | `font-size` | `default`<br>`loading` | `--xh-text-label-size` | approval 的 approve-trigger、deny-trigger、footer、root 部件 font-size 覆盖槽。 |
| `--xh-approval-action-font-weight` | `approve-trigger`<br>`deny-trigger` | `font-weight` | `default` | `--xh-text-label-weight` | approval 的 approve-trigger、deny-trigger 部件 font-weight 覆盖槽。 |
| `--xh-approval-action-h` | `approve-trigger`<br>`deny-trigger` | `block-size` | `default` | `--xh-_approval-action-h` | approval 的 approve-trigger、deny-trigger 部件 block-size 覆盖槽。 |
| `--xh-approval-action-px` | `approve-trigger`<br>`deny-trigger` | `padding-inline` | `default` | `--xh-_approval-action-px` | approval 的 approve-trigger、deny-trigger 部件 padding-inline 覆盖槽。 |
| `--xh-approval-action-radius` | `approve-trigger`<br>`deny-trigger` | `border-radius` | `default` | `--xh-shape-control` | approval 的 approve-trigger、deny-trigger 部件 border-radius 覆盖槽。 |
| `--xh-approval-approve-bg` | `approve-trigger` | `background` | `default` | `--xh-_tone` | approval 的 approve-trigger 部件 background 覆盖槽。 |
| `--xh-approval-approve-bg-hover` | `approve-trigger` | `background` | `hover`<br>`not(:disabled)`<br>`not([aria-disabled='true'])` | `--xh-_tone-hover` | approval 的 approve-trigger 部件 background 覆盖槽。 |
| `--xh-approval-approve-bg-off` | `approve-trigger` | `background` | `loading`<br>`not([data-loading])` | `--xh-bg-muted` | approval 的 approve-trigger 部件 background 覆盖槽。 |
| `--xh-approval-approve-fg` | `approve-trigger` | `color` | `default` | `--xh-_tone-on` | approval 的 approve-trigger 部件 color 覆盖槽。 |
| `--xh-approval-approve-shadow` | `approve-trigger` | `box-shadow` | `default` | `--xh-_approval-approve-highlight` | approval 的 approve-trigger 部件 box-shadow 覆盖槽。 |
| `--xh-approval-bg` | `root` | `background` | `default`<br>`variant=subtle` | `--xh-bg-subtle`<br>`--xh-bg-surface` | approval 的 root 部件 background 覆盖槽。 |
| `--xh-approval-border` | `root` | `border` | `default` | `--xh-_tone` | approval 的 root 部件 border 覆盖槽。 |
| `--xh-approval-border-settled` | `root` | `border-color` | `not([data-state='pending'])`<br>`state=pending` | `--xh-border-subtle` | approval 的 root 部件 border-color 覆盖槽。 |
| `--xh-approval-deny-bg` | `deny-trigger` | `background` | `default` | `transparent` | approval 的 deny-trigger 部件 background 覆盖槽。 |
| `--xh-approval-deny-bg-hover` | `deny-trigger` | `background` | `hover`<br>`not(:disabled)`<br>`not([aria-disabled='true'])` | `--xh-bg-subtle-hover` | approval 的 deny-trigger 部件 background 覆盖槽。 |
| `--xh-approval-deny-bg-off` | `deny-trigger` | `background` | `disabled` | `transparent` | approval 的 deny-trigger 部件 background 覆盖槽。 |
| `--xh-approval-deny-border` | `deny-trigger` | `border-color` | `default` | `--xh-border-control` | approval 的 deny-trigger 部件 border-color 覆盖槽。 |
| `--xh-approval-deny-border-off` | `deny-trigger` | `border-color` | `disabled` | `--xh-border-default` | approval 的 deny-trigger 部件 border-color 覆盖槽。 |
| `--xh-approval-deny-fg` | `deny-trigger` | `color` | `default` | `--xh-fg-default` | approval 的 deny-trigger 部件 color 覆盖槽。 |
| `--xh-approval-description-fg` | `description` | `color` | `default` | `--xh-fg-muted` | approval 的 description 部件 color 覆盖槽。 |
| `--xh-approval-description-font-size` | `description` | `font-size` | `default` | `--xh-text-secondary-size` | approval 的 description 部件 font-size 覆盖槽。 |
| `--xh-approval-footer-gap` | `footer` | `gap` | `default` | `--xh-space-2` | approval 的 footer 部件 gap 覆盖槽。 |
| `--xh-approval-gap` | `root` | `gap` | `default` | `--xh-_approval-gap` | approval 的 root 部件 gap 覆盖槽。 |
| `--xh-approval-group-gap` | `group` | `gap` | `default` | `--xh-space-1` | approval 的 group 部件 gap 覆盖槽。 |
| `--xh-approval-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-glyph-size-text` | approval 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-approval-indicator-bg-checked` | `item-indicator` | `background` | `state=checked` | `--xh-bg-brand` | approval 的 item-indicator 部件 background 覆盖槽。 |
| `--xh-approval-indicator-border` | `item-indicator` | `border` | `default` | `--xh-border-control` | approval 的 item-indicator 部件 border 覆盖槽。 |
| `--xh-approval-indicator-border-checked` | `item-indicator` | `border-color` | `state=checked` | `--xh-bg-brand` | approval 的 item-indicator 部件 border-color 覆盖槽。 |
| `--xh-approval-indicator-fg` | `item-indicator` | `color` | `default` | `--xh-fg-on-brand` | approval 的 item-indicator 部件 color 覆盖槽。 |
| `--xh-approval-indicator-radius` | `item-indicator` | `border-radius` | `default` | `--xh-shape-inset` | approval 的 item-indicator 部件 border-radius 覆盖槽。 |
| `--xh-approval-indicator-size` | `item-indicator` | `block-size`<br>`inline-size` | `default` | `--xh-control-indicator-size` | approval 的 item-indicator 部件 block-size、inline-size 覆盖槽。 |
| `--xh-approval-item-bg-hover` | `item` | `background` | `disabled`<br>`hover`<br>`not([data-disabled])` | `--xh-bg-subtle-hover` | approval 的 item 部件 background 覆盖槽。 |
| `--xh-approval-item-font-size` | `item` | `font-size` | `default` | `--xh-_approval-item-font-size` | approval 的 item 部件 font-size 覆盖槽。 |
| `--xh-approval-item-gap` | `item` | `gap` | `default` | `--xh-space-1_5` | approval 的 item 部件 gap 覆盖槽。 |
| `--xh-approval-item-px` | `item` | `padding-inline` | `default` | `--xh-space-2` | approval 的 item 部件 padding-inline 覆盖槽。 |
| `--xh-approval-item-py` | `item` | `padding-block` | `default` | `--xh-space-1` | approval 的 item 部件 padding-block 覆盖槽。 |
| `--xh-approval-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-control` | approval 的 item 部件 border-radius 覆盖槽。 |
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
| `--xh-approval-shadow` | `root` | `box-shadow` | `default` | `--xh-elevation-raised` | approval 的 root 部件 box-shadow 覆盖槽。 |
| `--xh-approval-timer-fg` | `timer` | `color` | `default` | `--xh-fg-muted` | approval 的 timer 部件 color 覆盖槽。 |
| `--xh-approval-timer-font-size` | `timer` | `font-size` | `default` | `--xh-text-caption-size` | approval 的 timer 部件 font-size 覆盖槽。 |
| `--xh-approval-title-fg` | `title` | `color` | `default` | `--xh-fg-default` | approval 的 title 部件 color 覆盖槽。 |
| `--xh-approval-title-font-size` | `title` | `font-size` | `default` | `--xh-text-label-size` | approval 的 title 部件 font-size 覆盖槽。 |
| `--xh-approval-title-font-weight` | `title` | `font-weight` | `default` | `--xh-text-label-weight` | approval 的 title 部件 font-weight 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

关键帧 `xh-approval-in` · `xh-approval-result-in` · `xh-approval-rotate` 随皮肤自带，不引用别处文件里的名字；`background` · `border-color` · `box-shadow` · `color` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
