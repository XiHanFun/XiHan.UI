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
