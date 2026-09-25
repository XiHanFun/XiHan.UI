---
'@xihan-ui/styles': major
---

组件私有的关键帧并入 `family/motion.css` 的共享关键帧，旧名退役。在 `xihan.overrides` 层重定义过下列旧名的，改为重定义新名。新名跨组件共享，重定义会同时作用于所有引用它的组件；只想换一个组件的动画，改写该组件部件上的 `animation-name`。

| 旧名 | 新名 |
| --- | --- |
| `xh-spinner-rotate` | `xh-spin` |
| `xh-popconfirm-rotate` | `xh-spin` |
| `xh-switch-rotate` | `xh-spin` |
| `xh-toast-spin` | `xh-spin` |
| `xh-approval-rotate` | `xh-spin` |
| `xh-clipboard-rotate` | `xh-spin` |
| `xh-download-trigger-rotate` | `xh-spin` |
| `xh-notification-spin` | `xh-spin` |
| `xh-reasoning-shimmer` | `xh-shimmer` |
| `xh-tool-call-shimmer` | `xh-shimmer` |
| `xh-approval-in` | `xh-item-in` |
| `xh-message-feed-item-in` | `xh-item-in` |
| `xh-question-flow-in` | `xh-item-in` |
| `xh-tool-call-enter` | `xh-item-in` |
| `xh-approval-result-in` | `xh-pop-in` |
| `xh-message-feed-button-in` | `xh-pop-in` |
| `xh-question-flow-result-in` | `xh-pop-in` |
| `xh-log-button-in` | `xh-pop-in` |
| `xh-reasoning-fade-in` | `xh-fade-in` |
| `xh-clipboard-loading-reveal` | `xh-fade-in` |
| `xh-download-trigger-loading-reveal` | `xh-fade-in` |
| `xh-clipboard-loading-hide` | `xh-fade-out` |
| `xh-diff-view-reveal` | `xh-drop-in` |
| `xh-form-summary-enter` | `xh-drop-in` |
| `xh-dialog-in` | `xh-sheet-in` |
| `xh-dialog-out` | `xh-sheet-out` |
| `xh-notification-in` | `xh-sheet-in` |
| `xh-notification-out` | `xh-sheet-out` |
| `xh-drawer-in-right` | `xh-slide-in` |
| `xh-drawer-in-left` | `xh-slide-in` |
| `xh-drawer-in-top` | `xh-slide-in` |
| `xh-drawer-in-bottom` | `xh-slide-in` |
| `xh-drawer-out-right` | `xh-slide-out` |
| `xh-drawer-out-left` | `xh-slide-out` |
| `xh-drawer-out-top` | `xh-slide-out` |
| `xh-drawer-out-bottom` | `xh-slide-out` |
