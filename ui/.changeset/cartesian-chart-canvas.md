---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/react": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

直角坐标图的数据层可选画在画布上：`renderer: 'svg' | 'canvas' | 'auto'`，缺省 `auto`。

- `auto`：数据层逐个成节点的标记（柱、点、K 线、箱线……，折线与面积各算一条路径）超过 3000 个时改用画布，以内与 `svg` 完全一样。
- 画布只画数据层：坐标轴、网格、参考带与十字准线移到画布下面的垫层（新部件 `underlay`），画布是新部件 `canvas`；系列分组、注释、数据标签、激活的点、焦点代理与焦点环、摘要与数据表仍是 SVG / DOM。
- 颜色从 CSS 来：系列分组里放同部件、同状态、空几何的样式探针，画布逐帧读它们的计算样式——主题与暗色、强制色（画布上画系统色）、打印、纹理、作者对 `--xh-cartesian-chart-series-color` 的覆盖都照样生效；悬停图例时其余系列随分组的 CSS 过渡淡出，画布逐帧跟读。
- 后备尺寸按设备像素比，浏览器缩放与换屏后重画，打印时按至少 2 倍重画；重绘在宿主提交之后按微任务合并，与 SVG 层同帧。
- 键盘与读屏不变：绘图区占一个 Tab 位，进来后焦点落在锚点数据的焦点代理上（那根柱、那个点或那根 K 线的 SVG 版本，放回所属系列的分组、叠在画布上）。
- 画布上不播几何过渡：数据更新、图例切换与缩放直接画终态，画布整体随有无数据淡入淡出。
- Web Components 侧新增 `renderer` 属性与 `currentRenderer` 只读属性；垫层与画布由元素生成，作者照旧只写空的 `<svg>` plot。
