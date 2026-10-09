---
'@xihan-ui/headless': major
'@xihan-ui/styles': major
---

CalendarPicker 与 CalendarRangePicker 的格子与标题栏改版：标题栏改为上下 8px、左右 16px 内衬，下沿一道 1px 通栏分隔线（新增覆盖槽 `--xh-<组件>-header-py / -header-px / -header-border`），标题字重 600 → 500；年 / 月钮 24px 高、悬停换浅底而字色不变（退役 `--xh-<组件>-heading-trigger-fg-hover`，新增 `-heading-trigger-bg-hover`）；四颗翻页钮改为 24px 见方的圆（Action Control xs 档）。网格改为上下 12px、左右 16px 内衬（`-grid-py / -grid-px`），标题栏与网格、星期行与首行之间不再留空当；星期行 32px 高、正文字号常规字重；每列不窄于中号控件高（`-cell-min-w`），周期视图与日视图同宽。

日期格改为 24px 见方的圆，格子上下各 6px 内衬撑出 36px 行距（`-cell-py / -cell-px` 取代 `-cell-gap`），命中区铺满整格，按下只换面不缩放；邻月日字重回到常规（`-cell-font-weight-outside`）。今天改为数字下方一颗 4px 品牌圆点、数字保持正文色（`-today-mark-size / -today-mark-bg` 取代 `-today-bg / -today-border / -today-fg`），强制色下取系统前景、打印改由描边画满。不可用的日子铺整格淡底横条，相邻几天连成一条带（`-cell-bg-disabled / -disabled-inset`），不可用又选中的格退到再深一档的中性面。月 / 季 / 年格铺满格宽（左右各让 4px，`-period-px`）、24px 高、控件圆角，格间不留缝（退役 `-period-py`、`-year-grid-pe`）。

范围日历的区间轨道改为 32px 高（`--xh-calendar-range-picker-range-inset`，行距上下各收 2px），两端收成半圆帽，跨周折行处是直边（退役 `-range-row-radius`）；月份区间在一行里连成一条；强制色下落定的区间中段在轨道上下沿画实线。

Headless 的日历格与日期钮带上 `data-view`（当前视图），翻页钮、标题钮与日期格的 `data-xh-action-size` 由 `sm` 改为 `xs`。
