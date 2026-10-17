---
'@xihan-ui/headless': minor
'@xihan-ui/web-components': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
---

标签组改用标准结构：新增 `tagGroupStructure` 与 `TagGroupStructureOptions`，次序是标题、标签列表，`collection` 的每条数据一枚标签（接成 tag 的 root），格子里依次是文字、选中标记与移除按钮。Vue / React 不写默认插槽时照它铺，没给 `collection` 时也铺出标题与空列表（原来什么都不渲）；Web Components 的 `<xh-tag-group>` 新增 `label` 属性，不写部件或只写 `root` 时生成整套节点，移除标签由宿主改 `collection`，标题与标签文字可用 `slot="label"`、`slot="item:<值>"` 接管。
