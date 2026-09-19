---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**DatePicker 触发钮、清空钮、确认钮、快捷选项与时间格接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针
`:active` 同一副按压面。** 编排机器 context 新增 `pressed`（按 key 记住正被按住的那一个，新增导出类型 `DatePickerPressedKey`；
日历里的翻页钮、标题与日期格由 calendar-picker 自己投影），事件 `PRESS.START` / `PRESS.END` 挂根级：整体禁用谁都不进；
只读时触发钮与确认钮只管开合、照有回执，清空钮、快捷选项与时间格与它们的写值同一道门不进；与模式不配、不可用或作者禁用的
快捷选项不进，藏起的确认钮不进。浮层收起时浮层里按住的部件由机器自行松开（Enter 在 keydown 即写值 / 确认收起，不再有 keyup）；
按住途中转入禁用 / 只读或值被清空同样自行松开。键盘表新增 `date-picker.kbd.press`。三端公开 props 与事件不变。
