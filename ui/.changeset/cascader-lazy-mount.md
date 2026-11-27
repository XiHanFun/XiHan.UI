---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**新增** Cascader 的 `lazyMount` / `unmountOnExit`：`lazyMount` 让 content 里的各列与搜索框第一次展开时才挂载、之后常驻，`unmountOnExit` 让它们在退场动画播完后卸载、下次展开重新挂载；两项缺省都是 false，现有用法不受影响。触发器里的选中文字与标签照旧按 `collection` 算，positioner、content 与空态、在途两个占位一向常驻。Web Components 写作 `lazy-mount` / `unmount-on-exit`：生成的列照同一规则增删，手写的列写进 content 里一个 `<template>`。
