---
'@xihan-ui/headless': minor
'@xihan-ui/web-components': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
---

分格输入改用标准结构：新增 `pinInputStructure` 与 `PinInputStructureOptions`，次序是标题、一段装下 `length` 个格子的分段（每格写上自己的下标）、表单影子（给了 `name` 才带）。三端新增 `label`：Vue 是 label 文字与 label 插槽，React 可传任意节点，Web Components 是 `label` 属性与 `slot="label"`；只在不写结构时使用。Vue / React 的 `XhPinInputRoot` 不写默认插槽 / 不给 children 时照结构铺出缺省树；Web Components 的 `<xh-pin-input>` 不写部件（或只写 root）时生成同一套节点。要分段（123-456）时仍手写结构。
