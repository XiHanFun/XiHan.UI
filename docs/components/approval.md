# 审批 <Badge type="info" text="approval" />

危险动作执行前的人在环闸门：批准、拒绝，超时按拒绝收口，可带勾选式的授权范围。

## 何时使用

- Agent 要动真格之前（写文件、发请求、花钱）先问一句。
- 这次授权带范围：批准的同时要说清批的是哪几项。

## 何时不用

- 只是一句「确定吗」：用[气泡确认](./popconfirm)。
- 判定结果不影响任何执行：那不是闸门，是一个提示。

## 特性

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

## 示例

### 基础用法

勾选与判定是原子的：批准的载荷带着批的是哪几项，不存在「已批准但范围还没同步」的窗口

<XhDemo src="approval/01-basic" />

### 超时按拒绝收口

缺省不给默认超时值：替宿主定安全策略比不定更危险。到点落成拒绝，expired 只是显示态

<XhDemo src="approval/02-timeout" />

### 附一句备注

备注与勾选同批取快照，随判定载荷一起发出；空着就不带这一格，它不参与「必选项勾满了没有」的判断

<XhDemo src="approval/03-note" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-approval>` |
| Vue 组件 | `XhApprovalApproveTrigger` `XhApprovalDenyTrigger` `XhApprovalDescription` `XhApprovalFooter` `XhApprovalLiveRegion` `XhApprovalNote` `XhApprovalResult` `XhApprovalRoot` `XhApprovalScopeGroup` `XhApprovalScopeIndicator` `XhApprovalScopeItem` `XhApprovalScopeLabel` `XhApprovalTimer` `XhApprovalTitle` |
| 组合式函数 | `useApproval` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/approval.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="approval"`：**`root`** · `title` · `description` · `live-region` · `scope-group` · `scope-item` · `scope-indicator` · `scope-label` · `note` · `timer` · `result` · `footer` · **`approve-trigger`** · **`deny-trigger`**

## Props

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
| `busy` | `boolean` |  | 判定在途：只挡重复批准，不挡拒绝。 |
| `denyOnEscape` | `boolean` |  | Escape 判为拒绝，默认开。 |
| `denyOnUnmount` | `boolean` |  | 卸载时若仍待决就按拒绝派发一次，**默认关**。 机理成立不等于默认值成立：列表换 key、路由切换、热更新任何一次重挂， 都会替用户发出他没做过的判定。 |
| `live` | `'polite' \| 'assertive'` |  | 播报档位，默认 polite。 |
| `tone` | `Tone` |  |  |
| `size` | `Size` |  |  |
| `translations` | `Partial<ApprovalTranslations>` |  |  |
| `onDecision` | `(details: ApprovalDecisionDetails) => void` |  |  |
| `onGrantedScopesChange` | `(details: ApprovalScopesChangeDetails) => void` |  |  |
| `onNoteChange` | `(details: ApprovalNoteChangeDetails) => void` |  |  |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `decision` | `ApprovalDecisionDetails` | 判定落定；detail 为 `{ requestId, decision, source, scopes }` |
| `granted-scopes-change` | `ApprovalScopesChangeDetails` | 勾选的授权项变化；detail 为 `{ value: string[] }` |
| `note-change` | `ApprovalNoteChangeDetails` | 备注变化；detail 为 `{ value: string }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhApprovalRoot` | `default` | `ApprovalRootSlotProps` |  |
| `XhApprovalScopeItem` | `default` | `ApprovalScopeSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | state.get() |
| `scope-item` | 'checked' \| 'unchecked' |
| `scope-indicator` | 'checked' \| 'unchecked' |
| `note` | state.get() |
| `timer` | state.get() |
| `result` | state.get() |
| `approve-trigger` | state.get() |
| `deny-trigger` | state.get() |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**事件**：`APPROVE` · `DENY` · `SCOPE.TOGGLE` · `SCOPE.SET` · `NOTE.SET` · `after.timeout` · `CONTROLLED.PENDING` · `CONTROLLED.APPROVE` · `CONTROLLED.DENY` · `CONTROLLED.EXPIRE` · `REQUEST.RESET`

**判据**：`isStatusControlled` · `canApprove` · `isEditable` · `canApproveControlled`

## connect API

`useApproval` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `status` | `ApprovalStatus` |  |
| `settled` | `boolean` | 已经判过了：两颗按钮都收起出口。 |
| `busy` | `boolean` |  |
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
| `getScopeGroupProps` | `() => T['element']` |  |
| `getScopeItemProps` | `(scope: ApprovalScope) => T['element']` |  |
| `getScopeIndicatorProps` | `(scope: ApprovalScope) => T['element']` |  |
| `getScopeLabelProps` | `(scope: ApprovalScope) => T['element']` |  |
| `getNoteProps` | `() => T['input']` |  |
| `getTimerProps` | `() => T['element']` |  |
| `getResultProps` | `() => T['element']` |  |
| `getFooterProps` | `() => T['element']` |  |
| `getApproveTriggerProps` | `() => T['button']` |  |
| `getDenyTriggerProps` | `() => T['button']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | 焦点在批准按钮上，待决、必选项已勾满、且不在挂起中 | 判为批准，载荷带上已勾选的授权项 |
| `Enter` / `Space` | 焦点在拒绝按钮上，待决且不在挂起中 | 判为拒绝 |
| `Space` | 焦点在授权项上，待决且该项未禁用 | 勾选或取消该项。Enter 刻意不参与，与原生复选框一致 |
| `Escape` | 焦点在闸门内，待决、不在挂起中、且开着 denyOnEscape | 判为拒绝。**它不是「关闭」**——本组件不提供不作答的出口 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-describedby` | `description` 部件的 id |
| `root` | `aria-labelledby` | `title` 部件的 id |
| `root` | `role` | 'group' |
| `live-region` | `aria-atomic` | 'true' |
| `live-region` | `aria-live` | props.live |
| `scope-group` | `aria-label` | translations?.scopes |
| `scope-group` | `role` | 'group' |
| `scope-item` | `aria-checked` | 'true' \| 'false' |
| `scope-item` | `aria-disabled` | 'true' \| 'false' |
| `scope-item` | `aria-required` | 'true' \| 'false' |
| `scope-item` | `role` | 'checkbox' |
| `scope-indicator` | `aria-hidden` | 'true' |
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

## 样式

默认皮肤 `@xihan-ui/styles/approval.css` 按部件选择：`[data-scope="approval"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-loading` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-state` | state.get() |
| `root` | `data-tone` | props.tone |
| `scope-item` | `data-disabled` | ''（条件成立时才出现） |
| `scope-item` | `data-state` | 'checked' \| 'unchecked' |
| `scope-item` | `data-value` | item.value |
| `scope-indicator` | `data-state` | 'checked' \| 'unchecked' |
| `scope-label` | `data-value` | item.value |
| `note` | `data-state` | state.get() |
| `timer` | `data-state` | state.get() |
| `result` | `data-state` | state.get() |
| `approve-trigger` | `data-loading` | ''（条件成立时才出现） |
| `approve-trigger` | `data-state` | state.get() |
| `deny-trigger` | `data-loading` | ''（条件成立时才出现） |
| `deny-trigger` | `data-state` | state.get() |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-approval-action-font-size` · `--xh-approval-action-font-weight` · `--xh-approval-action-h` · `--xh-approval-action-px` · `--xh-approval-action-radius` · `--xh-approval-approve-bg` · `--xh-approval-approve-bg-hover` · `--xh-approval-approve-bg-off` · `--xh-approval-approve-fg` · `--xh-approval-approve-shadow` · `--xh-approval-bg` · `--xh-approval-border` · `--xh-approval-border-settled` · `--xh-approval-deny-bg` · `--xh-approval-deny-bg-hover` · `--xh-approval-deny-bg-off` · `--xh-approval-deny-border` · `--xh-approval-deny-border-off` · `--xh-approval-deny-fg` · `--xh-approval-description-fg` · `--xh-approval-description-font-size` · `--xh-approval-footer-gap` · `--xh-approval-gap` · `--xh-approval-icon-size` · `--xh-approval-indicator-bg-checked` · `--xh-approval-indicator-border` · `--xh-approval-indicator-border-checked` · `--xh-approval-indicator-fg` · `--xh-approval-indicator-radius` · `--xh-approval-indicator-size` · `--xh-approval-loading-duration` · `--xh-approval-note-bg` · `--xh-approval-note-border` · `--xh-approval-note-fg` · `--xh-approval-note-font-size` · `--xh-approval-note-px` · `--xh-approval-note-py` · `--xh-approval-note-radius` · `--xh-approval-p` · `--xh-approval-radius` · `--xh-approval-result-bg` · `--xh-approval-result-bg-denied` · `--xh-approval-result-fg` · `--xh-approval-result-fg-denied` · `--xh-approval-result-font-size` · `--xh-approval-result-font-weight` · `--xh-approval-result-gap` · `--xh-approval-result-px` · `--xh-approval-result-py` · `--xh-approval-result-radius` · `--xh-approval-scope-bg-hover` · `--xh-approval-scope-fg` · `--xh-approval-scope-fg-checked` · `--xh-approval-scope-font-size` · `--xh-approval-scope-gap` · `--xh-approval-scope-item-gap` · `--xh-approval-scope-px` · `--xh-approval-scope-py` · `--xh-approval-scope-radius` · `--xh-approval-shadow` · `--xh-approval-timer-fg` · `--xh-approval-timer-font-size` · `--xh-approval-title-fg` · `--xh-approval-title-font-size` · `--xh-approval-title-font-weight`

## 动效

关键帧 `xh-approval-in` · `xh-approval-result-in` · `xh-approval-rotate` 随皮肤自带，不引用别处文件里的名字；状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 装进[工具调用](./tool-call)的 `approval` 部件位：那一格常驻在开关与详情之间，不会被折叠藏起来。
- 要弹窗就一条一个[对话框](./dialog)：`role="alertdialog"`、关掉 `closeOnEscape`，
  并把 `initialFocus` 设成本组件导出的 `APPROVAL_DENY_SELECTOR`——
  这样浮层只剩批准与拒绝两个出口，而 Escape 仍会冒泡到闸门上判拒绝。
- 剩余时间的跳字交给[倒计时](./countdown)，判定权仍在本组件手里。
  **别把倒计时直接当 `timer` 那个节点渲**：两套解剖打在同一节点上会互相盖，
  让 `timer` 做外层容器、倒计时住在它里面。
- 要一次问好几件事：用[步骤条](./steps)或[走马灯](./carousel)串起若干个闸门，一步一个。
  本组件是单发闸门，`data-state` 的四个值互斥，塞不下「第几题」。
- 要给用户「稍后再说」：那个入口归宿主，不归闸门。
  常见做法是在 `onDecision` 之外自己留一条延后的路，或按上一条把闸门装进对话框——
  浮层里仍只有批准与拒绝两个出口。

## 最佳实践

- 判定落定后两颗按钮都会禁用，浮层再无出口：**宿主必须在判定回调里自己关闭浮层**。
- 卸载即拒绝（`denyOnUnmount`）默认关着。开之前想清楚：列表换 key、路由切换、
  热更新任何一次重挂，都会替用户发出他没做过的判定。

## 反模式

- 把超时做成「到点自动放行」：那等于把最危险的一档交给了沉默。
- 用一个可关闭的浮层承载它：关掉窗口既不是批准也不是拒绝，闸门就悬空了。
