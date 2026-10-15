---
'@xihan-ui/viz': minor
---

新增折线工具，供连线类图形放标签、画箭头与让出端点：

- `polylineLength(points)`：折线总长。
- `polylinePointAt(points, fraction)`：按总长比例取点，0 为起点、1 为终点、0.5 为总长一半处；总长为 0 时取起点。
- `shortenPolyline(points, { start, end })`：两端沿折线各收回一段，跨过的点一并去掉；两端收回之和不小于总长时停在同一位置。
- `arrowHead(from, tip, { length, width })`：尖端在 tip、沿 from → tip 方向的箭头三角形（闭合的 `PathSegment`），宽缺省为长度的 0.8 倍，交给 `segmentsPath` 写成路径。

关系图的有向箭头与连线收线改由这几个函数计算，渲染结果不变。
