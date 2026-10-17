---
"@xihan-ui/vue": patch
"@xihan-ui/react": patch
"@xihan-ui/web-components": patch
---

**修复** 组合控件放进字段或表单时，里面由组合节点生成的库内控件被外层字段与表单认领：它们会被读成字段的名字、拿到字段的说明，并跟着字段继承禁用、只读、必填与无效。

- 组合节点生成的控件改归生成它的组件管：状态与名字由外层经组合节点的属性给，字段与表单只接线外层组件本身。
- Vue 与 React 的 `renderStructure` 把组合节点渲在字段边界里；Web Components 的 `xh-field` 与 `xh-form` 跳过带 `data-xh-gen="structure"` 的控件宿主。
