---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
---

Toast 与 Notification 删除固定退场窗口 `removeDelay`（Web Components 的 `remove-delay` 属性、三端服务选项与 Headless 导出 `TOAST_REMOVE_DELAY` 一并删除）。卡片进入 dismissing 后改为等根节点上真实的退场动画播完再转 unmounted，与 Dialog、Drawer 同一套 Presence；减弱动效下退场只剩 120ms 淡出，同样等它播完。要调整退场时长，覆盖 `--xh-motion-duration-exit`，或在 `xihan.overrides` 层改写卡片部件的 `animation-duration`。
