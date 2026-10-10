---
'@xihan-ui/core': minor
---

`trackListMotion` 新增两个选项：

- `reflow`（缺省 `true`）：传 `false` 时只做到达与离场替身，留下来的条目不做换位补偿，给位置另有一套测量自己排、自己过渡的集合用（通知叠成的一摞）。
- `wrapped`（缺省 `false`）：条目外面包着作者节点、宿主删的是外壳时传 `true`（Web Components 的卡片元素），被删外壳里面的条目同样放离场替身。
