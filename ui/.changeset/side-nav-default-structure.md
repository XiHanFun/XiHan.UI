---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**新增** SideNav 只给 `collection` 时按标准结构铺出整棵导航树：叶子是 `item` 里的 `link`，带 `children` 的是分支（行按钮与子层），折叠成图标栏后顶层分支的子层外面套定位层；入口新增 `icon` 字段，给了即在行文字前铺一枚 Icon。headless 新增 `sideNavStructure` 与 api 的 `collection`。
