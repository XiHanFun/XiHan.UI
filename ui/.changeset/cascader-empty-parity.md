---
"@xihan-ui/web-components": patch
---

cascader 的空态占位在 WC 侧补齐，两个适配器不再分叉。

空态占位在 Vue 侧由 `XhCascaderContent` 内部无条件渲染，作者一个字都不用写；WC 是 Light DOM、
解剖归作者，`put('empty', …)` 遇不到节点就是空操作。于是同一份标记在 Vue 上有 `empty`、在 WC
上没有——逐帧比对的 cascader 一整套 22 条从加空态那天起就是红的，而当时只补了 Vue 侧的单独用例。

WC 侧改成：标记里没写 `empty` 就在 `content` 末尾补一个，位置与 Vue 侧一致，文案按当前视图取
`noMatch` 或 `empty`。作者写了就用作者那份，只接线不新建，文案也一概不碰（判定沿用 `value-text`
那套「首次见到该节点时若已有内容即判为归作者」）。

顺带补上 `translations` 属性：cascader 是 WC 侧少数几个没声明它的元素之一，不补的话补出来的
占位文案改不动。

迁移点：无。作者已经写了 `empty` 的标记行为逐字不变；没写的从「什么都没有」变成「有一个按需
显隐的占位」。
