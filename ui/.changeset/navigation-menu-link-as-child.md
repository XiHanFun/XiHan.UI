---
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
---

NavigationMenu 的 `XhNavigationMenuLink` 新增 `asChild`（Vue / React）：直达链接与面板里的链接都能借用作者的路由链接，不再渲染自己的 `<a>`，部件的解剖、家族标记、当前页标记与按压接线合到路由链接渲出的元素上，跳转交给路由，点击后照常收起面板。Web Components 的 `link` 本来就是作者写的节点，无需改动。组件文档新增「接路由」一节。
