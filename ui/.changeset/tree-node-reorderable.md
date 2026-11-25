---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
---

**破坏性** Tree 的拖动重排开关与落点校验改名，与 Table 的 `rowReorderable` / `allowRowDrop`、Tabs 的 `reorderable` 同一套说法：开关叫 `<对象>Reorderable`，校验函数叫 `allow<对象>Drop`。节点数据上的 `draggable: false` 不变。

| 旧名 | 新名 |
| --- | --- |
| `nodeDraggable`（Vue 模板与 WC attribute `node-draggable`） | `nodeReorderable`（Vue 模板与 WC attribute `node-reorderable`） |
| `allowDrop` | `allowNodeDrop` |
