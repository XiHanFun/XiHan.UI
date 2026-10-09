---
'@xihan-ui/styles': patch
---

TimePicker 与 TimeRangePicker 的面板缺省不再叠按 rem 的上限：时间列与底栏都按 px 定高，面板的天然高度就是它们的和。根字号很小（≤ 11px）时，时间选择器的底栏不再画到面板描边外，时间范围选择器也不再出竖向滚动；`--xh-time-picker-content-max-h` / `--xh-time-range-picker-content-max-h` 仍可显式设上限。
