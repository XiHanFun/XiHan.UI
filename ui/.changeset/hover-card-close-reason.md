---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**新增** 悬停卡片收起时 `onOpenChange`（事件 `open-change`）带上关闭原因 `reason`：指针移开、等过 `closeDelay` 报 `hover`；焦点离开触发器与卡片、点在卡片外报 `interact-outside`；Escape 报 `esc`；`setOpen(false)` 报 `programmatic`。展开时不带。
