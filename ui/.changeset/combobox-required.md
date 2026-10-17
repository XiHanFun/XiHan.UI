---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

组合框（Combobox）新增 `required`。放进字段（Field）或表单（Form）时自动继承，实例显式给的值优先；Web Components 为 `required` 属性。

- 输入框报告 `aria-required`，缺省显式 `false`；根与标题带 `data-required`，标题据此画星号。
- 表单影子一个选中值一份，没选值时一份都没有。必填且没选值时补一份空值的占位影子：视觉隐藏的文本输入，带原生 `required`，拦下空表单的提交。`getHiddenInputProps` 的 `value` 因此改为可选，不给即取这份占位。
