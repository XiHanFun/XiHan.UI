---
'@xihan-ui/headless': minor
'@xihan-ui/web-components': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
---

标签组新增 `invalid` 与 `required`（Web Components 属性 `invalid`、`required`），也从外层表单字段、表单字段组继承这两轴：`invalid` 时标签列表报 `aria-invalid`，根与列表带 `data-invalid`；`required` 在根与列表上带 `data-required`（`grid` 角色不收 `aria-required`）。直接放进表单字段时接上字段：字段的标题并进标签列表（`list`，`role="grid"`）的名字，说明与错误文案进描述链；点字段标题，焦点落到当前标签。此前标签组放进字段时只念缺省的「标签」，念不到字段的标题与说明。
