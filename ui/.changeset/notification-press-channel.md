---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**Notification 卡片的关闭按钮与操作按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
卡片复用 toast 状态机，按住的那颗记在它的 `pressed`（`ToastPressedPart`）里，卡片按 part 键比对投影；不可关闭时关闭按钮
不进，卡片进入退场或按住途中转成不可关闭时由机器松开。notification 自身状态机不变，三端公开 props 与事件不变。
