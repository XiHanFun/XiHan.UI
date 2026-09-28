---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

DatePicker 新增 `firstDayOfWeek` 与 `maxSelected`，原样交给浮层里的日历：前者单独改周首日（0 = 星期日 … 6 = 星期六，输入行的段序仍按 `locale`），后者限定 `selectionMode="multiple"` 下最多选几个周期，带的日期比上限多的快捷选项同时不可按下。Web Components 的 attribute 是 `first-day-of-week` 与 `max-selected`。
