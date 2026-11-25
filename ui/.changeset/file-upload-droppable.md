---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
---

**破坏性** FileUpload 接不接受拖放的布尔开关从 `allowDrop` 改叫 `droppable`：`allow<对象>Drop` 留给 Table、Tree 那种「这一次落点许不许」的校验函数，同名不同型容易写错。缺省仍是 true。

| 旧名 | 新名 |
| --- | --- |
| `allowDrop`（WC attribute `allow-drop`） | `droppable`（WC attribute `droppable`） |
