---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

Tree 的整树加载态按占位态的两种相位画（节点级的 `loadingValue` 不变）：

- 还没有节点、正在取：`loading` 占位投影 `data-xh-loading-ring` 与 `data-loading`，一枚加载环（加载环家族配方）排在文案之前，直径取尺寸档的图标档；此前只有一行静态文字。
- 已有节点时重新取数：`tree` 部件投影 `data-loading`，行保留上一帧、按 `micro` 淡到 `--xh-tree-row-loading-opacity`（缺省 `--xh-state-disabled-opacity`）并不接指针，取完淡回，树框不淡；此前除 `aria-busy` 外没有任何可见反馈。
- 空态与在途占位排版统一：字号与行内内衬随尺寸档与条目同档、文字取 `--xh-fg-muted`（此前 `--xh-fg-subtle`）、正文行高；新增 `--xh-tree-loading-gap` 管环与文案的间距。
