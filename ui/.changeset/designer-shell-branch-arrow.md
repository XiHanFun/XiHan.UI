---
'@xihan-ui/designer-shell': patch
---

页面结构 `<xh-designer-outline>` 与物料面板 `<xh-designer-palette>` 的分支行展开后箭头朝下：分支行只放一个空的 `branch-trigger`，由 Tree 的皮肤画箭头、按展开态转向；原先在里面又套了 `branch-indicator`，两层各转一次，展开的箭头指向了行首。
