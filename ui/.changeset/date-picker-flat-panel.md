---
'@xihan-ui/headless': major
'@xihan-ui/styles': major
'@xihan-ui/tokens': major
---

DatePicker 浮层改版：面板自己不留内衬（`--xh-date-picker-content-py / -content-px` 缺省 0），标题栏与网格的内衬由日历给；浮层里的日历标题取常规字重（新增 `--xh-date-picker-heading-font-weight`）。两张日历并排不再画竖线、不另留空当，两条标题栏的分隔线首尾相接（退役 `--xh-date-picker-panel-gap / -panel-divider`）；日历与时间区、快捷选项列之间的分隔线改取 border-default 档。

快捷选项改为 24px 高的淡底小钮：静息淡底、悬停 / 高亮 200、按下 300，字取 12px 次级前景；选中仍画末端对号（12px），面与字重不变。快捷选项列内衬 10 / 8px、项距 10px（`-preset-group-py / -preset-group-px` 取代 `-preset-group-padding`；新增 `-preset-bg / -preset-fg / -preset-h / -preset-font-size`，退役 `-preset-py / -preset-fg-selected`）。

时间列：时间格改为 24px 高的通栏条、不取圆角，列内间距 8px 撑出 32px 行距，不再随尺寸档变高；列顶的上沿描边接着标题栏分隔线画过去，列与列之间不画线；列底留白让末尾几格也能滚到列顶（`-time-column-py` 取代 `-time-column-padding`，退役 `-time-item-py`）。`--xh-overlay-calendar-column-h` 改为与新日历网格同高（宽松 272px、紧凑 244px）。

确认钮改为 24px 高的小号主钮（headless 的 `data-xh-action-size` 由 `sm` 改为 `xs`），字取 12px（新增 `-confirm-trigger-font-size`）；直接排在面板里时自带 8px 外边距（`-confirm-trigger-margin`）。
