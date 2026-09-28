---
'@xihan-ui/web-components': patch
---

`xh-grid-list` 在标记里声明行（不给 `collection`）时，整体 `disabled` 设为 `true` 再改回 `false`，行会回到自己声明的禁用：没声明禁用的行重新可选、可聚焦，声明了禁用的行照旧禁用。此前整体禁用期间写满每一行的 `aria-disabled="true"` 在解禁那一刻被当成行自己的声明读回，所有行从此一直禁用。挂载时就整体禁用、之后再解禁同样适用。
