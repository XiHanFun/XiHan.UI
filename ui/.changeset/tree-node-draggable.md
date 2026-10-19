---
'@xihan-ui/headless': minor
---

树（Tree）的节点数据新增 `draggable`：开着 `nodeDraggable` 时，写 `draggable: false` 的那一个节点拖不起来（指针按住、Alt + 方向键都不搬它，行上不写 `data-draggable`，拖拽把手报禁用），照常能选、能展开，也照样是别的节点的落点；不向下传导给子节点。原先只有 `disabled` 能让节点拖不动，可它连选中与「放进去」也一起关掉了。`TreeNodeMeta` 随之多一个 `draggable` 字段。
