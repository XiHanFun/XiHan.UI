---
'@xihan-ui/headless': patch
---

TimePicker 与 TimeRangePicker 浮层里按 Tab 不再立即收起：焦点按 Tab 序列在各列、快捷选项列与底栏之间走，走出浮层才收起且不抢回焦点。多选时键盘用户可以 Tab 到「添加」并按 Enter 收进值，列上的 Enter 处理器不再截走底栏按钮的按键。
