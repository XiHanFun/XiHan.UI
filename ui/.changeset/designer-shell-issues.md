---
'@xihan-ui/designer-shell': minor
---

新增问题列表 `<xh-designer-issues>`：列出设计器换好文字的结构问题，缺省错误在前、警告在后，也可以按问题所在对象分组（`group-by="target"`，组标题取条目的 `subject`），头部两个过滤开关带条数，过滤状态在换数据后保留。有 `target` 的条目可用方向键移动焦点，点击或回车派发 `issue-activate`，悬停派发 `issue-hover`。
