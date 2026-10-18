---
'@xihan-ui/designer-kit': minor
'@xihan-ui/designer-shell': minor
---

属性描述新增两种写法：`text` 加 `secret`，给密钥这类不该明文显示的文字，属性面板与 `createPropertyField` 用 `<xh-password-input>`，缺省不显示明文、浏览器不代填；新的内建编辑方式 `swatch`，取值是某个选项的 `value`，选项（`PropertySwatchOption`）给出格子画的颜色与名字，属性面板画成 `<xh-color-swatch-picker>` 的一组色块，`custom` 为 true 时下面另有颜色框，可填任意十六进制色。`checkPropertyValue` 跟着检查，`BUILTIN_CONTROL_KINDS` 加上 `swatch`，扩展不能再登记同名的编辑方式。
