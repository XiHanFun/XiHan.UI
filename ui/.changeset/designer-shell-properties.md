---
'@xihan-ui/designer-shell': minor
---

新增属性面板 `<xh-designer-properties>`：按 `@xihan-ui/designer-kit/properties` 的属性描述分组列出字段，内建文本、数字、开关、选择、标签、颜色与 JSON 七种编辑器，其余种类走宿主编辑器表。多个对象只显示共同属性，取值不同时显示「多个值」。每次输入派发 `property-change`（带合并键 `merge`），一次编辑结束派发 `property-commit`；换选择只换数据时字段原样复用，焦点不丢。支持分组折叠、字段错误、`header` / `footer` 插槽、只读与 `focusField(path)`。
