---
'@xihan-ui/headless': minor
'@xihan-ui/web-components': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
---

手风琴改用标准结构：新增 `accordionStructure` 与 `AccordionStructureOptions`，collection 里每条一个条目，标题（`h3`）里的按钮装标题文字与指示符，正文取 `content`。Vue / React 不写默认插槽时照它铺，不再要求先给 `collection`；Web Components 的 `<xh-accordion>` 不写部件时连 `root` 生成整套节点，只写 `root` 时生成在它里面，某一条的正文可用 `slot="content:<值>"` 接管，要按 `lazy-mount` 第一次展开才实例化时写成 `<template slot="content:<值>">`。标准结构的标签新增 `h3`。
