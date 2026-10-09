---
'@xihan-ui/tokens': minor
'@xihan-ui/styles': patch
---

粗指针下日历格的命中区到 44×44：CalendarPicker、CalendarRangePicker 以及 DatePicker、DateRangePicker 里内嵌的日历网格，粗指针下行距从 36 加到 44、列宽下限抬到 44，铺满整格的命中区彼此不重叠；日期钮仍是 24 的圆，禁用横条与区间轨道以格子中线为轴、仍 32 高。新增令牌 `--xh-overlay-calendar-column-h-coarse`，带时刻的日期面板在粗指针下按它给时间列定高，列底仍与网格底边对齐。
