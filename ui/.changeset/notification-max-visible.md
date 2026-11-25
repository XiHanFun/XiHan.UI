---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
---

**破坏性** Notification 每个位置最多同时显示几条从 `max` 改叫 `maxVisible`：它是展示上限，不是数值上限，条数上限一律叫 `max<对象>`。根组件、命令式服务的入参与预设缺省值一并改。

| 旧名 | 新名 |
| --- | --- |
| `max`（WC attribute `max`） | `maxVisible`（Vue 模板与 WC attribute `max-visible`） |
| `createNotificationService({ max })` | `createNotificationService({ maxVisible })` |
| `NOTIFICATION_PRESETS.card.max`、`.toast.max` | `NOTIFICATION_PRESETS.card.maxVisible`、`.toast.maxVisible` |
