---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**新增** 颜色选择器的浮层收起时 `onOpenChange`（事件 `open-change`）带上关闭原因 `reason`：Escape 报 `esc`，点在浮层外或焦点移出浮层报 `interact-outside`，再点一次触发钮报 `close-trigger`，`setOpen(false)` 报 `programmatic`；展开时不带。此前消解层回报的原因被丢掉，层外点击与 Escape 分不出来。
