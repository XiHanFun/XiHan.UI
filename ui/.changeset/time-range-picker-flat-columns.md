---
'@xihan-ui/styles': major
---

TimeRangePicker 浮层与 TimePicker 同一套改版：面板自己不留内衬（`--xh-time-range-picker-content-py / -content-px` 缺省 0）；每列宽 64px、七格整行高，列底留白让末尾几格也能滚到列顶（新增 `-column-py`）；时间格改为 24px 高的通栏条、不取圆角，列内间距 8px；快捷选项改为 24px 高的淡底小钮（新增 `-preset-group-py / -preset-bg / -preset-h / -preset-font-size`，退役 `-preset-py / -preset-fg-checked`）。起止两组之间不再另留空当（`-column-group-gap` 缺省 0），只隔一道 border-default 竖线；组里的列顶画一道 border-default 线，把组顶小标题那一带与列分开，两组的线连成一条。
