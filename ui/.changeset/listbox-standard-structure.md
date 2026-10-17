---
'@xihan-ui/headless': minor
'@xihan-ui/web-components': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
---

列表框改用标准结构：新增 `listboxStructure` 与 `ListboxStructureOptions`，次序是标题、列表，`collection` 的每条数据一个条目（文字、有副文本时的副文本与选中标记），行首行尾只在给了对应插槽时才铺。Vue / React 不写默认插槽时照它铺，没给 `collection` 时也铺出标题与空列表（原来什么都不渲）；Web Components 的 `<xh-listbox>` 新增 `label` 属性，不写部件或只写 `root` 时生成整套节点，标题、条目文字与行首行尾可用 `slot="label"`、`slot="item:<值>"`、`slot="item-prefix:<值>"`、`slot="item-suffix:<值>"` 接管。
