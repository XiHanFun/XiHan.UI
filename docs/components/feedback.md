# 反馈与浮层

打断或补充当前视线的组件。其中 `dialog` / `drawer` / `popover` / `tooltip` / `hover-card` 带 `positioner` 部件，由 `@xihan-ui/position` 定位；坐标系（`absolute` / `fixed`）在机器、`connect` 与皮肤三处必须一致，有门禁看着。

本页 11 个组件：对话框（`dialog`）、抽屉（`drawer`）、气泡卡片（`popover`）、文字提示（`tooltip`）、悬浮卡片（`hover-card`）、警告提示（`alert`）、轻提示（`toast`）、轻提示容器（`toaster`）、进度条（`progress`）、加载指示器（`spinner`）、加载条（`loading-bar`）。

每个组件三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。部件（part）名即 `data-part` 属性值，也是皮肤的选择器；加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

---

## 对话框 <Badge type="info" text="dialog" /> {#dialog}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-dialog>` |
| Vue 组件 | `XhDialogCloseTrigger` `XhDialogContent` `XhDialogDescription` `XhDialogRoot` `XhDialogTitle` `XhDialogTrigger` |
| 组合式函数 | `useDialog` |
| 状态机 | `dialogMachine` |
| 皮肤 | `@xihan-ui/styled/dialog.css` |

**解剖**（`data-scope="dialog"`，加粗为必备部件）

`trigger` · `backdrop` · `positioner` · **`content`** · `title` · `description` · `close-trigger`

**键盘**（规格出处：[W3C APG · dialog-modal 模式](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/#keyboardinteraction)）

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus in trigger | 打开对话框并把焦点移入 content |
| `Escape` | open | 关闭并把焦点还给 trigger |
| `Tab` | open | 在 content 内向后循环焦点 |
| `Shift+Tab` | open | 在 content 内向前循环焦点 |

---

## 抽屉 <Badge type="info" text="drawer" /> {#drawer}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-drawer>` |
| Vue 组件 | `XhDrawerCloseTrigger` `XhDrawerContent` `XhDrawerDescription` `XhDrawerRoot` `XhDrawerTitle` `XhDrawerTrigger` |
| 组合式函数 | `useDrawer` |
| 状态机 | `drawerMachine` |
| 皮肤 | `@xihan-ui/styled/drawer.css` |

**解剖**（`data-scope="drawer"`，加粗为必备部件）

**`root`** · `trigger` · `backdrop` · `positioner` · **`content`** · `title` · `description` · `close-trigger`

**键盘**（规格出处：[W3C APG · dialog-modal 模式](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/#keyboardinteraction)）

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus in trigger | 打开抽屉并把焦点移入 content |
| `Escape` | open | 关闭并把焦点还给 trigger |
| `Tab` | open 且 modal | 在 content 内向后循环焦点 |
| `Shift+Tab` | open 且 modal | 在 content 内向前循环焦点 |

---

## 气泡卡片 <Badge type="info" text="popover" /> {#popover}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-popover>` |
| Vue 组件 | `XhPopoverArrow` `XhPopoverCloseTrigger` `XhPopoverContent` `XhPopoverDescription` `XhPopoverPositioner` `XhPopoverRoot` `XhPopoverTitle` `XhPopoverTrigger` |
| 组合式函数 | `usePopover` |
| 状态机 | `popoverMachine` |
| 皮肤 | `@xihan-ui/styled/popover.css` |

**解剖**（`data-scope="popover"`，加粗为必备部件）

**`trigger`** · `positioner` · **`content`** · `title` · `description` · `close-trigger` · `arrow`

**键盘**（规格出处：[W3C APG · dialog-modal 模式](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/#keyboardinteraction)）

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus in trigger | 切换开合，展开时把焦点移入 content |
| `Escape` | open | 关闭并把焦点还给 trigger |
| `Tab` | open 且 modal | 在 content 内向后循环焦点 |
| `Shift+Tab` | open 且 modal | 在 content 内向前循环焦点 |

---

## 文字提示 <Badge type="info" text="tooltip" /> {#tooltip}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-tooltip>` |
| Vue 组件 | `XhTooltipArrow` `XhTooltipContent` `XhTooltipPositioner` `XhTooltipRoot` `XhTooltipTrigger` |
| 组合式函数 | `useTooltip` |
| 状态机 | `tooltipMachine` |
| 皮肤 | `@xihan-ui/styled/tooltip.css` |

**解剖**（`data-scope="tooltip"`，加粗为必备部件）

**`trigger`** · `positioner` · **`content`** · `arrow`

**键盘**（规格出处：[W3C APG · tooltip 模式](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/#keyboardinteraction)）

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | not disabled | 焦点进入 trigger 立即展开、离开立即收起，都不走延时 |
| `Escape` | focus in trigger, 展开或等待展开中 | 立即收起，不等 closeDelay |

---

## 悬浮卡片 <Badge type="info" text="hover-card" /> {#hover-card}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-hover-card>` |
| Vue 组件 | `XhHoverCardArrow` `XhHoverCardContent` `XhHoverCardPositioner` `XhHoverCardRoot` `XhHoverCardTrigger` |
| 组合式函数 | `useHoverCard` |
| 状态机 | `hoverCardMachine` |
| 皮肤 | `@xihan-ui/styled/hover-card.css` |

**解剖**（`data-scope="hover-card"`，加粗为必备部件）

`root` · **`trigger`** · `positioner` · **`content`** · `arrow`

**键盘**（规格出处：[W3C APG · dialog-modal 模式](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/#keyboardinteraction)）

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | not disabled | 焦点进入 trigger 立即展开、离开卡片即收起，都不走延时 |
| `Escape` | 浮层可见（含收起等待期） | 立即收起，不等 closeDelay |

---

## 警告提示 <Badge type="info" text="alert" /> {#alert}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-alert>` |
| Vue 组件 | `XhAlertCloseTrigger` `XhAlertDescription` `XhAlertIcon` `XhAlertRoot` `XhAlertTitle` |
| 状态机 | `alertMachine` |
| 皮肤 | `@xihan-ui/styled/alert.css` |

**解剖**（`data-scope="alert"`，加粗为必备部件）

**`root`** · `icon` · `title` · `description` · `close-trigger`

**键盘**（规格出处：[W3C APG · alert 模式](https://www.w3.org/WAI/ARIA/apg/patterns/alert/)）

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus 在 close-trigger 上且 closable | 收起提示并通知 open=false |

---

## 轻提示 <Badge type="info" text="toast" /> {#toast}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-toast>` |
| Vue 组件 | `XhToastActionTrigger` `XhToastCloseTrigger` `XhToastDescription` `XhToastRoot` `XhToastTitle` |
| 组合式函数 | `useToast` |
| 状态机 | `toastMachine` |
| 皮肤 | `@xihan-ui/styled/toast.css` |

**解剖**（`data-scope="toast"`，加粗为必备部件）

**`root`** · `title` · `description` · `action-trigger` · `close-trigger`

**键盘**（规格出处：[W3C APG · alert 模式](https://www.w3.org/WAI/ARIA/apg/patterns/alert/)）

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus 在 close-trigger 上且 closable | 立即进入 dismissing，走完 removeDelay 后转 unmounted |
| `Enter` / `Space` | focus 在 action-trigger 上 | 触发 onAction 并进入 dismissing |

---

## 轻提示容器 <Badge type="info" text="toaster" /> {#toaster}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-toaster>` |
| Vue 组件 | `XhToasterGroup` `XhToasterRoot` |
| 组合式函数 | `useToaster` |
| 状态机 | `toasterMachine` |
| 皮肤 | `@xihan-ui/styled/toaster.css` |

**解剖**（`data-scope="toaster"`，加粗为必备部件）

**`root`** · **`group`**

**键盘**（规格出处：[W3C APG · alert 模式](https://www.w3.org/WAI/ARIA/apg/patterns/alert/)）

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

---

## 进度条 <Badge type="info" text="progress" /> {#progress}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-progress>` |
| Vue 组件 | `XhProgress` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styled/progress.css` |

**解剖**（`data-scope="progress"`，加粗为必备部件）

**`root`** · `track` · `range`

**键盘**（规格出处：[W3C APG · meter 模式](https://www.w3.org/WAI/ARIA/apg/patterns/meter/)）

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

---

## 加载指示器 <Badge type="info" text="spinner" /> {#spinner}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-spinner>` |
| Vue 组件 | `XhSpinner` `XhSpinnerLabel` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styled/spinner.css` |

**解剖**（`data-scope="spinner"`，加粗为必备部件）

**`root`** · `label`

**键盘**（规格出处：[W3C APG · live-regions 实践](https://www.w3.org/WAI/ARIA/apg/practices/live-regions/)）

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

---

## 加载条 <Badge type="info" text="loading-bar" /> {#loading-bar}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-loading-bar>` |
| Vue 组件 | `XhLoadingBarRange` `XhLoadingBarRoot` `XhLoadingBarTrack` |
| 组合式函数 | `useLoadingBar` |
| 状态机 | `loadingBarMachine` |
| 皮肤 | `@xihan-ui/styled/loading-bar.css` |

**解剖**（`data-scope="loading-bar"`，加粗为必备部件）

**`root`** · `track` · **`range`**

**键盘**（规格出处：[WAI-ARIA 1.2 · progressbar](https://www.w3.org/TR/wai-aria-1.2/#progressbar)）

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。
