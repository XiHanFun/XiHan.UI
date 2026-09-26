---
'@xihan-ui/motion': minor
---

新增手势松手的物理：`rubberBand(overshoot, dimension)` 越界跟手的橡皮筋衰减、`rubberClamp(value, min, max, dimension)` 只衰减越出区间的那段、`projectRelease(position, velocity, seconds)` 松手落点投影、`nearestSnap(points, position)` 最近吸附点，以及 `glideSpring(seconds)`——临界阻尼、固有频率 1 / seconds 的弹簧，以投影落点为目标时恰是指数减速的惯性滑行。
