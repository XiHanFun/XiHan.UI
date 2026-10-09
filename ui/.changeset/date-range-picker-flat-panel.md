---
'@xihan-ui/headless': major
'@xihan-ui/styles': major
---

DateRangePicker 浮层与 DatePicker 同一套改版：面板自己不留内衬（`--xh-date-range-picker-content-py / -content-px` 缺省 0），浮层里的日历标题取常规字重（新增 `-heading-font-weight`）；两张日历并排不画竖线、不另留空当，两条标题栏分隔线首尾相接（退役 `-panel-gap / -panel-divider`）；快捷选项改为 24px 高的淡底小钮（静息淡底、悬停 200、按下 300，12px 次级前景、交互时换正文色（新增 `-preset-fg-hover`），选中仍画 12px 末端对号），列内衬 10 / 8px、项距 10px（`-preset-group-py / -preset-group-px` 取代 `-preset-group-padding`；新增 `-preset-bg / -preset-fg / -preset-h / -preset-font-size`，退役 `-preset-py / -preset-fg-selected`）。

showTime 的起止两组时间列：小标题占满与日历标题栏等高的顶带，时间列顶边的描边接着标题栏分隔线画过去；竖线改画在每一组的行内起始边（日历与起点组、起点组与终点组之间各一道），组内列与列之间不画线，两组之间不另留空当（`-column-group-gap` 缺省 0）；时间格改为 24px 高的通栏条、不取圆角，列内间距 8px（命中区向上下各补半个间距，缝里不落空），列底留白让末尾几格也能滚到列顶（`-time-column-py` 取代 `-time-column-padding`，退役 `-time-item-py`）。

确认钮改为 24px 高的小号主钮（headless 的 `data-xh-action-size` 由 `sm` 改为 `xs`），字取 12px（新增 `-confirm-trigger-font-size`），直接排在面板里时自带 8px 外边距（`-confirm-trigger-margin`）。
