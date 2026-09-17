---
"@xihan-ui/styles": minor
---

**`heatmap` 详情条改与 Tooltip 同一副气泡，默认渲染会变。** `[data-part='tooltip']` 补一圈
`var(--xh-stroke-thin)` 描边，颜色从字色里兑两成（`color-mix(in oklab, var(--xh-heatmap-tooltip-fg) 20%, transparent)`），
与 `tooltip` 的 content 同一算法——真源 §8.4 规定任何浮层的 content 都必须有非透明描边，不得只靠影分层；深浅主题
与作者换字色时描边跟着走。影由锚定浮层的 `--xh-elevation-floating` 改为 `--xh-material-frosted-compact-shadow`（frosted
紧凑档，与 Tooltip 同深）；字号由 `--xh-text-caption-size`（12px）改为 `--xh-control-caption-md`（13px，Tooltip 缺省档）。
反白底色、control 圆角、内衬与落点算法都不变。

**新增 1 个使用者覆盖槽**：`--xh-heatmap-tooltip-border`；`--xh-heatmap-tooltip-shadow` 与 `--xh-heatmap-tooltip-font-size`
的缺省值如上变更。check-elevation-role 登记 `heatmap.tooltip` 由 `floating` 改为 `frosted`。
