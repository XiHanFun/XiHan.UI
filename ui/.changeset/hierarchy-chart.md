---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/react": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

新增 `hierarchy-chart` 层级图：看层级数据中各部分的占比，并逐层下钻。

- 数据是嵌套的树（`childrenField`），或扁平的行（`idField` / `parentField`）；只取叶子的值，上层是子孙之和，兄弟按值从大到小排。多根、父节点缺失、成环报 `chart.hierarchy-shape`，负值报 `chart.negative-share`。
- `layout` 取 `treemap`（缺省，`tile` 取 `squarify` / `binary` / `slice-dice`）、`sunburst`、`icicle`（`orientation` 换方向）、`pack`；`depth`（缺省 2）是同时看得见的层数。
- `colorBy` 取 `branch`（缺省：第一层分支按数据次序取分类色，后代向承载面混色变浅；多于 8 个分支报 `chart.too-many-series`）、`value`（顺序色阶，`palette` 换色相）或 `uniform`。标签先量再放，放不下的交给提示框与数据表。
- 点有子节点的节点或按 Enter 下钻，Backspace 与旭日图中间的空洞上钻；下钻路径是一组 nav 语境的按钮。`rootKey` / `defaultRootKey` / `onRootKeyChange` 受控或记住下钻的位置，`api.drillTo` / `api.drillUp` 供外部调用。
- 绘图区是 `role="tree"`，节点是带 `aria-level` / `aria-setsize` / `aria-posinset` / `aria-expanded` 的 treeitem；左右键在兄弟之间、上下键在父子之间走。数据表列出整棵树的路径、数值与占上一层的比例。
