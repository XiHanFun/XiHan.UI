---
'@xihan-ui/designer-shell': patch
---

`<xh-designer-palette>` 的树里，带说明的组（分支行）改用 Tree 的正式部件 `branch-description`：说明与叶子的说明一样落在名称下面一行，放不下截断，与分支名同一起点。此前分支行里放的是一个不属于 Tree 的 `data-part="branch-description"`，说明挤在名称后面。
