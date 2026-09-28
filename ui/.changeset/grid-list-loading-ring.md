---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

GridList 的加载态按占位态的两种相位画：

- 还没有行、正在取：`loading` 占位投影 `data-xh-loading-ring` 与 `data-loading`，一枚加载环（加载环家族配方）排在文案之前，直径取尺寸档的图标档。
- 已有行时重新取数：行保留上一帧、按 `micro` 淡到 `--xh-grid-list-row-loading-opacity`（缺省 `--xh-state-disabled-opacity`），取完淡回；此前是一刀切到禁用透明度。
- 空态与加载态占位排版统一：字号与行内内衬随尺寸档与条目同档、文字取 `--xh-fg-muted`（此前 `--xh-fg-subtle`，那一档留给占位字与禁用标签）、块向内距 `--xh-space-3`；新增 `--xh-grid-list-state-gap` 管环与文案的间距。
