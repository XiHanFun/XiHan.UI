---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

Tabs 新增 `close-trigger` 部件（Vue / React `XhTabsCloseTrigger`）：紧跟在所属标签之后、与它平级，皮肤把它收进标签面的行尾，点按发出与 Delete / Backspace 相同的 `tab-close`，鼠标与触屏也能关标签；它接 Action Control icon 档 ghost 面、xs 档，对读屏隐藏、不占 Tab 位，`closable` 关闭时收起，标签禁用时留在原地但按不动。按 `collection` 铺开的缺省结构在 `closable` 下自动带上关闭钮。

新增 `lazyMount` / `unmountOnExit`（语义对齐 Ark UI）：前者把面板内容推迟到对应标签第一次被选中才渲染，后者在标签被选走时卸掉面板内容；面板节点本身常在，`aria-controls` 始终指得到它。connect 新增 `isContentMounted(value)`。Web Components 的面板内容写在面板里的 `<template>` 中时，元素按挂载时机把模板克隆进面板或撤走克隆出的节点。
