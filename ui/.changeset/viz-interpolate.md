---
'@xihan-ui/viz': minor
---

`@xihan-ui/viz` 新增插值。

- 基础：`interpolateNumber`、`interpolateRound`、`interpolateDate`、`interpolateArray`、`interpolateObject`、`interpolateString`（以终点为模板插值其中的数字），以及按终点类型分派的 `interpolate`；两端类型不一致时报错。`piecewise` 串联多段，`quantize` 等距取样。
- 颜色：`interpolateOklab` 在 OKLab 里直线插值，`interpolateOklch` 走最短色相弧、一端是灰色时沿用另一端的色相。只用于构建期生成色阶、校验与 Canvas 渲染；SVG 运行时着色交给样式里的 `color-mix()`。
- 几何：柱与扇区的参数（位置、尺寸、起止角、内外半径）用 `interpolateObject` 插值；折线与面积用 `interpolatePoints` 按数据键对齐点序列——两边都有的键从旧位置移到新位置，新增的键从相邻旧点的位置出现，删除的键并入相邻新点后消失，再由插好的点重新生成路径，路径命令结构不一致也不会形变跳变。
