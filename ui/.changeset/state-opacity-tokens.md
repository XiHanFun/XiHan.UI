---
'@xihan-ui/styles': patch
---

**修复** 拖起与禁用的透明度只取状态令牌：Sortable 拖起的那一项从 0.9 改取 `--xh-state-dragging-opacity`（0.6，与 Table、Tabs、Tree 拖起的那一项一致），Splitter 禁用时的整块压暗从 0.6 改取 `--xh-state-disabled-opacity`（0.5），Progress 减弱动效档里不定态的静态条改引同一支令牌（取值不变）。`--xh-sortable-item-opacity-dragging`、`--xh-splitter-disabled-opacity` 照旧可改。
