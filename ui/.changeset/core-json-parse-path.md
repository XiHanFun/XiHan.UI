---
'@xihan-ui/core': minor
---

`@xihan-ui/core/json` 新增路径文字的解析，与 `formatJsonPath` 互逆，作为整个生态唯一的路径文本语法。

- `parseJsonPath(text)`：把 `order.items[0].name`、`[0].字段["a b"].$page` 这样的文字解析成 `JsonPath`；`parseJsonPath(formatJsonPath(path))` 总是得到原路径。首段是标识符或方括号段，其后每段是「. 标识符」或方括号段；方括号里是不带前导零的非负整数（数组下标），或 JSON 字符串（对象键）。标识符同 JavaScript，含中文与 `$`、`_` 开头（如 `$page`、`$row`）。空串解析为空路径。
- 文字不合法、下标超出安全整数、出现 `__proto__` / `prototype` / `constructor` 时抛 `JsonPathError`，`code` 为 `invalid-path`。
- `isJsonPathText(text)`：同一文法的格式检查，不抛异常，供字段输入框等处校验。
