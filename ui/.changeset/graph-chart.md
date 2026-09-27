---
"@xihan-ui/core": minor
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/react": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

新增 `graph-chart` 关系图：看实体之间的连接关系、聚类与层级结构。

- 数据是节点（`id` / `name` / `group` / `value`）与连线（`source` / `target` / `value`）。节点重复、端点不存在、自环，或树布局下数据不是一棵树，报新的诊断码 `chart.graph-shape`；多于 500 个节点按提醒报新的 `chart.graph-size`，多于 2000 个报错不画。
- `layout` 取 `force`（缺省，同步跑到收敛，同样的数据得到同样的布局）、`circular`（按分组等角排在圆上）、`tree`（根在最左）、`radial-tree`（根在圆心）；`root` 指定树的根。
- 节点按分组分配分类色，`value` 经平方根比例尺定面积，连线的 `value` 定粗细，`directed` 画箭头。名字先量再放，互相压住时连线多的节点先放。
- 悬停节点时它、邻居与连着它的线留着、线换成它的颜色；方向键朝那个方向 45° 锥形里找最近的节点，Home / End 到阅读序的头尾。
- 力导布局下可以拖动节点（`draggableNodes`，缺省开；不叫 `draggable`，那是 HTML 的原生属性），松手后模拟冷却到收敛；`zoom` 打开平移缩放（Ctrl / ⌘ 加滚轮、拖动空白处、+ / − / 0 键），`api.zoomBy` / `api.resetView` 供外部调用。
