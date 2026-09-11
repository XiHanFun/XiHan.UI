---
'@xihan-ui/styles': patch
---

修正 Select / Listbox 选中项的普通字重引用，统一使用已声明的 `--xh-font-weight-regular`。
此前误写未声明的 `--xh-font-weight-normal`，浏览器继承值掩盖了问题；令牌引用门禁明确验证此引用。
