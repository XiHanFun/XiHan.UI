---
'@xihan-ui/pointer': minor
---

指针会话的结束回调新增 `velocity`：抬起前最近 80ms 内的移动按首尾位移与时间差求出的松手速度（像素每秒），可直接交给 `createSpringValue` 做手势松手。停住再抬起、或被系统收走（`pointercancel`）时为零。新增导出类型 `PointerVelocity`。
