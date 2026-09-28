---
'@xihan-ui/headless': patch
'@xihan-ui/styles': patch
---

Cascader 悬停展开不再闪：`expandTrigger: 'hover'` 下指针每扫过一个父项，子列换一批条目时都重播一遍淡入加 5 级错开。列的进场改为只在列头一次出现时播（浮层展开、此前收着的子列铺出来）；展开路径换到同列另一个父项时，连接层给露面的条目投影 `data-instant`，皮肤的进场写在 `:not([data-instant])` 下，换内容不重播。收起即归零，下次展开照常播。
