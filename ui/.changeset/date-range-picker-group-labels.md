---
'@xihan-ui/styles': major
---

日期范围选择器带时刻时，「开始时间」「结束时间」两组小标题改为同一副样式，与时间范围选择器一致：此前正在编辑的那一端换正文色加中等字重，并排的两个标题一深一浅，读起来像一个可用、一个不可用。随之撤掉不再有人读的两个覆盖槽 `--xh-date-range-picker-column-group-label-fg-active` 与 `--xh-date-range-picker-column-group-label-font-weight-active`；正在编辑的那一端仍投影 `data-editing`，需要强调的可以按它自己写样式。
