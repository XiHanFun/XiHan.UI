---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**新增** 文本框的掩码 `mask`：`9` 收数字、`a` 收字母、`*` 收字母或数字，其余字符是分隔符，按到那一位时自动补上（`\` 转义）。值是排好的串，`onValueChange` 另带去掉分隔符的 `unmaskedValue`，API 新增 `unmaskedValue` 与 `maskComplete`；光标落在排好之后的位置，只收数字的掩码请移动端弹数字键盘。headless 另导出 `applyTextFieldMask`，宿主要在别处按同一个掩码排值时直接用它。
