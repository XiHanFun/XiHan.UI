---
'@xihan-ui/headless': minor
'@xihan-ui/react': patch
'@xihan-ui/vue': patch
---

Masonry 的 DOM 测量与作者序高度投影现在由 Headless `measureMasonry` 统一提供，
`sameMasonryHeights` 统一判断连续两次高度序列是否真的变化。React 与 Vue 只保留
ResizeObserver、框架响应式状态和节点渲染接线，不再各自查询 item、读取矩形或复制数组判等。

Web Components 保持其 Light DOM“首次见到顺序”合同，不套用依赖稳定 `data-index` wrapper 的
框架投影，也不改变运行期新增项的顺序语义。
