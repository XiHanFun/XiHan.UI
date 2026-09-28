---
'@xihan-ui/core': minor
'@xihan-ui/headless': patch
'@xihan-ui/styles': patch
---

Notification 增删卡片时其余卡片从旧位置过渡到新位置，不再整张跳位：

- `trackListMotion` 新增 `depart` 选项（缺省 true）：传 false 时不放离场替身，只做到达与换位，给条目自己带退场、播完才收起的集合用；选项类型以 `TrackListMotionOptions` 导出。
- Notification 的卡片改由它追踪（`depart: false`），皮肤给卡片补上 translate 的 move 过渡。
