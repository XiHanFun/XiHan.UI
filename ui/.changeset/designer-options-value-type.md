---
"@xihan-ui/core": minor
---

**新增** `@xihan-ui/core/options` 的 `findOptionViolation` 新增选项 `isValue`，换掉缺省只收字符串的 `value` 检查，不合要求报 `invalid-value`；重复按 `Object.is` 判。供取值不是文字的选项列表（如报表参数候选项）用。
