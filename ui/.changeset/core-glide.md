---
'@xihan-ui/core': minor
---

新增 `glideBy` / `glideFrom`：条目沿 transform 播一段换位（时长与曲线读元素上的 move / continuous 令牌，减弱动效下直接到位，上一段没走完时接着走）。`trackListMotion` 新增 `channel: 'transform'`，给 translate 另有用途、过渡清单又归别处的条目换位用。
