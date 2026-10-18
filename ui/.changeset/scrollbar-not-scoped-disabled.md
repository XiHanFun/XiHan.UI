---
'@xihan-ui/headless': minor
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

Scrollbar 不再随 Fieldset 的整组禁用（或全局配置里的 `disabled`）一起禁用，`disabled` 只认写在它自己身上的值。组内的滚动区照常可以滚动、拖动；Select、FormatInput 这类控件的列表里内嵌的滚动条也不再被压成禁用。headless 新增 `DISABLED_IS_NOT_SCOPED`，登记不吃作用域禁用的组件，与 `SIZE_IS_NOT_AXIS` 同一形式。
