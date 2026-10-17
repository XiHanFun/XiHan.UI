---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

复选框组（CheckboxGroup）新增 `required`：至少选一项。放进字段（Field）或表单（Form）时自动继承，实例显式给的值优先；Web Components 为 `required` 属性。

- 根与标题写 `data-required`，标题据此画星号。组根是 role=group，不收 `aria-required`；条目上的 `aria-required` 说的是「这一项必须勾上」，也不写，读屏经字段的描述链得知必填。
- 一项都没选时每份表单影子带原生 `required`，拦下空表单的提交；选了任何一项就都撤掉。影子是 inert 的、不可聚焦，浏览器的校验气泡落不到它上面，提交照样被拦下，错误文案交给字段给出。
