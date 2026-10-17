---
'@xihan-ui/headless': minor
'@xihan-ui/web-components': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
---

选择器改用标准结构：新增 `selectStructure` 与 `SelectStructureOptions`，Vue 不写默认插槽、React 不给 children 时照它铺出缺省树，不再要求先给 `collection`（没给时铺出空列表）；Web Components 的 `<xh-select>` 不写部件或只写 `root` 时按它生成整套节点，新增 `label`（标题文字）与 `clearable`（盒里带清空按钮）两个属性，标题、条目文字与行首行尾可以用 `slot="label"`、`slot="item:<值>"`、`slot="item-prefix:<值>"`、`slot="item-suffix:<值>"` 接管。标准结构新增 `StructureSlotted`（作者有没有给某个插槽写内容），`StructureTag` 增加 `select`。经 Portal 搬走的生成节点留在落点，`reconcile` 不再把它拉回原处。
