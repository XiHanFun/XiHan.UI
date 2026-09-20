---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**Timer 的 control 接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
机器 context 新增 `pressed`，事件 `PRESS.START` / `PRESS.END` 挂根级、四段状态都接；同一颗钮在 running / paused 下语义不同，按住途中起停翻转按压面不丢。按钮没有禁用态，按住一律进。
键盘表新增 `timer.kbd.press`。三端公开 props 与事件不变。
