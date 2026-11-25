---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/react": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

**新增** `presence` 组件（进出场）：让一块内容按 `present` 出现与消失，退场动画真的播完才藏起、撤下内容，之后发 `exit-complete`（React 为 `onExitComplete`）；中途改回在场时取消退场、从此刻的不透明度接着淡入，首帧就在场的直接呈现。`lazyMount`（缺省开）让内容第一次在场才挂载，`unmountOnExit`（缺省开）让它退场播完即卸载，关掉后只藏起 root、内容留着。皮肤缺省一段只动不透明度的淡入淡出，`--xh-presence-enter-animation` / `--xh-presence-exit-animation` 各收一整条 `animation` 简写，可关掉或换成自己的关键帧。Web Components 里内容写进 root 里的 `<template>` 时挂载即克隆、卸载即丢弃，没写模板时卸载只是把节点暂时摘下、再在场时原样放回。只管「在不在」与等动画，不带角色与按键；随触发器开合的内容仍用 Collapsible，浮层仍用 Dialog、Popover 这类自带进出场的组件。
