---
'@xihan-ui/viz': minor
---

`@xihan-ui/viz` 新增路径接收端 `PathSink` 与 SVG 路径构建器 `createSvgPath(digits)`。

- `PathSink` 与 Canvas 2D 的路径方法同名同义（`moveTo`、`lineTo`、`bezierCurveTo`、`quadraticCurveTo`、`arc`、`arcTo`、`rect`、`closePath`），形状生成器只写入它：同一个生成器既能产出 SVG 的 `d`，也能直接驱动 `CanvasRenderingContext2D`。
- SVG 构建器按 Canvas 语义画弧：有当前点时先直线接到弧起点，整圆拆成两个半圆，`arcTo` 画与两条边相切的圆角、三点共线时退成直线。数值缺省保留 2 位小数，控制大数据量时的 DOM 体积；半径为负时报错。
