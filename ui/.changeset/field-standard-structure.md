---
'@xihan-ui/headless': minor
'@xihan-ui/web-components': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
---

字段改用标准结构：新增 `fieldStructure` 与 `FieldStructureOptions`，次序是标题、控件、说明、错误文案；控件是出口节点，作者给的控件原样放在标题之后，外面不包部件。三端新增 `label`、`description`、`errorText`（Web Components 属性 `error-text`），给了才铺对应部件，`errorText` 给空串时照样铺错误文案并常挂。Vue 的 `XhFieldRoot` 不写默认插槽时照它铺，新增 `label`、`control`、`description`、`errorText` 具名插槽；React 的 `XhFieldRoot` 不给 children 时照它铺，新增 `control` 属性，`label` 等给节点时由对应部件装着；Web Components 的 `<xh-field>` 不写部件或只写 `root` 时按它生成，宿主直接子节点写 `slot="control"` 的库内控件原样挪进字段。
