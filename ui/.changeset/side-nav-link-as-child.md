---
'@xihan-ui/headless': patch
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
---

SideNav 的 `XhSideNavLink` 新增 `asChild`（Vue / React）：借用作者的路由链接当链接，不再渲染自己的 `<a>`，部件的解剖、家族标记、按压与聚焦接线合到路由链接渲出的元素上，跳转交给路由。条目数据没给 `href` 时 connect 不再写出空的 `href` 键，免得盖掉路由链接自己算出的地址。Web Components 的 `link` 本来就是作者写的节点，无需改动。组件文档新增「接路由」一节。
