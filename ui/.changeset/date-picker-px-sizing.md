---
'@xihan-ui/tokens': patch
'@xihan-ui/styles': patch
---

日期选择器与日期范围选择器的浮层尺寸只按 px 结算，根字号不是 16px 时不再错位：与日历网格并排的时间列高 `--xh-overlay-calendar-column-h` 改为纯 px（周名一行加六周），不再与按 rem 的滚动面中档取小，根字号 14px 时列底不再比网格短 28px；浮层 `--xh-date-picker-max-h` / `--xh-date-range-picker-max-h` 的缺省值从按 rem 的 `--xh-viewport-h-lg` 改为定位引擎算出的可用高度，带时刻的面板在 14px 根字号或紧凑密度下不再把确认钮挤进滚动里。
