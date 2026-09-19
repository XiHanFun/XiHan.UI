---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**DateField 清空按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。** 机器
context 新增 `pressed`，事件 `PRESS.START` / `PRESS.END` 挂根级，守卫 `canPress` 与清空按钮的显隐同一口径（可编辑且在用的
段里填了哪怕一段，禁用、只读或一段都没填时不进）；按住途中段位被清空或转入禁用 / 只读时由机器自行松开。清空按钮的
pointerdown 仍拦默认聚焦，焦点留在段位上。date-picker / date-range-picker 自家的清空按钮由各自的根机器负责，不在此列。
键盘表新增 `date-field.kbd.press`。三端公开 props 与事件不变。
