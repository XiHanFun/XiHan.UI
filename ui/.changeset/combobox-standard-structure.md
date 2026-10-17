---
'@xihan-ui/headless': minor
'@xihan-ui/web-components': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
---

组合框改用标准结构：新增 `comboboxStructure` 与 `ComboboxStructureOptions`。Vue 不写默认插槽、React 不给 children 时照它铺出缺省树，末尾多一份表单影子（给了 `name` 才参与提交），不再要求先给 `collection`；Web Components 的 `<xh-combobox>` 不写部件或只写 `root` 时按它生成整套节点，新增 `label`（标题文字）、`empty`（空态文字）与 `clearable`（盒里带清空按钮）三个属性，标题、空态、条目文字与行首行尾可以用 `slot="label"`、`slot="empty"`、`slot="item:<值>"`、`slot="item-prefix:<值>"`、`slot="item-suffix:<值>"` 接管。
