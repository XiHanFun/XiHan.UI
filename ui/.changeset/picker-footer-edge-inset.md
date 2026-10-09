---
'@xihan-ui/styles': patch
---

DatePicker、DateRangePicker 与 TimePicker 底栏的行首行尾内衬改由两端各一个定宽占位让出，不再挂在首末子节点的外边距上：作者把附注写成裸文本时行首仍留 8，确认钮（「添加」）按状态收起、附注成了末一项时它那一头也留 8。底栏仍不参与撑宽。
