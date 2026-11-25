---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**新增** 引用的预览收起时 `onOpenChange`（事件 `open-change`）带上关闭原因 `reason`：Escape 报 `esc`；再点一次同一处引用、按预览上的关闭钮报 `close-trigger`；`hover` 档里指针离开、等过 `closeDelay` 报 `hover`，焦点离开引用与卡片、点在卡片外报 `interact-outside`；`setOpen(false)` 报 `programmatic`。展开时不带。
