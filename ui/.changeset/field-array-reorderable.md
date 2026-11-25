---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
---

**破坏性** FieldArray 的换序开关从 `movable` 改叫 `reorderable`，与 Tabs 的 `reorderable`、Table 的 `rowReorderable`、Tree 的 `nodeReorderable` 同一个词；根上的状态属性随之改名。

| 旧名 | 新名 |
| --- | --- |
| `movable`（WC attribute `movable`） | `reorderable`（WC attribute `reorderable`） |
| `api.movable` | `api.reorderable` |
| `data-movable` | `data-reorderable` |
