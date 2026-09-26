---
'@xihan-ui/core': minor
---

新增条目到达原语 `trackArrivals(container, { item })`：开始时已在的条目打上 `data-instant`（首帧不播进场），之后同一批新到的条目（插入，或撤掉 `hidden` 重新露出）按到达顺序写私有槽 `--xh-_stagger-index`（0 起，封顶 `STAGGER_CAP` = 4）；`initial: 'arrive'` 让开始时已在的条目也算第一批到达，照常进场。另导出 `hasUserActivated(win)`：页面上的用户还没动过手时挂载的内容属于页面载入时就在的内容，不播进场。
