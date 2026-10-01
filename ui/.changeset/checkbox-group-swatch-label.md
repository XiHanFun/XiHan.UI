---
'@xihan-ui/headless': patch
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

CheckboxGroup 与 ColorSwatchPicker 的根只在 `label` 部件真渲染了时才输出 `aria-labelledby`（新增由适配器统计的 `labelled`），不再指向不存在的节点；复选框组没有标题时全选格只念自己的文本，色板选择没有标题时名字交给 `translations.group`。Vue / React 的 `label` 属性在手写选项时同样铺出标题。
