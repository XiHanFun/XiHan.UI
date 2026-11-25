---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**新增** 焦点圈定 FocusTrap（`XhFocusTrap` / `<xh-focus-trap>`）：`active`（缺省 true）期间焦点留在区域里，激活时移到第一个可聚焦元素、一个都没有时落到区域本身，Tab 走到两端回绕，被拉到外面时拉回，停用或卸载时还给激活前的持有者。`loop`、`autoFocus`、`restoreFocus` 三个开关缺省都是 true。开在里面的浮层、压在上面的对话框打开期间它暂停；它不收 Escape，放在对话框里时 Escape 仍然关掉对话框。
