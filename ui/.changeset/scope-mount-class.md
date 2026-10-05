---
'@xihan-ui/core': minor
'@xihan-ui/headless': patch
'@xihan-ui/styles': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

每个角色节点另带皮肤挂载类 `xh-scope-<组件名>`，与 `data-scope` 一一对应（`data-scope="dialog"` 的节点带 `xh-scope-dialog`）。解剖产出的 attrs 多一项 `class`，Vue 与作者的 class 合并、React 落成 `className` 并与作者的拼接、Web Components 按词增删不覆盖作者写的类；asChild 把部件属性合进自带解剖的子节点时，挂载类随 `data-scope` 一起让位，一个节点不会同时吃两个组件的皮肤。core 新增导出 `SCOPE_CLASS_PREFIX`、`scopeClass()` 与 `stripScopeClass()`。

挂载类是皮肤产物改以类名领头的前提：浏览器按类名给规则分桶，属性选择器只按属性名分桶，几千条以 `[data-scope=…]` 领头的皮肤规则挤在同一个桶里，每个组件节点每次样式重算都要逐条试一遍。`data-scope` / `data-part` 仍是公开的样式契约，作者的覆盖写法不变。节点的 class 属性因此多了一个词：对 DOM 做快照或精确比对 `className` 的测试需要随之更新。只用 `@xihan-ui/styles`、自己书写标记的页面，要给每个带 `data-scope="x"` 的节点补上 `class="xh-scope-x"`，否则皮肤不命中。
