---
'@xihan-ui/headless': patch
'@xihan-ui/styles': patch
---

代码类面的缺省档与强调色对齐：

- CodeView、DiffView 不写 `size` 时字号改为 md 档，与面内按钮同档（此前正文 sm、按钮 md）。
- CodeView 行号槽的分隔线改用 `--xh-border-subtle`（内部分隔），与 DiffView 一致。
- CodeView 高亮行改为中性淡底 + 行首强调条（`--xh-bg-subtle` + `--xh-border-strong`），不再用只表达选中的品牌淡底。
- Log 行高缺省改走 `--xh-text-code-leading`（1.5rem），与 CodeView 同一把尺；按 `rows` 定高的视口随之变高，要维持原密度可写 `--xh-log-line-height: 1.25rem`。
