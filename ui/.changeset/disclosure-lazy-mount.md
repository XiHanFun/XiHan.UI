---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

Collapsible 与 Accordion 新增内容挂卸：`lazyMount` 让内容第一次展开才挂载（之后收起只隐藏），`unmountOnExit` 让内容在收起动画播完后卸载、再展开时重新挂载，两者合用即只在展开期间存在。content 节点本身始终在场。挂卸判定在 headless（`api.isContentMounted`，适配器传入自己的退场闸门）。Web Components 里内容写进 content 里的一个 `<template>`：解析时不实例化，挂载时克隆、卸载时丢弃；没写模板时卸载只是把节点暂时摘下、挂载时原样放回。
