---
'@xihan-ui/headless': minor
'@xihan-ui/web-components': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
---

字段组改用标准结构：新增 `fieldsetStructure` 与 `FieldsetStructureOptions`，组标题恒铺在最前，说明、字段区、错误文案、按钮行给了内容才铺。三端新增 `legend`（组标题文字）；Vue 的 `XhFieldsetRoot` 不写默认插槽时照它铺，新增 `legend`、`description`、`fieldGroup`、`errorText`、`actions` 具名插槽；React 的 `XhFieldsetRoot` 不给 children 时照它铺，新增同名属性；Web Components 的 `<xh-fieldset>` 不写部件或只写 `root` 时生成原生 fieldset 与各段，宿主直接子节点写 `slot="field-group"` 等即搬进对应部件。
