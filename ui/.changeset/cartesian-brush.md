---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/react": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

`cartesian-chart` 新增刷选。

- `brush` 取 `x` / `y` / `xy`，缺省 `none`。开启后在绘图区里拖动即刷选（指针是十字，放大后的平移改用缩放条或键盘），拖着时画出框、类目轴取整到首尾类目的整条带，松手派发一次 `onBrushSelectionChange`（Vue `brush-selection-change` 与 `update:brushSelection`，Web Components `brush-selection-change`），载荷是范围 `selection` 与框里的数据 `data`。
- 范围 `brushSelection` / `defaultBrushSelection` 写法同缩放窗口（定义域里的值，没刷的方向为 `null`），受控时由作者写回。`api.brush` 给出方向、范围与框在绘图区里的矩形，`api.setBrushSelection` 从外部设置。
- 新部件 `brush`：选中语义的淡底加一圈聚焦色的细边，垫在数据之下；框外的柱、点、K 线与箱线淡出。组件槽 `--xh-cartesian-chart-brush-bg`、`--xh-cartesian-chart-brush-border`。
- 键盘：Shift + 方向键从锚点起沿自变量刷，每按一次派发一次；Escape 与点一下清掉。
- 开了刷选时绘图区写 `data-selectable`；绘图区的 `data-touch-axis` 写出缩放与刷选合起来拦下的触屏方向。
