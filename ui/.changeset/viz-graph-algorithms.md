---
'@xihan-ui/viz': minor
---

`@xihan-ui/viz/graph` 新增有向图基础算法，包入口新增两个折线路径函数。

- `nodeDegrees(count, links)`：各节点的入度与出度，自环同时算一次入度与一次出度。
- `reachableFrom(count, links, roots)`：沿连线方向从起点能到达的节点。
- `findBackLinks(count, links)`：断环用的回边，把它们反向后图里不再有环；`layered` 内部改用它。
- `topologicalOrder(count, links)`：拓扑序，有环时为 `undefined`。
- `findCycle(count, links)`：找一条环，首尾是同一个节点；`sankey` 的成环检查改用它，报错内容不变。
- 节点用 0 起的下标，连线是 `{ source, target }`（类型 `GraphLink`），下标越界立即报 `XH_VIZ_INVALID_ARGUMENT`。
- `roundedPolylinePath(points, radius, digits?)`：折线的 SVG 路径，拐角倒成圆弧，切点不越过相邻两段的中点。
- `arrowHeadPath(from, tip, { length, width?, digits? })`：箭头三角形的 SVG 路径，几何同 `arrowHead`。
