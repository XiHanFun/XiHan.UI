---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
---

**破坏性** Timestamp 的呈现方式从 `type` 改叫 `display`（`format` 已是自定义格式串，不能同名），根上的状态属性随之从 `data-format` 改叫 `data-display`。取值不变：`date`、`datetime`（缺省）、`relative`。

| 旧名 | 新名 |
| --- | --- |
| `type`（WC attribute `type`） | `display`（WC attribute `display`） |
| 类型 `TimestampType` | `TimestampDisplay` |
| `data-format` | `data-display` |
