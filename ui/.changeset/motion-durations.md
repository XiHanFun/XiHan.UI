---
'@xihan-ui/tokens': major
'@xihan-ui/motion': major
---

**调整** 时长收成两档基调：换色 150ms、几何 200ms。`--xh-duration-fast` 由 120ms 改为 150ms，跟着它的 `--xh-motion-duration-micro` / `-exit` / `-collapse` / `-press` 一起变成 150ms，减弱动效下保留的淡变（`micro` / `enter` / `exit`）同样变成 150ms；`--xh-motion-duration-nudge`（开关滑块、勾选标记、展开箭头这类原地的小幅几何变化）改引 `--xh-duration-normal`，由 120ms 变成 200ms，与 `move` 同档。`@xihan-ui/motion` 的 `durations.fast` 随之改为 150，`motionDurations.nudge` 改为 200，`reducedMotionDurations` 的淡变档改为 150。要回到原来的节奏，在主题根上把这几支令牌写回原值。
