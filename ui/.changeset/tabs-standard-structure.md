---
'@xihan-ui/headless': minor
'@xihan-ui/web-components': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
---

标签页改用标准结构：新增 `tabsStructure` 与 `TabsStructureOptions`，标签带里每条一个标签，`closable` 时标签后面紧跟它的关闭钮，再是每条一块面板；没有条目时什么都不铺。Vue / React 不写默认插槽时照它铺；Web Components 的 `<xh-tabs>` 不写部件时连 `root` 生成整套节点，只写 `root` 时生成在它里面，某一块面板的内容用 `slot="panel:<值>"` 接管，要按 `lazy-mount` / `unmount-on-exit` 挂卸时写成 `<template slot="panel:<值>">`。
