---
'@xihan-ui/designer-kit': minor
---

`@xihan-ui/designer-kit` 补齐保存点、旋转矩形命中、变换控制柄与标尺。

- 历史栈：`markSaved()` 记下保存点，`dirty` 判断是否有未保存的修改（撤销、重做回到保存点即变干净，事务中有改动即为脏），变化通知多一种 `save`；`reset` 后的新文档视为已保存，`clear` 不改是否已保存。应用后文档仍是同一引用的执行不再入栈，也不通知。
- 旋转矩形：`Rect` 新增可选的 `rotation`（绕中心顺时针的角度）。`unionRects`、`rectContains`、`rectsIntersect`、`alignRects`、`distributeRects`、`snapRect` 与视口的 `fitRect`、`revealRect`、`constrainViewport` 遇到旋转矩形时按旋转后的包围盒计算，矩形换算与 `expandRect` 保留旋转角；新增 `rotatePoint`、`rectCorners`、`rotatedBounds`、`pointInRect`、`hitTest`、`rotatedRectIntersects`，框选的 `intersect` 按旋转后的实际形状判断。
- 变换控制柄：`handlePoints` 给出八个缩放柄与旋转柄的位置；`resizeWithHandle` 在矩形自身坐标系里缩放，对边或对角（或中心）不动，支持等比与最小尺寸；`rotateWithHandle` 按指针算角度并可按步长吸附；`nudgeDelta` 把方向键换成位移。
- 标尺：`rulerTicks` 按每单位屏幕像素从 1-2-5 序列取主刻度并分小格，单位由调用方决定。
