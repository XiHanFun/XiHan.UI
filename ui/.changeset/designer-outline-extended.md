---
'@xihan-ui/designer-shell': minor
---

页面结构可以多选，照文件管理器：点击换成这一行，按住 Ctrl / ⌘ 点击或按 Ctrl / ⌘ + Space 加选与取消，按住 Shift 点击从锚点选一段，一段里夹着的分组行不算。`selection` 显示整份选中，`node-select` 交出整份新的选中（可能为空），适配器的 `select` 照此换掉设计器的选择；从外面换的选中把新选上的第一行滚进可见区，设计器照着 `node-select` 写回时不滚动。
