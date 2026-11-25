---
'@xihan-ui/headless': major
---

**破坏性** 通知服务的 headless 控制器从 `Feedback*` 改叫 `Notification*`，与 `createDialogServiceController`、`createLoadingBarServiceController` 和适配器侧的 `createNotificationService` 对上；标题规则并进同一个文件，不再放在 shared 里。

| 旧名 | 新名 |
| --- | --- |
| `createFeedbackServiceController` | `createNotificationServiceController` |
| `FeedbackServiceController`、`FeedbackServiceControllerOptions`、`FeedbackServiceControllerState` | `NotificationServiceController`、`NotificationServiceControllerOptions`、`NotificationServiceControllerState` |
| `FeedbackServiceQueue`、`FeedbackServiceRecord` | `NotificationServiceQueue`、`NotificationServiceRecord` |
| `resolveFeedbackServiceTitle`、`FeedbackServiceTitleRecord` | `resolveNotificationServiceTitle`、`NotificationServiceTitleRecord` |
