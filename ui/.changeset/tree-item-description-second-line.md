---
'@xihan-ui/styles': patch
---

Tree 叶子行的说明（`item-description`）落在名称下面一行，与 `TreeNode.description` 的说法一致：带说明的行折成两行，说明独占第 2 行、从行内容的起点开始，放不下就截断。此前行是不换行的一行，说明挤在名称后面，窄的时候把树撑出横向滚动。没写说明的行高不变。
