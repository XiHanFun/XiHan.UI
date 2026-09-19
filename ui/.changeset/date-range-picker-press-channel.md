---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**DateRangePicker 触发钮、清空钮与快捷选项接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副
按压面。** 编排机器 context 新增 `pressed`（按 key 记住正被按住的那一个，新增导出类型 `DateRangePickerPressedKey`；日历里的
翻页钮、标题与日期格由 calendar-range-picker 自己投影），事件 `PRESS.START` / `PRESS.END` 挂根级：整体禁用谁都不进；只读时
触发钮照常展开、照有回执，清空钮与快捷选项与它们的写值同一道门不进；不成一对、不可用或作者禁用的快捷选项不进。浮层收起时
浮层里按住的部件由机器自行松开（Enter 在 keydown 即写值收起，不再有 keyup）；按住途中转入禁用 / 只读或值被清空同样自行松开。
键盘表新增 `date-range-picker.kbd.press`。三端公开 props 与事件不变。
