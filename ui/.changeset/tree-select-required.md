---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

树选择（TreeSelect）新增 `required`，放进字段（Field）或表单（Form）时自动继承，实例显式给的值优先；Web Components 为 `required` 属性。

- 触发钮（role=combobox）写 `aria-required`，缺省显式 false；根与标题写 `data-required`，标题据此画星号。
- 一个选中值一份表单影子，没选值时没有影子；必填时表单出口补一份空值的占位影子（视觉隐藏的文本输入）带原生 `required`，拦下空表单的提交。`getHiddenInputProps()` 不给 value 即取这份占位。
