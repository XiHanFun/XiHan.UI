---
'@xihan-ui/viz': minor
---

`@xihan-ui/viz/graph` 新增分层有向图布局与直角连线路由，供流程图、依赖图这类有方向的关系图使用。

- `layered(sizes, links, options)`：按节点宽高排出分层有向图。环路里的回边按反向处理并标出 `reversed`；跨层连线给出途经点 `bends`；`direction` 取 `TB` / `BT` / `LR` / `RL`，`nodeGap`、`linkGap`、`layerGap` 控制同层、途经点与层间的空隙；结果带每个节点的层号与层内次序，以及最终的交叉数 `crossings`。同样的输入得到同样的布局。
- `routeOrthogonal({ source, target, obstacles, margin, bendCost })`：给出两端的点与离开、进入的方向，求一条只走水平与竖直线段、与障碍物保持 `margin` 间距的折线，拐弯越少越好；找不到通路时 `clear` 为 `false`，`points` 是不看障碍物的折线。
