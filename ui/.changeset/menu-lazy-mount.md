---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**新增** Menu 的 `lazyMount` / `unmountOnExit`：`lazyMount` 让 content 里的条目第一次展开时才挂载、之后常驻，`unmountOnExit` 让它们在退场动画播完后卸载、下次展开重新挂载；两项缺省都是 false，现有用法不受影响，子菜单随父层的条目一起挂卸。键盘展开时条目当帧挂上，焦点照旧落到首项或末项。Web Components 写作 `lazy-mount` / `unmount-on-exit`：按数据铺的条目照同一规则增删，手写的条目写进 content 里一个 `<template>`。必需部件写在部件直属的 `<template>` 里时不再报 `wc.missing-part`。
