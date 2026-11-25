---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
---

**破坏性** TagsInput 的标签个数上限从 `max` 改叫 `maxTags`：条数上限一律叫 `max<对象>`（`maxSelected`、`maxFiles`、`maxItems`），裸 `max` 留给数值的上限。API 与计数插槽里的同名字段一并改。

| 旧名 | 新名 |
| --- | --- |
| `max`（WC attribute `max`） | `maxTags`（Vue 模板与 WC attribute `max-tags`） |
| `api.max`、计数插槽的 `max` | `api.maxTags`、计数插槽的 `maxTags` |
