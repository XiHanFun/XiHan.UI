---
"@xihan-ui/core": minor
"@xihan-ui/web-components": minor
---

**Portal 租约公开占位节点，Light DOM 宿主能把自己生成的节点排在浮层的作者位置之前。**

`PortalLease` 新增 `placeholders`，与 `roots` 一一对应：租约期间留在各根作者原位的占位节点，归位时被根替换。Web Components 的 `PortalLeaseController` 据此给出 `homeOf(root)`，`AnchoredPortalController` 给出 `home()`：未搬迁时是 positioner 自己，搬迁中是占位节点。宿主自己生成、要排在浮层前面的节点（表单出口）按它定位，浮层归位后文档序不变。
