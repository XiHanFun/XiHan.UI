---
'@xihan-ui/pointer': minor
---

多指会话 `createMultiPointerSession` 的 `onEnd` 新增 `velocity`：最后抬起的那根手指的松手速度（像素每秒），与单指会话同一算法，停住再抬起或被系统收走时为零。
