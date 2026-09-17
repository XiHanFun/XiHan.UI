---
'@xihan-ui/styles': minor
---

**Tooltip 入场改走 enter 档，顶部高光缺省不画。** 展开动画 `xh-overlay-slide-in` 的时长由借用的
`--xh-motion-duration-exit`（120ms）改为 `--xh-motion-duration-enter`（200ms），与其他锚定列表浮层同一
节奏，退场不变；内描边式顶光的缺省由 on 色 24% 拼色改为透明（§8.1 不用顶部高光），公开槽
`--xh-tooltip-highlight` 保留、要加自行灌色；私有槽 `--xh-_tooltip-highlight` 删除。反白身份保留：
描边仍取 on 色 20% 拼色（真源 §8.4 已登记为反白 compact frosted 的刻意例外）。
