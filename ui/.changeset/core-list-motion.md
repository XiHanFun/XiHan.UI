---
'@xihan-ui/core': minor
---

新增列表动效原语 `trackListMotion(container, { item, initial })`：在 `trackArrivals` 的到达规则之上，接住条目的离场与换位。条目被宿主移出文档时，在原位置放一个退场态的替身（摘掉 id、表单名与 `data-xh-part`，`inert`、`aria-hidden`、`data-state="closed"`，绝对定位在原排布位），等它身上实际起播的退场动画播完再移除；留下来、排布位变了的条目先写反向的 `translate`，再交给皮肤的 `translate` 过渡回到新位置。同一批变更里被挪了位置的已知条目算换位，不算到达。时长与曲线全部由皮肤的令牌给出。
