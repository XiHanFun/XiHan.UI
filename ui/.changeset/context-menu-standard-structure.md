---
'@xihan-ui/headless': minor
'@xihan-ui/web-components': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
---

右键菜单改用标准结构：新增 `contextMenuStructure` 与 `ContextMenuStructureOptions`，触发区在前，定位层里按 collection 铺条目、分组与分隔线，带 `children` 的条目是嵌套的子菜单（组合节点）。Vue / React 不写默认插槽时照它铺，不再要求先给 `collection`；`XhContextMenuSub` 新增 `label` 并在不写插槽时自己铺那一层。Web Components 的 `<xh-context-menu>` 不写部件（或只写 root）时自己生成，触发区内容与条目文字可用 `slot="trigger"`、`slot="item:<值>"` 等给出，子菜单生成嵌套的 `<xh-menu submenu>`。`menuNodesStructure` 新增第三个参数 `MenuNodesStructureOptions`，`itemSlot: 'item-text'` 时 item 插槽只接管条目文字。
