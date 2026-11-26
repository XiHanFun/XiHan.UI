---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**新增** Popover、Popconfirm、HoverCard、Tooltip 的 `lazyMount` / `unmountOnExit`：`lazyMount` 让 content 里的内容第一次打开时才挂载、之后常驻，`unmountOnExit` 让它在退场动画播完后卸载、下次打开重新挂载；两项缺省都是 false，现有用法不受影响。positioner 与 content 节点一向常驻。Web Components 写作 `lazy-mount` / `unmount-on-exit`，按 content 里一个 `<template>` 的内容挂卸，没写模板的作者节点照旧常驻。
