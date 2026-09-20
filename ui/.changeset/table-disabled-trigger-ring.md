---
'@xihan-ui/styles': patch
---

Table 全选 / 列显隐 / 行选择把手在「勾选且置灰」时聚焦环不再取 `currentColor`：置灰档的勾已藏成透明，环随之整个消失；`aria-disabled` 的把手仍能落焦，环退回默认那一支。
