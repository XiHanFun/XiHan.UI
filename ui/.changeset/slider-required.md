---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

滑块（Slider）新增 `required`。放进字段（Field）或表单（Form）时自动继承，实例显式给的值优先；Web Components 为 `required` 属性。

- 根与标题带 `data-required`，标题据此画星号。
- 拇指是 role=slider，不收 `aria-required`；滑块恒有值，表单影子不带原生 `required`。
