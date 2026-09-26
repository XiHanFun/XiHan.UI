---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

Notification 的错开开幕改按到达顺序：同一批新到的卡片（同一轮同步调用里连发的几条）按到达先后写 `--xh-_stagger-index` 错开，不再按它在那一摞里排第几——一摞里已有 6 条时，新来的那条不必先等 5 个错开步长。页面载入时就在的卡片同样算第一批，照常进场。三端把作用域包装节点交给队列机器，条目到达的追踪挂在它上面。
