---
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

**HoverCard 说明文字改说明档，卡片面补 overscroll 隔离，自绘条走浮层档。** 视觉默认变化：description 字号
`--xh-text-body-size` 14 → `--xh-text-secondary-size` 13（新增 `--xh-hover-card-description-font-size` 槽）；content
新增 `overscroll-behavior: contain`，滚到头不再把页面一起带走；三端的自绘滚动条改走浮层 4px 档（`size: 'sm'`）。
