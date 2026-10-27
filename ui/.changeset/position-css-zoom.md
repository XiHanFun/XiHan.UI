---
'@xihan-ui/position': patch
---

**修复** 宿主在 `html`、`body` 或任一祖先上写 CSS `zoom` 做整页缩放时，浮层不再偏离锚点。锚点的视口坐标已经乘过 `zoom`，引擎写进 `left` / `top` 的值渲染时又被乘了一次，浮层落在「锚点坐标 × zoom」的地方，离页面原点越远偏得越多：v-for 出来的几张表里，只有第一张表的 Tooltip 与 HoverCard 还贴着触发器，后面几张的离开触发器甚至出了视口。现在引擎把浮层自己的有效 `zoom`（`currentCSSZoom`）补进坐标系；不支持 `currentCSSZoom` 的浏览器行为不变。
