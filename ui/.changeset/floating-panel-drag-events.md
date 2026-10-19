---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

浮动面板（FloatingPanel）新增拖动起止事件：按下拖拽把手开始移动面板时报 `onDragStart`（Vue 的 `@drag-start`、Web Components 的 `drag-start`），detail 为 `{ clientX, clientY }`；这一场移动收尾时报 `onDragEnd`（`drag-end`），detail 为 `{ clientX, clientY, canceled }`。手松开时坐标是松手处、`canceled` 为 `false`；系统收回指针、拖动途中面板被收起时 `canceled` 为 `true`，坐标是最后跟到的那一点。两者一一对应；改尺与键盘平移不报。新增类型 `FloatingPanelDragStartDetails` 与 `FloatingPanelDragEndDetails`。
