---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**PasswordInput 切换按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。** 机器
context 新增 `pressed`，事件 `PRESS.START` / `PRESS.END` 挂根级，按压与切换同一道 `canReveal` 守卫（禁用时不进；
只读不拦明暗，按压面也照常给）；按住途中明暗翻面不影响按压面，转入禁用时由机器自行松开。键盘表新增
`password-input.kbd.press`。三端公开 props 与事件不变。
