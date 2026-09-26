---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/react": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

`cartesian-chart` 新增散点与气泡系列 `mark: 'scatter'`：看两个量之间的关系与分布。

- 每行一个点，同一个 `x` 上可以有任意多个点。只有散点时自变量按数据推断为连续轴，两端缺省取整到刻度上，两个方向都画网格；提示框缺省按 `item` 汇报，命中取离指针最近的点。
- 点的形状缺省随色槽依次取圆、方、菱形、三角……，`symbol` 可指定；图例与提示框的色标画成同一个形状（带 `data-mark="point"` 与 `data-symbol`）。
- `size` 把一个字段映射到点的面积（半径取平方根），全部散点系列共用一把尺，最大半径等于柱厚上限；大的先画、小的压在上面。连续轴两端收进一截，贴着定义域端点的点也整个落在绘图区里。
- `jitter` 在类目轴上把点左右散开，偏移以点的身份为种子，重渲染不跳；`datumId` 指定身份字段，数据换序时同一个点落在同一处，过渡里也按它配对。
- 点本身可聚焦、roving 取 Tab 位，左右键按 x 的次序走，上下键换到另一个系列里 x 最近的点；焦点环按点的大小外扩。
- 含散点时数据表改为每个数据一行（系列、x、y，有气泡时再加大小），新增文案 `seriesLabel`、`valueLabel`、`sizeLabel`；气泡的缺省可及名与提示框在数值后面补上大小。
- 修正 `trigger="item"` 时折线命中不到数据点的问题。
