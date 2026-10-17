---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

穿梭框（Transfer）新增 `required`：至少移过去一项。放进字段（Field）或表单（Form）时自动继承，实例显式给的值优先；Web Components 为 `required` 属性。

- 已选一侧（target）的列表报告 `aria-required`，缺省显式 `false`；待选一侧不写。根带 `data-required`。
- 表单影子一个值一份，没有值时一份都没有。必填且没有值时补一份空值的占位影子：视觉隐藏的文本输入，带原生 `required`，拦下空表单的提交。`getHiddenInputProps` 的 `value` 因此改为可选，不给即取这份占位。
