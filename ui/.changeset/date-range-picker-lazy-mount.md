---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**新增** DateRangePicker 的 `lazyMount` / `unmountOnExit`：`lazyMount` 让 content 里的面板（两张日历、快捷选项、时间列与底栏）第一次展开时才挂载、之后常驻，`unmountOnExit` 让它们在退场动画播完后卸载、下次展开重新挂载；两项缺省都是 false，现有用法不受影响。日历的翻页、聚焦日与选中值都记在机器里，不随面板挂卸丢掉；两组输入行、positioner 与 content 节点一向常驻。Web Components 写作 `lazy-mount` / `unmount-on-exit`：生成的面板照同一规则增删，手写的面板写进 content 里一个 `<template>`。
