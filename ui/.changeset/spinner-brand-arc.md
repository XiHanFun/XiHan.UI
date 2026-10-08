---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': major
---

Spinner 与加载环改为品牌色的 270° 弧：

- Spinner 三档形态的弧色缺省由 `currentColor` 改为 `--xh-fg-brand`；环档不再画轨道，改为一段 270° 的弧、起始边留缺口（`--xh-spinner-track` 现在给缺口那一段上色，缺省透明）
- 加载环家族配方同一口径：占位、图表等处的环取品牌色；压在动作钮上的环（Button、Clipboard、DownloadTrigger、Popconfirm、Form 提交）仍随钮的字色
- 配文改为品牌色、正文字号、中等字重；新增组件槽 `--xh-spinner-label-weight`
- Spinner 新增 `orientation`（`horizontal` | `vertical`，缺省 `horizontal`，投影 `data-orientation`）：竖排时转圈在上、配文在下，间距 6px
- 强制色下弧取 Highlight、缺口取 Canvas
