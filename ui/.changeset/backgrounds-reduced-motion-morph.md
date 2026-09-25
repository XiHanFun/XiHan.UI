---
'@xihan-ui/backgrounds': patch
---

减弱动效下换点云直接落到新形状，粒子不再卡在旧形状上。

此前开启减弱动效（系统 `prefers-reduced-motion: reduce` 或 `setMotionOverride('reduce')`，且 `respectReducedMotion` 未关）时，画面的时间步恒为 0，`setCloud()` 之后的形变进度永远停在起点：粒子一直停在上一份点云的形状上，而且因为形变没走完，调度循环每帧都在空画。

现在减弱动效下换点云与 `duration: 0` 同样处理，一步落到新形状，画完一帧即停；形变进行到一半时才切到减弱动效，也会立即收尾。未开启减弱动效时的过渡时长与节奏不变。
