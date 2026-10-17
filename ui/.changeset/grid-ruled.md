---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

栅格（Grid）新增 `ruled`：画外框与格与格之间的横竖线，跨行跨列的格子里不出线，可以用来排带合并单元格的表格式布局。Web Components 写 `ruled` 属性，根上写 `data-split`，与表格（Table）的 `ruled` 同名同义。

- 画格线时行列间距为 0，`gap`、`rowGap`、`columnGap` 与 `--xh-grid-gap` 不生效；格子铺满所在格，`align` 与 `justifyItems` 不生效。
- 每道线只画一次，半透明的线色不会在相邻格子之间叠深。格子要铺满整行，空着的位置里没有格线，外框始终完整。
- 新增覆盖槽 `--xh-grid-divider`（格线与外框的颜色，缺省 `--xh-border-default`）与 `--xh-grid-ruled-padding`（画格线时格子的内衬，缺省与描述列表 outline 形态格子的内衬一致）。
