---
'@xihan-ui/headless': major
---

**破坏性** Tree 节点移动的载荷类型从 `TreeMove` 改叫 `TreeNodeMoveDetails`，与 `TableRowMoveDetails`、`TabsMoveDetails` 同形；`onNodeMove` 与 `allowNodeDrop` 的形参随之叫 `details`。字段不变：`{ value, parent, index }`。

| 旧名 | 新名 |
| --- | --- |
| 类型 `TreeMove` | `TreeNodeMoveDetails` |
