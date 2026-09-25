---
'@xihan-ui/viz': minor
---

`@xihan-ui/viz` 新增几何拾取。命中走几何，不依赖 DOM，粗指针与 Canvas 渲染共用同一套逻辑。

- `createQuadtree`：一次建好、不可变的四叉树，`find` 取半径内最近点（距离相同取输入里靠前的），`findAll` 按距离列出，`visit` 先序遍历。
- `pointInArc`、`pointInPolygon`、`polygonArea`（屏幕坐标下顺时针为正）、`polygonCentroid`。
- `createPicker(scene)`：只看数据层里未退场、可聚焦的标记。柱按整条带宽 × 绘图区值域命中，很短的柱也能命中，堆叠时指针落在哪段就是哪段；折线与面积沿对齐轴取最近的键、再按另一轴取最近系列；散点用四叉树，命中半径 = max(符号外延 + 2px, 最小半径)；扇区按极坐标判定。最小命中半径细指针 12、粗指针（touch、pen）22，即命中区 24px 与 44px。`axis` 模式报告同一自变量位置上的全部系列，每个系列一个。
