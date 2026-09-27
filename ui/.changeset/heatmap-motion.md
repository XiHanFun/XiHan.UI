---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/react": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

热力图加上与其余图表同一套数据动效，新增 `animated` 属性（缺省开，Web Components 写 `animated="false"` 关闭）。

- 首次出现：网格、星期名、月份名与对照条原样在场，有颜色的格子从空格底色填到自己的档位色，按日期先后（矩阵按列先后）一路扫过去。扫描取 `--xh-motion-duration-reveal`，每格的填色取 `--xh-motion-duration-enter`。数据晚于挂载到达（异步取数，或 Web Components 连上之后才赋 `value`）同样播这段填色，三个适配器一致。
- 数据变化：各格从旧档的颜色过渡到新档，取 `--xh-motion-duration-morph` 与 `continuous` 曲线；只在这一段过渡，根上写 `data-animating`。格子原先常驻的 `background-color` 状态过渡随之撤掉，主题、语气与色板的换色改为一步到位，与其余图表一致。
- 减弱动效或容器写了 `data-motion="reduce"`：不再逐格扫过去，各格一起淡变填色；数据变化直接换色。
- 新关键帧 `xh-heatmap-fill` 随热力图皮肤自带；格子在填色途中带 `data-drawing` 与私有槽 `--xh-_chart-reveal-at`。
