---
'@xihan-ui/motion': minor
---

JS 动画可以从元素读取语义动效令牌，减弱动效按元素的作用域判断。

- 新增 `readMotion(el)`：按语义名读取 `--xh-motion-duration-*`（毫秒）与 `--xh-motion-ease-*`（采样函数）的实际取值，作者对组件槽的覆盖、容器上的 `data-motion` 与系统偏好都已算进计算样式；读不到时取与令牌同值的常量。
- 新增与令牌同值的常量 `motionDurations`、`motionEasings` 及类型 `MotionDurationName`、`MotionEaseName`、`MotionReading`。
- `resolveMotionPreference` 接受元素：最近祖先上的 `data-motion`（`reduce` / `default`）优先，其次是应用级 override 与系统设置。传入窗口或不传时行为不变。
- 缓动表新增与令牌原语同值的 `outFluid`、`outBack`。
- `resolveEasing` 遇到认不出的写法仍按匀速播放，开发构建下同一写法在控制台警告一次。
