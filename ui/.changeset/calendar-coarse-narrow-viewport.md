---
'@xihan-ui/styles': patch
---

CalendarPicker / CalendarRangePicker（含 DatePicker、DateRangePicker 里内嵌的网格）：粗指针下的 44 改取 `--xh-control-hit-coarse`；视口窄到七列放不下 44 时，列宽下限取视口宽扣掉两侧页边、网格内衬与周数列后的七分之一，320px 宽的手机上页内日历与浮层都不再横向撑出视口。
