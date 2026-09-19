---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**TimeRangePicker 触发钮、清空钮、快捷选项与时间格接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副
按压面。** 机器 context 新增 `pressed`（按 key 记住正被按住的那一个（时间格再带起 / 止端下标），新增导出类型 `TimeRangePickerPressedKey`），事件 `PRESS.START` /
`PRESS.END` 挂根级：整体禁用谁都不进；只读时触发钮照常展开、照有回执，清空钮、快捷选项与时间格与它们的写值同一道门不进；越界或
作者禁用的快捷选项与时间格不进。浮层收起时浮层里按住的部件由机器自行松开（Enter 在 keydown 即写值收起，不再有 keyup）；按住途中
转入禁用 / 只读或值被清空同样自行松开。键盘表新增 `time-range-picker.kbd.press`。三端公开 props 与事件不变。
