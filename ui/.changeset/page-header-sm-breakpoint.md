---
'@xihan-ui/styles': patch
---

`page-header` 在视口恰好 640px 时改按宽档排布。

窄屏规则（标题区占满第二列、操作区换到下一行）此前写在 `@media (max-width: 640px)` 下：640px 本身也算窄档，而其余皮肤在 `min-width: 640px`（`--xh-breakpoint-sm`）就已换到宽档，同一宽度下页头与页面其余部分差一档。现在改写成 `@media not all and (min-width: 640px)`，639px 及以下仍是窄档，640px 起与其余组件同时换成宽档。
