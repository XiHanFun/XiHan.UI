---
'@xihan-ui/sound': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
---

反馈服务的声音包装改名，不再绑定轻提示：`@xihan-ui/sound` 的装饰器与类型、Vue / React `sound` 子入口的包装函数一律改用 Notification 的名字，旧名不保留。适配器侧的包装改为按结构化端口泛型，传入哪个服务就原样交回哪个服务的类型。

| 旧 | 新 |
| --- | --- |
| `withToastSoundService`（`@xihan-ui/sound`） | `withNotificationSoundService` |
| `ToastSoundServicePort` | `NotificationSoundServicePort` |
| `ToastSoundServiceOptions` | `NotificationSoundServiceOptions` |
| `ToastSoundKey` | `NotificationSoundKey`（Vue / React 的 `sound` 子入口同时导出） |
| `withToastSound`（`@xihan-ui/vue/sound`、`@xihan-ui/react/sound`） | `withNotificationSound` |
| `ToastSoundOptions` | `NotificationSoundOptions` |

迁移只改名字，选项、声音映射（四档语气各一把、`loading` 静音、`update` 只在改语气或打开 `loading` 时发声）与返回值不变：

```ts
// 之前
import { withToastSound } from '@xihan-ui/vue/sound'
export const toast = withToastSound(createToastService())

// 之后
import { withNotificationSound } from '@xihan-ui/vue/sound'
export const toast = withNotificationSound(createToastService())
```
