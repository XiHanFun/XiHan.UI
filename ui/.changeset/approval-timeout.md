---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
---

**破坏性** Approval 的超时从 `timeoutMs` 改叫 `timeout`：全库四十多个毫秒时长都不带单位后缀（Clipboard 的 `timeout`、Notification 的 `duration`、Tooltip 的 `openDelay`），只有它带。单位仍是毫秒，不设就不计时。

| 旧名 | 新名 |
| --- | --- |
| `timeoutMs`（WC attribute `timeout-ms`） | `timeout`（WC attribute `timeout`） |
