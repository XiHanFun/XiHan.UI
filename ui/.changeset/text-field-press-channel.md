---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**TextField 清空按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。** 机器
context 新增 `pressed`，事件 `PRESS.START` / `PRESS.END` 挂根级，按压与清空同一道 `canClear` 守卫（未开 clearable、
禁用、只读或没有值时不进）；按住途中值被清空、关掉 clearable 或转入禁用 / 只读时由机器自行松开。清空按钮的
pointerdown 仍拦默认聚焦，焦点留在输入框。键盘表新增 `text-field.kbd.press`。三端公开 props 与事件不变。
