---
"@xihan-ui/viz": minor
---

新增子路径 `@xihan-ui/viz/hierarchy`：层级布局。

- `hierarchy(data, children)` 把嵌套数据建成层级节点，`stratify(rows, { id, parentId })` 把扁平的行按父 id 组树；id 重复、父节点不存在、多个根、没有根、成环或共享子树一律报 `XH_VIZ_HIERARCHY`，不静默丢行。
- 节点带深度、高度、父子与聚合值，提供 `each` / `eachBefore` / `eachAfter` 三种遍历、`sum`、`count`、`sort`、`ancestors`、`descendants`、`leaves`、`links`、`path`、`find`。
- `treemap(root, { size, tile, paddingInner, paddingOuter, paddingTop, round })`：铺法 `squarify`（目标宽高比缺省黄金比）、`binary`、`slice`、`dice`、`slice-dice`，也可以传自定义铺法。
- `partition(root, { size, padding })`：冰柱图的分区，旭日图把 x 当角度、y 当半径；`pack(root, { size, padding, radius })`：兄弟圆前链排布加最小外接圆，随机次序取固定种子，结果只由数据决定。
- 不从包入口导出：只画直角坐标图的应用不为它付字节。子路径单独计体积，实测 4.39 kB（gzip），限额 4.5 kB。
