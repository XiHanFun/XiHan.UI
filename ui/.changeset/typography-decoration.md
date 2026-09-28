---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

Typography 行内文字新增 `strikethrough`、`underline`、`mark` 三个开关（Web Components 写在 `text` 节点上的同名布尔属性），投影 `data-strikethrough` / `data-underline` / `data-marked`，与 `variant`、`tone`、`weight` 叠加；删除线与下划线可并存。标记与文本高亮的命中片段同一副淡底、字色与跨行收边，写了 `tone` 时换成该族；强制色下改用系统高亮反色，打印时保留底色。新增组件槽 `--xh-typography-text-underline-offset`、`--xh-typography-mark-px`、`--xh-typography-mark-radius`、`--xh-typography-mark-bg`、`--xh-typography-mark-fg`。需要删除或标出的原生语义时把标签写成 `del` / `s` / `mark`。typography.css 的体积基线随这几条规则与强制色、打印两块上调。
