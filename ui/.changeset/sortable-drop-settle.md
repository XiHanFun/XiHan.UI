---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

Sortable 放下后被拖项从松手处带着松手速度落进新位置，不再瞬间跳过去：放下时记下它的屏幕位置，宿主按新顺序重排提交之后量出差值，由弹簧收到零，期间投影 `data-animating`；宿主不接这次排序时照样收回原位。状态机新增上下文 `settle` 与 refs `drop`、`settle`，`POINTER.END` 带 `velocity`。
