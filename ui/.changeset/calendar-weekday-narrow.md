---
'@xihan-ui/headless': major
'@xihan-ui/web-components': patch
---

日历选择器与日历范围选择器的星期表头缺省改为单字（`weekdayFormat` 缺省 `narrow`，中文「一 二 三」、英文「M T W」）：「周一」这类缩写几乎占满格宽，表头挤在一起和日期数字争视线。要沿用缩写的写 `weekdayFormat: 'short'`；表头的读屏名称仍是星期全称。日期选择器、日期范围选择器的日历面板随之一起变。
