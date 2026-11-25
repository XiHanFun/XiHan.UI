---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**新增** 日期范围选择器的浮层收起时 `onOpenChange`（事件 `open-change`）带上关闭原因 `reason`：Escape 报 `esc`，点在浮层外或焦点移出浮层报 `interact-outside`；再点一次日历钮或输入行、在段位上按 Enter、按确认钮报 `close-trigger`；在日历上落下终点或点快捷选项随之收起报 `selection`；`setOpen(false)` 报 `programmatic`。展开时不带。
