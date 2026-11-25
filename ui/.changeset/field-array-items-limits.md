---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
---

**破坏性** FieldArray 的行数上下限从 `min / max` 改叫 `minItems / maxItems`：条数上下限一律叫 `<min|max><对象>`，裸 `min / max` 留给数值的上下限（行里常放的 NumberField 就用它们，同一段模板里两种意思挨着最容易写错）。

| 旧名 | 新名 |
| --- | --- |
| `min`（WC attribute `min`） | `minItems`（Vue 模板与 WC attribute `min-items`） |
| `max`（WC attribute `max`） | `maxItems`（Vue 模板与 WC attribute `max-items`） |
