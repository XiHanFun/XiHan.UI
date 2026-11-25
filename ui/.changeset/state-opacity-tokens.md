---
'@xihan-ui/styles': patch
---

**修复** 拖起的那一项与停下来的不定态，透明度只取状态令牌：Sortable 拖起的那一项从 0.9 改取 `--xh-state-dragging-opacity`（0.6，与 Table、Tabs、Tree 拖起的那一项一致），Progress 减弱动效档里不定态的静态条改引同一支令牌（取值不变）。`--xh-sortable-item-opacity-dragging` 照旧可改。
