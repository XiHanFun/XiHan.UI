---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**PromptInput 发送 / 停止按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
机器 context 新增 `pressed`，事件 `PRESS.START` / `PRESS.END` 挂根级；守卫与按钮的可用性同口径——禁用不进，发送身份要可提交
（空内容、输入法组合中不进），停止身份（loading）恒可用、同样有回执；按钮身份随 loading 切换时由机器松开，提交后清空 /
组合开始使发送钮转禁用时同样松开。键盘表新增 `prompt-input.kbd.press`。三端公开 props 与事件不变。
