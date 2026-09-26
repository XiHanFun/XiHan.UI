---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/react": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

**新增** `cartesian-chart` 组件（直角坐标图），Vue、React 与 Web Components 三端可用：柱与折线共用一根自变量轴与一根数值轴，柱状图、条形图、分组与堆叠柱、折线、面积与百分比堆叠面积都是它的配置。

- 系列用 `mark` 区分画法，字段名把数据列映射到 `x` / `y`；比例尺按数据推断（类目、时间、数值、对数），有柱时数值轴强制包含 0。
- 颜色按系列次序取分类色 1–8，`slot` 固定色槽，`tone` 改用语气色；图例切换显隐后幸存系列颜色不变。
- 提示框缺省按键汇报同一个键上的全部系列（`trigger="axis"`），frosted 材质，画在根内；`activeKey` 受控即可让多张图在同一个键上联动。
- 绘图区是 `graphics-document`，只占一个 Tab 位，方向键在数据之间移动，折线由焦点代理点承接真实焦点；图例是工具条，按钮 `aria-pressed` 表示显隐。
- 组件在根内生成视觉隐藏的摘要与数据表；几何量（柱厚上限、线宽、点径、轴标签字体）以 CSS 组件槽为真源，挂载后读取。
- React 适配器的 SVG 文本属性 `text-anchor` 与 `dominant-baseline` 按 React 写法转换。
