---
'@xihan-ui/headless': minor
'@xihan-ui/web-components': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
---

菜单栏改用标准结构：新增 `menubarStructure` 与 `MenubarStructureOptions`，一排入口按钮（文字取入口的 `label`）在前，各自菜单的定位层在后，里面按这张菜单的 `items` 铺条目、分组与分隔线，带 `children` 的条目是嵌套的子菜单（组合节点）。Vue / React 不写默认插槽时照它铺，不再要求先给 `collection`；`XhMenubarSub` 新增 `label` 并在不写插槽时自己铺那一层。Web Components 的 `<xh-menubar>` 不写部件（或只写 root）时自己生成，条目文字、行首、行尾可用 `slot="item:<值>"` 等给出，子菜单生成嵌套的 `<xh-menu submenu>`。`menuNodesStructure` 的条目改收 `MenuNodesStructureMeta`（`indicator` 可缺）。
