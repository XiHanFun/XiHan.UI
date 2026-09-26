---
'@xihan-ui/headless': major
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

EmptyState 的开幕只在出现时播放。

- 随页面首屏就在的空状态直接呈现：页面加载完成之前挂上的、服务端渲染后水合的，图标、标题、说明、操作五个部件投影 `data-instant`，不播开幕。筛选、删除或新数据带来的出现（页面加载完成之后挂上），以及 root 从 `hidden` 恢复显示，照常依次开幕；首屏那一份第一次收起之后，此后每次显出都开幕。
- 新增 `emptyStateMachine`、`EmptyStateSchema`、`EmptyStateRefs`；`connectEmptyState(props, normalize)` 改为 `connectEmptyState(service, normalize)`，与其余带状态机的组件一致。
- React 的 `EmptyStateContext` 新增 `rootRef`，自行渲染根节点时要把它接到根元素上。
- 皮肤的开幕关键帧改写在 `:not([data-instant])` 下。
