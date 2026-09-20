---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**ToolCall 的 trigger 接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面（disclosure trigger 只换面不缩放）。**
tool-call 机器 context 新增 `pressed`，事件 `PRESS.START` / `PRESS.END` 挂根级、auto / held 四个叶态都接；禁用时不进，按住途中转禁用时由机器松开；运行中 trigger 照常可点，按压面同样照有。
键盘表新增 `tool-call.kbd.press`。三端公开 props 与事件不变。
