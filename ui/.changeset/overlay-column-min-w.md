---
'@xihan-ui/tokens': patch
'@xihan-ui/styles': patch
---

新增两支语义令牌，把浮层时列的尺寸从各家皮肤的散值收成一处：`--xh-overlay-column-min-w`（3.5rem，成列排布的时 / 分 / 秒选项列的最小宽度）与 `--xh-overlay-column-item-h`（比小号控件行矮一档，列里一格的高度）；`time-picker` 与 `date-picker` 时列的 `column-min-w`、`time-picker` 的 `item-h` 这几条槽的默认值改读它们。`date-range-picker` 的 `range-separator-mx` 默认值先灌进私有槽再消费，对外契约不变。
