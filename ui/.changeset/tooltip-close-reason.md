---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**新增** 文字提示收起时 `onOpenChange`（事件 `open-change`）带上关闭原因 `reason`：指针移开、等过 `closeDelay` 与同组另一处提示露面把它顶掉报 `hover`；焦点离开、点在提示外报 `interact-outside`；按下触发器报 `close-trigger`；Escape 报 `esc`；`setOpen(false)` 报 `programmatic`。展开时不带。
