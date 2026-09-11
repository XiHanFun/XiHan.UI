---
'@xihan-ui/core': major
'@xihan-ui/headless': patch
'@xihan-ui/react': patch
'@xihan-ui/vue': patch
'@xihan-ui/web-components': patch
'@xihan-ui/styles': patch
---

LayerRegistry 现在按每个 Document 的真实逻辑栈派生视觉序号与 lane，并通过统一
`--xh-_layer` 槽驱动已登记浮层的 z-index。嵌套 popover 高于所属 modal，后来登记的层
不再被组件静态层级压住；动态 modal 会显式同步 Registry 与视觉绑定。

删除 `Layer.setModal`。模态性继续由只读 `isModal()` getter 提供，变化后调用
`LayerRegistry.sync(layer)`；`visualOf(layer)` 返回当前 `visualIndex`、`visualLane` 与可写入
CSS 的 `visualLayer`。公开组件层级变量仍优先于 Registry 私有槽。
