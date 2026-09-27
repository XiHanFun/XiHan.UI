---
"@xihan-ui/core": minor
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/react": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

新增 `sankey-chart` 桑基图：看流量从哪里来、到哪里去、在哪里流失。

- 数据是流带（`links`：`source` / `target` / `value`），节点（`nodes`：`id` / `name` / `group`）缺省从流带推断。成环、自环、端点不存在或节点重复报新的诊断码 `chart.sankey-shape`，负值报 `chart.negative-share`。
- `orientation` 取 `horizontal` / `vertical`；`nodeAlign` 取 `justify` / `start` / `end` / `center`；`nodeSort` 取 `auto` / `input`。节点厚度取 `--xh-sankey-chart-node-width`，同一列相邻节点至少隔一行字。
- 节点按分组分配分类色（多于 8 组报 `chart.too-many-series`），有两组及以上时显示图例、按组显隐；流带缺省是半透明的中性色，`linkColor` 取 `source` / `target` / `gradient`。
- 悬停节点时相连的流带换成它的颜色、其余淡出，提示框列出流入与流出的明细；悬停流带时写流量与它占两端的比例。名字写在列间的空当里，挤的时候只留放得下的。
- 节点是带可及名的 `graphics-symbol`，流带不占焦点；上下键在同一列里走，左右键沿流向跨到相邻的列、取流量最大的相连节点（竖排时对调），Home / End 到头尾两列。数据表每条流带一行。
