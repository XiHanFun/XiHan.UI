---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

虚拟滚动（Virtualizer）新增 `estimateFromMeasured`（Web Components 属性 `estimate-from-measured`）：没量过的条目按已量条目的实测平均（取整）估算，条目开 `measure` 把真实尺寸回传即可，不必再写死 `estimateSize`。

- 行高由皮肤决定、随尺寸、密度与皮肤变化的列表（表格行）用它：写死的估算与实际行高对不上时，跳到远处会被校正回去（设到 3000、读回来是 3224）；打开后读回的偏差在一行以内。
- 已量条目的尺寸变了（换密度、换皮肤、视口变宽换行）时，窗口外的旧实测作废，一并按新的平均估算；估算变动时视口里第一条停在原处。
- 打开后 `estimateSize` 只管一条都还没量到的时候；没给时先按视口长度估，首屏只排出头几条，量到之后按实测铺满。`measure()` 丢掉实测后沿用上一份平均。
- 文档：表格的「只渲染窗口内的行」示例改用它，行不再写死高度，也去掉了自己补的行间线（表格皮肤已经画）。
