---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**Alert 的关闭按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
机器 context 新增 `pressed`，事件 `PRESS.START` / `PRESS.END`；不可关闭时不进，提示收起（关闭按钮随 root 隐藏）或按住途中
转成不可关闭时由机器松开。键盘表新增 `alert.kbd.press`。三端公开 props 与事件不变。
