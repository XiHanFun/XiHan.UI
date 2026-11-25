---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**新增** 浮动面板收起时 `onOpenChange`（事件 `open-change`）带上关闭原因 `reason`：Esc 报 `esc`，关闭钮与再点一次触发器报 `close-trigger`，`setOpen(false)` 报 `programmatic`；展开时不带。
