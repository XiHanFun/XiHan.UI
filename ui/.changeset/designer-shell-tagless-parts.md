---
"@xihan-ui/designer-shell": patch
---

**修复** 问题列表、物料面板与属性面板自己生成的空提示、条目列表与字段说明改用 `div`（列表靠 `role="list"`、`role="listitem"` 标出），宿主按标签名重置 `p`、`ul`、`li` 的边距与列表样式时，空提示不再贴边、问题条目不再出缩进与圆点。
