---
'@xihan-ui/designer-kit': minor
---

导入器可写 `fileTypes`（MIME 类型或扩展名，如 `application/json`、`image/*`、`.json`），新增 `importerAccept(importers)` 把各导入器的类型去重拼成打开文件时选择框的 `accept`；都没写时为空串，不限类型。
