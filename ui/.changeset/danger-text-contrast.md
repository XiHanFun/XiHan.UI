---
'@xihan-ui/tokens': patch
---

危险色文字（`--xh-fg-danger`，字段错误文案、删除钮等）在所有表面底色上都达到 WCAG AA 正文的 4.5:1：此前浅色档压在淡底（subtle / muted，含折叠面板内容区）上只有 4.35:1，深色档压在 surface 上的 muted 只有 4.02:1。浅色改取 `danger-700`，深色改取 `danger-400` 再提亮一点；悬停色 `--xh-fg-danger-hover` 随之往外推一档，也在 4.5:1 以上。描边、聚焦环这些非文字的危险色不变；图表配色不受影响。
