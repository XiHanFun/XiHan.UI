---
'@xihan-ui/headless': major
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**新增** Select 的 `unmountOnExit`：列表内容在退场动画播完后卸载、下次展开重新挂载，缺省 false，现有用法不受影响。content 节点一向常驻；收起之后的连打按 `collection` 算，没给 `collection` 时条目不在页面上的那段时间里连打不生效、换了值选中文字退回值本身。Web Components 写作 `unmount-on-exit`：按数据铺的条目照同一规则增删，手写的条目写进 list 里一个 `<template>`。

**破坏性** headless 的 `SelectApi.isContentMounted()` 改为收退场闸门的 `isContentMounted(present)`，与其他浮层一致；`selectStructure` 不再读 api 的这一项，改由选项 `contentMounted` 交进来。直接用 headless 自己接线的，把适配器的退场闸门（展开中或收起动画还没播完为真）传给 `isContentMounted`。
