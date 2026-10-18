---
'@xihan-ui/headless': minor
'@xihan-ui/web-components': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
---

面包屑改用标准结构：新增 `breadcrumbStructure` 与 `BreadcrumbStructureOptions`，有序列表里按折叠后的序列一项一个 li，层与层之间是分隔符，被折叠的一段是装着展开按钮的折叠位。Vue / React 不写默认插槽时照它铺，不再要求先给 `collection`；链接带图标时文字落在一个不带部件名的 span 里，排版不变。Web Components 的 `<xh-breadcrumb>` 不写部件（或只写 root）时自己生成，分隔符与折叠位按钮的内容可用 `slot="separator:<后一项的值>"` 与 `slot="ellipsis"` 给出。结构节点的标签新增 `ol`。
