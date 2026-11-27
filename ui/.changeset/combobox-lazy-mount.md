---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**新增** Combobox 的 `lazyMount` / `unmountOnExit`：`lazyMount` 让 content 里的候选第一次展开时才挂载、之后常驻，`unmountOnExit` 让它们在退场动画播完后卸载、下次展开重新挂载；两项缺省都是 false，现有用法不受影响。输入框、content 与空态、在途两个占位一向常驻；展开那一刻候选还没挂上时先不判空，空态不会闪一下。打开前的选中文字按 `collection` 算，没给 `collection` 时退回值本身。Web Components 写作 `lazy-mount` / `unmount-on-exit`：按数据铺的候选照同一规则增删，手写的候选写进 content 里一个 `<template>`。
