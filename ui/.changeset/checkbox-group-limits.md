---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

CheckboxGroup 新增选中数上下限 `min` / `max`。

- 选满 `max` 时没选的条目报 `aria-disabled` 并投影 `data-disabled`（置灰、点不动），降到 `min` 时已选的条目摘不掉；被下限锁住的已选项照常随表单提交。全选只补到 `max` 为止，已满时再按是全不选（仍保住 `min`）。
- 约束只落在用户的点选、`toggleValue` 与全选上，程序化的 `setValue` 与初值原样落地；`min` 大于 `max` 或不是非负整数时立即报错。
- API 与插槽载荷新增 `atMax` / `atMin`，Web Components 元素新增同名只读属性与 `min` / `max` 属性；headless 导出 `resolveCheckboxGroupLimits`、`clampCheckboxGroupValue` 与类型 `CheckboxGroupLimits`。
