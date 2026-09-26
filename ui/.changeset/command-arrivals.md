---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

Command 打开时已有的结果不再逐条冒出来：每次打开，列表接上条目到达的追踪之前投影 `data-instant`，接上时已在的结果直接呈现；之后因检索串换掉而新露面的一批结果按到达顺序错开进场（`--xh-_stagger-index`，封顶 4 个步长），不再按它在可见结果里排第几。
