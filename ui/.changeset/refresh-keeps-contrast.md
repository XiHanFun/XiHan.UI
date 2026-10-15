---
'@xihan-ui/styles': minor
---

集合与表格在「刷新」相位（已有数据、后台在取）不再把内容淡到 `--xh-state-disabled-opacity`。Select、Combobox、Listbox、Mention、Cascader、TreeSelect、Command、Transfer 的条目与 Table 的表体此刻仍可点可选，淡下去之后文字只有 2.1–3.4:1，WCAG 1.4.3 只豁免失效控件。刷新时容器照旧报 `aria-busy`、在途占位照旧让位，内容原样留着。

Tree 与 GridList 的刷新行在取数期间不接指针，仍按原样淡下再淡回。

迁移：删掉了随之不用的组件槽 `--xh-command-list-busy-opacity`，设过它的直接去掉。
