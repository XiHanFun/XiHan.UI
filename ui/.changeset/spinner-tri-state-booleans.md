---
'@xihan-ui/web-components': patch
---

**修复** `xh-spinner` 的 `overlay`、`fullscreen` 改用库里统一的三态布尔：写 `overlay="false"` 即为假（原先按原生布尔，写了就算真），`loading` 的转换器也换成同一份。
