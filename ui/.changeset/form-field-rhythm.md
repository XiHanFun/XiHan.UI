---
'@xihan-ui/styles': patch
---

**修复** Form 与 Fieldset 的项距：带 `XhFieldDescription` 的字段在说明下面照常留一段项距（`--xh-form-gap` / `--xh-fieldset-gap`，缺省 `--xh-space-5`），说明文字不再贴着下一项的标签；给错误文案留了一行、那一行空着的字段仍以那一行当项距。带说明与不带说明的字段交替排时，上一项看得见的内容到下一项标签都隔一段项距；字段转无效时错误文案顶替说明那一行，后面的字段不挪位。Web Components 里字段直接放进表单或字段集（直接子项是 `<xh-field>`）时，只留了错误行的字段不再多留一段项距，与 Vue / React 一致。只改皮肤。
