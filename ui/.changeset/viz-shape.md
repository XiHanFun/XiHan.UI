---
'@xihan-ui/viz': minor
---

`@xihan-ui/viz` 新增形状生成器。全部只写入 `PathSink`：不传 sink 返回 SVG 路径字符串，传入 Canvas 2D 上下文时直接绘制。

- 曲线：`curveLinear`、`curveLinearClosed`、`curveMonotoneX` / `curveMonotoneY`（Fritsch–Carlson 单调三次插值，不越过数据点，是数据曲线「平滑」的唯一实现）、`curveStep` / `curveStepBefore` / `curveStepAfter`、`curveCatmullRom` / `curveCatmullRomClosed`（向心，不打结）、`curveBasis`、`curveBundle(beta)`、`curveBumpX` / `curveBumpY` / `curveBumpRadial`。不提供会制造不存在极值的自然三次样条。
- `line`、`area`、`lineRadial`、`areaRadial`：缺失的点处断开，不按 0 连过去；面积的回程基线与上沿用同一条曲线对齐。
- `arc` / `arcCentroid`：角度 0 在 12 点方向、顺时针为正。扇区间隙是与径向边平行的等宽条带，宽度不随半径变化，饼的尖端落在两条边线的交点；`cornerRadius` 夹到环厚一半，并缩到弧长容得下两侧圆角。
- `pie`：间隙角计入每个扇区自己的角度范围，角度之和恰为一圈；负值抛 `XH_VIZ_NEGATIVE_SHARE`。`foldSmall` 按最大扇区数或最小占比把尾部并成「其他」，并入的条目原样保留供提示框列出。
- `stack`：次序 none / appearance / ascending / descending / insideOut / reverse，偏移 none / expand / diverging / silhouette / wiggle；每段 `y1 − y0` 恒等于它的值，缺失值是不画的空段，每列朝上、朝下各标出最外层的段；百分比堆叠遇到负值报错。
- `symbol`：circle、square、diamond、triangle、triangleDown、cross、star、wye 八种，以面积为尺寸，视觉等重，次序与色槽对齐（`SYMBOL_NAMES`）。
- `roundedBar`：只在远离基线的一端做圆角，半径夹到 min(半径, 厚度 / 2, 长度)。`link` 画横向、纵向与径向的连线。
