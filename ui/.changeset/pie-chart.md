---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/react": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

**新增** `pie-chart` 组件（饼图），Vue、React 与 Web Components 三端可用：一行数据一个扇区，缺省画成环形、中心显示合计。

- 形态 `variant`（donut / pie）、半环 `sweep="half"`、玫瑰图 `rose`；扇区缺省按数值从大到小、自 12 点顺时针。
- 超过 `maxSlices`（缺省 6）时最小的几块并成「其他」，取中性色，提示框列出被合并的各项。
- 外侧标签带两段式引导线，两侧各排一列、推开避免重叠，放不下时去掉最小扇区的标签；也可以写在扇区里或不画。
- 图例切换显隐后合计与占比重算，颜色不变；受控 `activeKey` 按扇区名与其他图联动。
- 扇区是 `graphics-symbol`，绘图区只占一个 Tab 位，方向键顺时针走；根内生成视觉隐藏的摘要与数据表。
- 扇区四角（实心饼含圆心一端）与柱的远端取同一档圆角：图表内核新增圆角度量，缺省 `--xh-shape-inset`，直角坐标图随之新增 `--xh-cartesian-chart-bar-radius` 覆盖槽。
