---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
---

**破坏性** Timer 的起点与终点从 `startMs / targetMs` 改叫 `startValue / targetValue`：它们与受控的 `value` 是同一种读数（毫秒），全库的时长与读数都不带单位后缀。单位仍是毫秒。

| 旧名 | 新名 |
| --- | --- |
| `startMs`（WC attribute `start-ms`） | `startValue`（Vue 模板与 WC attribute `start-value`） |
| `targetMs`（WC attribute `target-ms`） | `targetValue`（Vue 模板与 WC attribute `target-value`） |
