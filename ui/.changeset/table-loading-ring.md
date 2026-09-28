---
'@xihan-ui/headless': minor
'@xihan-ui/styles': major
---

Table 的加载态改按占位态的两种相位画：

- 表体为空、正在取数：`loading` 占位投影 `data-xh-loading-ring` 与 `data-loading`，一枚加载环（加载环家族配方，与 Spinner 环档同一副画法）排在文案之前，直径取表格尺寸档的图标档；不再让整块占位呼吸。**删除关键帧 `xh-table-loading-pulse`**（关键帧名是公开面）；`--xh-table-loading-duration` 保留，改为环转一圈的时长，缺省 `--xh-motion-loop-spin`。
- 已有行时重新取数（排序、翻页、筛选）：此前只写 `aria-busy` / `data-loading`，皮肤没有任何可见反馈；现在表体与表尾保留上一帧、按 `micro` 淡到 `--xh-state-disabled-opacity`，取完再淡回，表头不动。
- 空态与加载态占位的排版按占位态统一：块向内距 `--xh-space-3`、行内与单元格文字对齐（`--xh-control-px-sm`）、环与文案之间取控件间距、不设最小高（`--xh-table-state-min-h` 缺省由 `8rem` 改为 `0`），字号随表格的尺寸档。
