---
'@xihan-ui/headless': major
'@xihan-ui/styles': major
'@xihan-ui/tokens': minor
---

TimePicker 浮层改版：面板自己不留内衬（`--xh-time-picker-content-py / -content-px` 缺省 0）；每列宽 64px、七格整行高 224px（紧凑 196px），列顶留 4px、列底留出一截空白，末尾几格（23 时、55–59 分）也能滚到列顶，几列的选中落在同一行（新增 `-column-py`）；列与列之间的分隔线与快捷选项列的分隔线改取 border-default 档。时间格改为 24px 高的通栏条、不取圆角，列内间距 8px 撑出 32px 行距，不再随尺寸档变高，命中区向上下各补半个间距、缝里不落空；选中仍是透明底 + 中等字重 + 末端对号。

快捷选项改为 24px 高的淡底小钮（静息淡底、悬停 200、按下 300，12px 次级前景、交互时换正文色（新增 `-preset-fg-hover`），选中仍画 12px 末端对号），列内衬 10 / 8px、项距 10px，限高与时间列同档（新增 `-preset-group-py / -preset-bg / -preset-h / -preset-font-size`，退役 `-preset-py / -preset-fg-checked`）。

多选的「添加」钮改为 24px 高的小号主钮（headless 的 `data-xh-action-size` 由 `sm` 改为 `xs`），字取 12px（新增 `-confirm-trigger-font-size`），自带 8px 外边距（`-confirm-trigger-margin` 取代 `-confirm-trigger-gap`）。

新增语义令牌 `--xh-overlay-time-column-w`（4rem）与 `--xh-overlay-time-column-h`（七格整行）。
