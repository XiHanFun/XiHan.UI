---
'@xihan-ui/headless': minor
'@xihan-ui/web-components': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
---

导航菜单改用标准结构：新增 `navigationMenuStructure` 与 `NavigationMenuStructureOptions`，列表里一项一个 li，带 `href` 的入口是直达链接，其余是入口按钮加面板（按 `children` 铺链接与子级），列表末尾是指示条。Vue / React 不写默认插槽时照它铺，不再要求先给 `collection`；面板里子级开关的文字落在一个不带部件名的 span 里，排版不变。Web Components 的 `<xh-navigation-menu>` 不写部件（或只写 root）时自己生成，整块面板内容可用 `slot="panel:<值>"` 给出。结构节点的标签新增 `a` 与 `nav`。
