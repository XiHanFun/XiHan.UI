---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**新增** 漫游引导收起时 `onOpenChange`（事件 `open-change`）带上关闭原因 `reason`：Escape 放弃报 `esc`，跳过钮与关闭钮报 `close-trigger`，开了 `closeOnInteractOutside` 时点在层外报 `interact-outside`，末步再走一步完成报 `selection`，`setOpen(false)` 与 `skip()` 报 `programmatic`；展开时不带。
