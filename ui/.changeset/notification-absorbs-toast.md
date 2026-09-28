---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
'@xihan-ui/styles': major
---

轻提示并入通知：Toast 整个组件删除，同一种「到期自行消失的消息」只剩一个 Notification，用 `preset` 区分两种形态。`card`（缺省）是主动推送的两层卡片，`toast` 是刚才那个操作的一句结果。两种预设的缺省值由 Headless 的 `NOTIFICATION_PRESETS` 统一给出，三端读同一份：

| 缺省值 | `card` | `toast` |
| --- | --- | --- |
| `placement` | `bottom-end` | `bottom` |
| `max`（每个落位） | 5 | 3 |
| `gap` | 16 | 12 |
| `duration` | 5000 | 4000 |
| `stacked` | 不叠 | 叠成一摞，指针或焦点进入即展开，整摞计时一并按住 |
| `pauseOnPageIdle` | 关闭 | 开启 |
| 卡片排版 | 两列网格，叉钉在右上角（sm） | 一行，叉排在行尾（xs），有悬停能力时悬停或聚焦才显现 |

原 Toast 的能力都在轻提示预设里：加载环与语气字形交叉淡变、`loading` / `promise`、行内动作、倒计时条、叠放与展开、页面闲置暂停、`max` 与 `dedupe`。叠放从轻提示专有变成通知的开关，卡片也可以 `stacked`。旧名一律不保留，没有转发别名。

## 服务

```ts
// 之前
import { createToastService } from '@xihan-ui/vue'
const toast = createToastService({ placement: 'top' })

// 之后
import { createNotificationService } from '@xihan-ui/vue'
const toast = createNotificationService({ preset: 'toast', placement: 'top' })
```

React 与 Web Components（`@xihan-ui/web-components/services`）同样改法。句柄的方法（`create` / `update` / `dismiss` / `info` / `success` / `warning` / `danger` / `loading` / `promise` / `pauseAll` / `resumeAll` / `setConfig` / `dispose`）不变；语气快捷方法的第一个参数仍是标题。

| 旧 | 新 |
| --- | --- |
| `createToastService(options)` | `createNotificationService({ preset: 'toast', ...options })` |
| `ToastService` / `ToastServiceOptions` | `NotificationService` / `NotificationServiceOptions` |
| `ToastCreateOptions` / `ToastMessageOptions` / `ToastPromiseOptions` | `NotificationCreateOptions` / `NotificationMessageOptions` / `NotificationPromiseOptions` |
| `ToastTranslationsSource`（React） | `NotificationTranslationsSource` |
| 服务选项 `toastTranslations` | `translations` |
| 服务选项里没有的 `stacked` / `duration` / `pauseOnPageIdle` 缺省 | 现在都可以在创建时改写，缺省随预设 |

## 组件

| 旧 | 新 |
| --- | --- |
| `XhToastRoot` | `XhNotificationItem`，写 `preset="toast"` |
| `XhToastIndicator` / `XhToastContent` / `XhToastTitle` / `XhToastDescription` | `XhNotificationItemIndicator` / `XhNotificationItemContent` / `XhNotificationItemTitle` / `XhNotificationItemDescription` |
| `XhToastActionTrigger` / `XhToastProgress` / `XhToastCloseTrigger` | `XhNotificationItemActionTrigger` / `XhNotificationItemProgress` / `XhNotificationItemCloseTrigger` |
| `XhToast*Props`（React） | `XhNotificationItem*Props` |
| `ToastRootSlotProps` | `NotificationItemSlotProps` |
| `useToast` / `ToastContext` | `useNotificationItem` / `NotificationItemContext` |
| `useToastContext`（React） | `useNotificationItemContext` |
| `<xh-toast>` | `<xh-notification-item preset="toast">` |
| Light DOM 作者节点 `data-xh-part="indicator"` / `content` / `title` / `description` / `action-trigger` / `progress` / `close-trigger` | `item-indicator` / `item-content` / `item-title` / `item-description` / `item-action-trigger` / `item-progress` / `item-close-trigger` |
| 事件 `status-change` / `action` | 同名；Vue 的 `action` 现在与 React / Web Components 一样带 `{ id }` |

`XhNotificationRoot` / `<xh-notification>` 新增 `preset` 与 `stacked`；`XhNotificationItem` / `<xh-notification-item>` 新增 `preset`，队列交下来的条目自带 `preset`，自己铺卡片时要带上。单独使用的轻提示条目现在缺省在页面转入后台时暂停计时（原 `<xh-toast>` 单用时缺省关闭），写 `pauseOnPageIdle={false}` / `pause-on-page-idle="false"` 回到旧行为。单独摆放、不在叠放的一摞里的轻提示改走面板的进出场（淡入并轻微缩放），叠放档仍从视口边缘推入。

新增 `XhNotificationItemContent`：标题与说明的文本列，两种预设都用它包住 `item-title` 与 `item-description`。

## Headless

| 旧 | 新 |
| --- | --- |
| `toastMachine` / `ToastSchema` / `ToastApi` | `notificationItemMachine` / `NotificationItemSchema` / `NotificationItemApi` |
| `connectToast` | `connectNotificationItem` |
| `toastAnatomy` / `toastKeyboard` / `toastMeta` | `notificationAnatomy` / `notificationKeyboard` / `notificationMeta` |
| `resolveToastDuration(loading, duration)` | `resolveNotificationDuration(loading, duration, preset)` |
| `resolveToastId` | `resolveNotificationItemId` |
| `TOAST_DURATION` / `TOAST_GAP` / `TOAST_MAX` / `TOAST_PLACEMENT` | `NOTIFICATION_PRESETS.toast.duration` / `.gap` / `.max` / `.placement` |
| `NOTIFICATION_GAP` / `NOTIFICATION_MAX` / `NOTIFICATION_PLACEMENT` | `NOTIFICATION_PRESETS.card.gap` / `.max` / `.placement`，或 `notificationPresetOf(preset)` |
| `createToastStackController` / `ToastStackController` / `ToastStackControllerOptions` | 删除：叠放由 `notificationMachine` 的 `stacked` 接管，展开状态进了机器（`STACK.EXPAND` / `STACK.COLLAPSE`，Esc 收起） |
| `resolveToastServiceItem` / `ResolvedToastServiceItem` / `ToastServiceDefaults` | 删除：服务条目按 `ResolvedNotification` 解析，缺省值取 `notificationPresetOf` |
| `ToastTone` / `ToastStatus` / `ToastPlacement` / `ToastPauseSource` / `ToastPressedPart` | `NotificationTone` / `NotificationStatus` / `NotificationPlacement` / `NotificationPauseSource`（多一个 `'stack'`） / `NotificationPressedPart` |
| `ToastRecord` / `ToastOptions` / `ToastTranslations` | `NotificationRecord` / `NotificationOptions` / `NotificationTranslations` |
| `ToastStatusChangeDetails` / `ToastActionDetails` | `NotificationStatusChangeDetails` / `NotificationActionDetails` |
| 事件 `TOAST.DISMISS` / `TOAST.ACTION` / `TOAST.PAUSE` / `TOAST.RESUME` / `TOAST.RESET` | `ITEM.DISMISS` / `ITEM.ACTION` / `ITEM.PAUSE` / `ITEM.RESUME` / `ITEM.RESET` |
| `getRootProps` / `getIndicatorProps` / `getContentProps` / `getTitleProps` / `getDescriptionProps` | `getItemProps` / `getItemIndicatorProps` / `getItemContentProps` / `getItemTitleProps` / `getItemDescriptionProps` |
| `getActionTriggerProps` / `getProgressProps` / `getCloseTriggerProps` | `getItemActionTriggerProps` / `getItemProgressProps` / `getItemCloseTriggerProps` |
| `createFeedbackServiceController` 的 `idPrefix` 选项 | 删除：条目 id 统一由队列生成 |
| 全局配置文案桶 `translations.toast` | `translations.notification`（`region` 与 `close`） |

## 样式

`@xihan-ui/styles/css/toast.css` 子路径删除，轻提示的皮肤在 `css/notification.css` 里按 `[data-preset='toast']` 分支。

| 旧 | 新 |
| --- | --- |
| `[data-scope='toast'][data-part='root']` | `[data-scope='notification'][data-part='item'][data-preset='toast']` |
| `[data-scope='toast'][data-part='group']` | `[data-scope='notification'][data-part='group'][data-preset='toast']`（叠放时另带 `data-stacked`，展开时带 `data-expanded`） |
| `[data-scope='toast'][data-part='<部件>']` | `[data-scope='notification'][data-part='item-<部件>']` |
| `--xh-toast-bg` / `-border` / `-shadow` / `-radius` / `-fg` | `--xh-notification-item-bg` / `-border` / `-shadow` / `-radius` / `-fg` |
| `--xh-toast-px` / `-py` / `-gap` / `-font-size` / `-leading` | `--xh-notification-item-px` / `-py` / `-gap` / `-font-size` / `-leading` |
| `--xh-toast-inline-size` | `--xh-notification-item-w` |
| `--xh-toast-inset` / `--xh-toast-layer` | `--xh-notification-inset` / `--xh-notification-layer` |
| `--xh-toast-title-*` / `--xh-toast-description-*` | `--xh-notification-title-*` / `--xh-notification-description-*`（后缀不变） |
| `--xh-toast-icon-fg` / `--xh-toast-icon-size` / `--xh-toast-indicator-p` | `--xh-notification-indicator-fg` / `--xh-notification-icon-size` / `--xh-notification-indicator-p` |
| `--xh-toast-action-*` / `--xh-toast-close-*` / `--xh-toast-progress-*` | `--xh-notification-action-*` / `--xh-notification-close-*` / `--xh-notification-progress-*`（后缀不变） |
| `--xh-toast-scale-collapsed` | `--xh-notification-stack-scale` |
| `--xh-toast-offset-collapsed` / `-offset-expanded` / `-front-height` / `-height` / `-y` / `-scale` / `-dir` | 删除：叠放测量改写私有槽，不再是可覆盖的公开面 |
| 关键帧 `xh-toast-in` / `xh-toast-out` | `xh-notification-stack-in` / `xh-notification-stack-out` |

通知新增 `--xh-notification-close-border`，两种预设的叉都认它（原来只有 Toast 有）。z 层级令牌 `--xh-layer-toast` / `--xh-z-toast` 保留原名，它说的是这一层，不是组件。
