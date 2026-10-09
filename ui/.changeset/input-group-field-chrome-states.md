---
'@xihan-ui/styles': patch
---

InputGroup 的悬停抑制只认组里带字段外壳的那一段：组里单独禁用一颗按钮时整组照常悬停升描边，与禁用面的判据一致。组里的字段禁用时前后缀块的字随禁用面取 `--xh-fg-disabled`，强制色档取 GrayText。
