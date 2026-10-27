---
'@xihan-ui/styles': patch
---

**修复** 宿主写了 `[hidden] { display: none !important }`（Tailwind v4 的 preflight、VitePress 默认主题都这样写）时，表单与字段集里只给错误文案留了一行的字段项距塌成 0。那一行原本靠收起的错误文案留在流里撑出来，被这条规则收成 `display: none` 后跟着没了；现在改由字段根自己的下内边距留出，收起的错误文案用等高的负下外边距落进这段内边距里淡出。常规宿主下渲染与之前一致；带这条规则的宿主里只少了退场淡出。FieldArray 表格格里的字段仍不留这一行。
