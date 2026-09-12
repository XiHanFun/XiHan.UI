---
'@xihan-ui/styles': patch
---

修复 Action Control Family Recipe 会省略默认值相同状态声明的问题；hover、focus-visible、disabled、loading 等状态现在始终保留各自的 `--xh-action-*` 覆盖槽。
