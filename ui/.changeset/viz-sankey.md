---
"@xihan-ui/viz": minor
---

新增子路径 `@xihan-ui/viz/sankey`：桑基布局。

- `sankey(nodes, links, { size, nodeWidth, nodePadding, nodeAlign, nodeSort, iterations })`：节点值取流入与流出里较大的，深度按拓扑序的最长路径，`nodeAlign` 取 `justify`（缺省）/ `start` / `end` / `center` 分列；纵向比例由最挤的一列决定，几轮松弛把节点移向相连节点的流量加权中心，每轮后解开重叠；流带在节点两端按对端的位置排开。
- `sankeyLinkPath(link, orientation)` 写出流带的中线（两端水平进出），以流带宽度为线宽描出来；`vertical` 横纵对调。
- 成环报 `XH_VIZ_SANKEY_CYCLE`，`detail.cycle` 列出环路；未知节点、自环、负值报 `XH_VIZ_INVALID_ARGUMENT`，重复节点报 `XH_VIZ_DUPLICATE_KEY`。
- 不从包入口导出，子路径单独计体积：实测 2.09 kB（gzip），限额 2.5 kB。
