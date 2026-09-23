---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

Listbox 的选中改成与 TreeSelect 同一种读法：行不换面、不换字色，只在行尾亮对号。

- 条目的 `data-xh-collection-context` 由 `page` 改为 `overlay`，选中叠悬停 / 按下沿用未选行的 100 → 200 阶梯。
- forced-colors 下选中行保持 Canvas，只由对号表达；打印时对号按原样印出。

**破坏性变更**：删除组件槽 `--xh-listbox-item-bg-selected`。`--xh-listbox-item-fg-selected` 保留，缺省改回条目自己的字色。
