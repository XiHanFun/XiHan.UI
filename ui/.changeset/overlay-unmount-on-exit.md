---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

Dialog 与 Drawer 新增 `unmountOnExit`（缺省 true，行为不变：第一次打开才挂载，退场动画播完就卸载）。设为 false 时打开过之后收起只隐藏、不卸载：Vue 与 React 把定位层以内联 `display: none` 收起、遮罩不留、Portal 视觉桥断开，再打开不重挂，内容里的组件状态、输入与滚动位置都留着，反复开合的重内容面板（设置面板、长表单）不再每次付一遍挂载开销。

headless 的 Dialog / Drawer connect 多出 `isContentMounted(present)`，与 Collapsible、Accordion 共用同一条挂卸判定；机器 context 多出 `opened`（挂载之后打开过没有）。

Web Components 的作者节点一向常驻，行为不变；写进 content 里一个 `<template>` 的内容按同一规则挂卸：第一次打开克隆，缺省退场播完撤走，`unmount-on-exit="false"` 时克隆一次之后常驻。
