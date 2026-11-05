---
'@xihan-ui/styles': patch
---

**修复** CalendarRangePicker 与 DateRangePicker 在周、月、季、年粒度下，区间底在起止两格的端头多鼓出一圈半圆：端点是控件圆角（8px）的胶囊，区间底比它四周各宽 4px，帽却取满半圆（`--xh-shape-pill`），两条轮廓不同心。现在周期格的帽与端点胶囊同心，横、竖半径取胶囊圆角各加上区间底多出的那一截（缺省 12px），区间底外沿到胶囊外沿处处等距；日视图的半圆帽本就与端点圆同心，不变。`--xh-calendar-range-picker-range-cap-radius` 仍可覆盖全部粒度的帽。
