---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': patch
---

文件上传（FileUpload）新增 `readOnly`、`required`，放进字段（Field）或表单（Form）时自动继承，实例显式给的值优先；Web Components 为 `read-only`、`required` 属性。

- 只读：选择、拖放、粘贴、删除与清空都不收，已经开始的传输照常（开传与取消不改列表）。投放区仍在 Tab 序列里、报 `aria-disabled="true"`；选择、清空与删除三种按钮不用原生 disabled，报 `aria-disabled="true"` 并画禁用面。皮肤收回只读投放区的手形光标与悬停面。
- 必填：根与标题写 `data-required`，标题据此画星号；列表为空时文件输入带原生 `required`，拦下空表单的提交。有文件时不带：选完文件输入就被清空，恒带 required 会把已经选了文件的表单也拦下。
