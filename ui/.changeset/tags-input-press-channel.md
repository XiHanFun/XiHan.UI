---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**TagsInput 清空按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。** 机器
context 新增 `pressed`，事件 `PRESS.START` / `PRESS.END` 挂根级，守卫 `canPress` 与清空按钮的显隐同一口径（禁用、
只读，或既无标签也无文本时不进）；按住途中标签与文本被清空或转入禁用 / 只读时由机器自行松开。清空按钮的
pointerdown 仍拦默认聚焦，焦点留在输入框。键盘表新增 `tags-input.kbd.press`。三端公开 props 与事件不变。
