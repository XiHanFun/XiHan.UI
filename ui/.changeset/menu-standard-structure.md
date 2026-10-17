---
'@xihan-ui/headless': minor
'@xihan-ui/web-components': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
---

菜单改用标准结构：新增 `menuStructure`、`menuNodesStructure` 与 `MenuStructureOptions`，触发按钮在前，定位层里按 collection 铺条目、分组与分隔线，带 `children` 的条目是嵌套的子菜单（组合节点）。Vue / React 不写默认插槽时照它铺，不再要求先给 `collection`；根菜单新增 `label`（没写触发内容时的按钮文字），`XhMenuSub` 新增 `label` 并在不写插槽时自己铺那一层。Web Components 的 `<xh-menu>` 不写部件时直接在自己里面生成，新增 `label` 与 `value`（子菜单在父菜单里的条目身份），触发内容与条目可用 `slot="trigger"`、`slot="item:<值>"` 等接管。标准结构的生成钩子新增 `rootless`，给没有 root 部件的组件用。
