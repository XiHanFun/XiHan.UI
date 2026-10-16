---
'@xihan-ui/designer-kit': minor
---

`@xihan-ui/designer-kit` 的 `snapRect` 新增选项 `lines: { x?, y? }`：贯穿画布的吸附线，如从标尺拖出的参考线。`x` 是竖线的横坐标，`y` 是横线的纵坐标，与目标矩形的线一同比对，取阈值内最近的一条；网格仍是两者都没吸上时的退路。吸上时返回的参考线只覆盖移动的矩形；线的坐标不是有限数时抛 `RangeError`。新增类型 `SnapLines`。
