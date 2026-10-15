---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

表单的空值判定（`isEmptyFormValue`，即 `required` 拦截的范围）扩大，必填的结果随之变化。

- 只含空白的字符串算空：空白按 Unicode 判定，与 JS 正则的 `\s` 相同，含不换行空格（U+00A0）与全角空格（U+3000）。此前只填了空格也能通过必填。
- 元素全为空的数组算空，元素逐个按同一规则判定，例如两端都没选的区间 `[null, null]`。此前只有长度为 0 的数组算空。
- `false` 与 `0` 仍不算空。「必须勾选同意」这类要求请写 `validator`，判断值是否为 `true`。
- 非必填规则对空值放行的约定不变，所以只含空白的字符串也不再进入 `type`、`min` / `max`、`pattern` 检查。

迁移：如果某个字段确实允许只填空格，就不要给它加 `required`，改为在 `validator` 里自行判断。
