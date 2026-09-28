---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

Table 行换位落位与冻结列边界提示：

- 行换位（拖放与 Alt + 方向键）提交之后，宿主按 `ids` 重排的那一次里，行按旧位置反向补偿、经 `translate` 过渡（`--xh-motion-duration-move` / `--xh-motion-ease-continuous`）滑到新位置，详情行随数据行一起走；此前在宿主重渲那一刻瞬移。减弱动效下即时落位。
- 冻结列的边界提示：横向滚过之后，紧挨滚动区的冻结列（投影 `data-frozen-edge`）朝向滚动区的一侧出现一道 `--xh-border-default` 描边（新增组件槽 `--xh-table-frozen-edge`），只在确有内容被压住时出现——行首冻结列滚离起始端后、行尾冻结列没滚到末端时，按 `micro` 淡入淡出。`root` 以 `data-at-min-horizontal` / `data-at-max-horizontal` 报横向滚动贴着哪一端（没有冻结列或没量过时两端都算贴着）。新增类型 `TableScrollEdges`。
